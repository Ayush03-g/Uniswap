import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { io, Socket } from "socket.io-client"
import { Card } from "../components/ui/Card"
import { getProductImage } from "../utils/image"
import { getMaleAvatarForUser } from "../utils/avatar"
import { Button } from "../components/ui/Button"
import { Send, User as UserIcon, MessageSquare, ShieldCheck, Check, CheckCheck, X, Loader2, ArrowDown, ExternalLink } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { useGetConversationsQuery, useGetMessagesQuery, useUpdatePurchaseRequestMutation } from "../features/api/apiSlice"

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export function Chat({ isModal = false, modalConversationId = null, onClose }: { isModal?: boolean; modalConversationId?: string | null; onClose?: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlConversationId = searchParams.get("conversationId")
  const activeConversationId = isModal ? modalConversationId : urlConversationId
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [liveMessages, setLiveMessages] = useState<any[]>([])
  const [inputMsg, setInputMsg] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  
  const { data: conversations = [], refetch: refetchConversations } = useGetConversationsQuery(undefined, { skip: !user })
  const { data: historyMessages = [], isLoading: loadingHistory } = useGetMessagesQuery(activeConversationId, { skip: !activeConversationId })
  const [updatePurchaseRequest] = useUpdatePurchaseRequestMutation()
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const atBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsAtBottom(atBottom)
    if (atBottom) setShowScrollButton(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollButton(false)
  }

  const prevConversationId = useRef<string | null>(null)

  useEffect(() => {
    if (activeConversationId && historyMessages && prevConversationId.current !== activeConversationId) {
      if (historyMessages.length > 0 && historyMessages[0].conversationId !== activeConversationId) {
        return; 
      }
      
      prevConversationId.current = activeConversationId
      setLiveMessages(historyMessages)
      setIsAtBottom(false)
      setShowScrollButton(false)
      
      if (activeConversationId) {
        // Mark read
        fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}/api/chat/read/${activeConversationId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(() => {
          if (typeof refetchConversations === 'function') refetchConversations()
          
          // Emit mark_read to socket
          if (socket && activeConversation) {
             const partner = getOtherUser(activeConversation)
             socket.emit('mark_read', { conversationId: activeConversationId, senderId: partner?._id })
          }
        }).catch(console.error)
      }
    }
  }, [activeConversationId, historyMessages, refetchConversations, socket])

  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    } else if (liveMessages.length > 0 && !isAtBottom) {
      setShowScrollButton(true)
    }
  }, [liveMessages])

  useEffect(() => {
    if (!user) return
    const newSocket = io(import.meta.env.VITE_API_URL, {
      query: { userId: user.id }
    })
    setSocket(newSocket)

    newSocket.on("receive_message", (message) => {
      setLiveMessages(prev => {
        // Avoid duplicates if same message arrives
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message]
      })
      refetchConversations()
      
      // If the message belongs to active conversation, mark read immediately
      if (activeConversationId === message.conversationId) {
         fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}/api/chat/read/${activeConversationId}`, {
           method: "PUT",
           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
         }).then(() => {
           newSocket.emit('mark_read', { conversationId: activeConversationId, senderId: message.senderId })
           refetchConversations()
         })
      }
    })
    
    newSocket.on("user_online", (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId))
    })
    
    newSocket.on("user_offline", (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    newSocket.on("typing", ({ conversationId }) => {
      if (conversationId === activeConversationId) {
         setTypingUsers(prev => new Set(prev).add(conversationId))
      }
    })

    newSocket.on("stop_typing", ({ conversationId }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        next.delete(conversationId)
        return next
      })
    })
    
    newSocket.on("messages_read", ({ conversationId }) => {
      if (conversationId === activeConversationId) {
         setLiveMessages(prev => prev.map(msg => ({ ...msg, read: true, readAt: Date.now() })))
      }
    })

    return () => {
      newSocket.close()
    }
  }, [user, refetchConversations, activeConversationId])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModal && onClose) onClose();
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isModal, onClose])

  const activeConversation = conversations.find((c: any) => c._id === activeConversationId)
  const getOtherUser = (conv: any) => {
    if (!conv) return null
    return conv.buyerId._id === user?.id ? conv.sellerId : conv.buyerId
  }
  const otherUser = getOtherUser(activeConversation)
  const isOtherUserOnline = onlineUsers.has(otherUser?._id)

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMsg(e.target.value)
    
    if (socket && otherUser) {
       socket.emit('typing', { conversationId: activeConversationId, receiverId: otherUser._id })
       
       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
       typingTimeoutRef.current = setTimeout(() => {
         socket.emit('stop_typing', { conversationId: activeConversationId, receiverId: otherUser._id })
       }, 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e as any)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    if (e.preventDefault) e.preventDefault()
    if (!inputMsg.trim() || !activeConversationId) return
    
    const msgText = inputMsg
    setInputMsg("")
    
    if (socket && otherUser) {
      socket.emit('stop_typing', { conversationId: activeConversationId, receiverId: otherUser._id })
    }
    
    try {
      setIsAtBottom(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          text: msgText
        })
      })
      const data = await res.json()
      // optimistic ui update could be here, but receive_message will handle it 
      // if we are sender, receive_message doesn't fire for us from server in this implementation
      // actually, the server route sends a 201 response. We should manually add it to live messages
      setLiveMessages(prev => [...prev, data])
      refetchConversations()
      scrollToBottom()
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleRequestAction = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    try {
      await updatePurchaseRequest({ id: requestId, status }).unwrap()
      alert(`Request ${status}`)
    } catch (err) {
      console.error(err)
      alert("Failed to update request")
    }
  }

  const chatContent = (
      <Card className={`${isModal ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[80vh] rounded-3xl'} flex overflow-hidden border-white/20 shadow-2xl backdrop-blur-xl bg-white/40 relative`}>
        <div className={`w-full md:w-[320px] border-r border-slate-200/50 bg-white/80 ${activeConversationId ? 'hidden md:flex' : 'flex'} flex-col backdrop-blur-md relative z-20 shrink-0`}>
          <div className="p-5 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {conversations.filter((c: any) => c.lastMessage).map((conv: any) => {
              const partner = getOtherUser(conv)
              const isActive = conv._id === activeConversationId
              const unread = conv.myUnreadCount || 0
              const partnerOnline = onlineUsers.has(partner?._id)
              
              return (
                <div 
                  key={conv._id}
                  onClick={() => setSearchParams({ conversationId: conv._id })}
                  className={`flex flex-col p-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-primary-500 shadow-md text-white' : 'bg-transparent hover:bg-slate-100/60 text-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm shrink-0 bg-slate-200 relative">
                       <img src={partner?.profilePicture || getMaleAvatarForUser(partner?.name)} alt={partner?.name} className="w-full h-full object-cover" />
                       {partnerOnline && (
                         <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span>
                       )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={`font-bold text-sm truncate pr-2 ${isActive ? 'text-white' : 'text-slate-800'}`}>{partner?.name || 'User'}</h4>
                        {conv.lastMessageTime && (
                          <span className={`text-[10px] shrink-0 font-medium ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>{formatTimeAgo(conv.lastMessageTime)}</span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-primary-100' : (unread > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500')}`}>
                        {conv.lastMessage || 'Start of conversation'}
                      </p>
                    </div>
                  </div>
                  
                  {conv.type !== 'DIRECT_CHAT' && (
                    <div className={`mt-2 flex items-center gap-2 p-1.5 rounded-lg border ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50/50 border-slate-200/50 text-slate-600'} text-xs`}>
                      <img src={getProductImage(conv.productId?.images)} className="w-6 h-6 object-cover rounded shadow-sm" alt="" />
                      <span className="truncate flex-1 font-medium">{conv.productId?.title}</span>
                      {unread > 0 && (
                        <span className="bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px] shadow-sm">
                          {unread}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-900">
          {activeConversationId ? (
            <>
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[20px] scale-110 opacity-60"
                style={{ backgroundImage: `url(${activeConversation?.type === 'DIRECT_CHAT' ? '' : getProductImage(activeConversation?.productId?.images)})` }}
              />
              <div className="absolute inset-0 z-0 bg-black/85" />

              <div className="h-[75px] px-4 md:px-5 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl z-10 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-[#1A1A1A] shadow-sm relative">
                     <img src={otherUser?.profilePicture || getMaleAvatarForUser(otherUser?.name)} alt={otherUser?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-base text-white truncate drop-shadow-sm leading-tight flex items-center gap-2">
                      {otherUser?.name || "User"}
                      {isOtherUserOnline ? (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Online</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {otherUser?.lastSeen ? `Last seen ${formatTimeAgo(otherUser.lastSeen)}` : 'Offline'}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-primary-300 mt-1 h-4">
                      {typingUsers.has(activeConversationId) ? 'typing...' : ''}
                    </p>
                  </div>
                </div>
                
                {activeConversation?.type !== 'DIRECT_CHAT' && activeConversation?.productId && (
                  <Link to={`/products/${activeConversation.productId._id}`} onClick={() => onClose && onClose()} className="hidden sm:flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 pr-4 transition-colors">
                    <img src={getProductImage(activeConversation.productId.images)} className="w-10 h-10 object-cover rounded-lg shadow-sm" />
                    <div className="flex flex-col max-w-[140px]">
                      <span className="text-white text-xs font-bold truncate">{activeConversation.productId.title}</span>
                      <span className="text-[#25D366] font-bold text-xs">₹{activeConversation.productId.price?.toLocaleString('en-IN')}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 ml-2" />
                  </Link>
                )}
              </div>

              <div 
                ref={chatContainerRef} 
                onScroll={handleScroll} 
                className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar overflow-x-hidden pb-10"
              >
                {loadingHistory && (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary-500"/></div>
                )}
                {liveMessages.map((msg: any, idx) => {
                  const isMe = msg.senderId === user?.id || msg.senderId?._id === user?.id
                  
                  if (msg.type === 'system') {
                    return (
                      <div key={idx} className="flex justify-center my-4">
                        <div className="bg-slate-800/80 text-slate-300 px-4 py-2 rounded-full text-xs font-medium border border-white/10 backdrop-blur-md">
                          {msg.text}
                        </div>
                      </div>
                    )
                  }

                  if (msg.type === 'purchase_request') {
                    const isSeller = activeConversation?.sellerId?._id === user?.id || activeConversation?.sellerId === user?.id
                    return (
                      <div key={idx} className="flex justify-center my-6">
                        <Card className="w-full max-w-sm border-slate-700/50 shadow-2xl bg-slate-800/80 backdrop-blur-xl overflow-hidden text-slate-200">
                          <div className="bg-primary-900/30 p-3 text-center border-b border-white/10">
                            <h4 className="font-bold text-primary-300 flex justify-center gap-2 items-center">
                              <ShieldCheck className="w-5 h-5"/> Purchase Request
                            </h4>
                          </div>
                          <div className="p-4 space-y-4">
                            <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                            {msg.productId && (
                              <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex gap-3">
                                  <img src={getProductImage(msg.productId.images)} className="w-16 h-16 object-cover rounded-lg shadow-sm border border-white/10"/>
                                <div>
                                  <p className="font-bold text-sm truncate text-white">{msg.productId.title}</p>
                                  <p className="text-[#25D366] font-bold">₹{msg.productId.price?.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            )}
                            
                            {isSeller && msg.purchaseRequestId && (
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-500 text-white gap-1 border-none" onClick={() => handleRequestAction(msg.purchaseRequestId, 'Accepted')}>
                                  <Check className="w-4 h-4"/> Accept
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 text-rose-400 hover:bg-rose-500 hover:text-white gap-1 border-rose-500/50" onClick={() => handleRequestAction(msg.purchaseRequestId, 'Rejected')}>
                                  <X className="w-4 h-4"/> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    )
                  }

                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 px-4 ${isMe ? 'bg-[#6C3BFF] text-white rounded-2xl rounded-br-sm shadow-[0_4px_15px_rgba(108,59,255,0.3)]' : 'bg-[#202020] text-slate-100 border border-white/10 rounded-2xl rounded-bl-sm shadow-md'} backdrop-blur-md`}>
                        <p className="leading-relaxed text-[15px] whitespace-pre-wrap font-medium">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end text-primary-200' : 'justify-start text-slate-400'}`}>
                          <span className="text-[10px] font-medium tracking-wide">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isMe && (
                            <span className="ml-1">
                              {msg.read ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" /> : <Check className="w-3.5 h-3.5 text-slate-300" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              
              {showScrollButton && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                  <button 
                    onClick={scrollToBottom}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-xl rounded-full px-5 py-2 text-sm font-bold flex items-center gap-2 animate-bounce transition-colors backdrop-blur-md border border-white/10"
                  >
                    <ArrowDown className="w-4 h-4" /> New Messages
                  </button>
                </div>
              )}

              <div className="p-3 bg-slate-900/80 border-t border-white/10 shrink-0 relative z-30 backdrop-blur-2xl w-full">
                <form onSubmit={sendMessage} className="flex gap-2 items-end w-full max-w-4xl mx-auto">
                  <div className="flex-1 relative bg-slate-800/80 border border-white/10 rounded-3xl overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-inner">
                    <textarea 
                      value={inputMsg}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message... (Shift+Enter for new line)" 
                      className="w-full max-h-32 min-h-[48px] px-4 py-3 bg-transparent text-white placeholder-slate-400 caret-primary-500 focus:outline-none resize-none overflow-y-auto block custom-scrollbar leading-relaxed"
                      rows={1}
                      style={{ height: "auto" }}
                    />
                  </div>
                  <Button type="submit" disabled={!inputMsg.trim()} size="icon" className="w-12 h-12 rounded-full shadow-[0_4px_15px_rgba(108,59,255,0.4)] shrink-0 bg-gradient-to-br from-[#6C3BFF] to-[#8B5CF6] hover:scale-105 text-white border-none transition-all disabled:opacity-50 disabled:hover:scale-100">
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900 relative">
               <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-3xl z-0"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-lg">
                   <MessageSquare className="w-10 h-10 text-slate-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-300 mb-2">Your Messages</h3>
                 <p className="text-slate-500 max-w-xs text-center text-sm">Select a conversation from the sidebar or start a new chat from a product page.</p>
               </div>
            </div>
          )}
        </div>
      </Card>
  )

  return isModal ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[12px]" onClick={onClose}></div>
      <div className="relative w-full md:w-[80vw] lg:w-[75vw] max-w-[1200px] h-[80vh] z-10 animate-in zoom-in-95 duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl bg-white flex overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors border border-white/20 shadow-sm z-50">
          <X className="w-5 h-5" />
        </button>
        {chatContent}
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      {chatContent}
    </div>
  )
}
