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
import { useGetConversationsQuery, useGetMessagesQuery, useUpdatePurchaseRequestMutation, useDeleteConversationMutation, apiSlice } from "../features/api/apiSlice"
import { useDispatch } from "react-redux"

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
  const [deleteConversationMutation] = useDeleteConversationMutation()
  const dispatch = useDispatch<any>()
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, conversationId: string | null }>({ visible: false, x: 0, y: 0, conversationId: null })
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
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
        // INSTANTLY update unread count in Redux cache to 0
        dispatch(
          apiSlice.util.updateQueryData('getConversations', undefined, (draft: any) => {
            const conv = draft.find((c: any) => c._id === activeConversationId);
            if (conv) {
              conv.myUnreadCount = 0;
            }
          })
        );
        
        // Mark read on backend
        fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}/api/chat/read/${activeConversationId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(() => {
          // Emit mark_read to socket
          if (socket) {
             const conv = conversations.find((c: any) => c._id === activeConversationId);
             if (conv) {
               const partner = conv.buyerId._id === user?.id ? conv.sellerId : conv.buyerId;
               socket.emit('mark_read', { conversationId: activeConversationId, senderId: partner?._id })
             }
          }
        }).catch(console.error)
      }
    }
  }, [activeConversationId, historyMessages, dispatch, conversations, socket])

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
    const handleClickOutside = () => {
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false })
    }
    window.addEventListener('keydown', handleEsc)
    window.addEventListener('click', handleClickOutside)
    return () => {
       window.removeEventListener('keydown', handleEsc)
       window.removeEventListener('click', handleClickOutside)
    }
  }, [isModal, onClose, contextMenu.visible])

  const handleDeleteConversation = async (convId: string) => {
    if (window.confirm("Delete this conversation? This action cannot be undone.")) {
      try {
        await deleteConversationMutation(convId).unwrap();
        // Optimistically remove from cache
        dispatch(
          apiSlice.util.updateQueryData('getConversations', undefined, (draft: any) => {
            return draft.filter((c: any) => c._id !== convId);
          })
        );
        if (activeConversationId === convId) {
          setSearchParams({});
        }
      } catch (err) {
        console.error("Failed to delete conversation", err);
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, conversationId: convId });
  }

  const handleTouchStart = (e: React.TouchEvent, convId: string) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ visible: true, x: touch.clientX, y: touch.clientY, conversationId: convId });
    }, 600); // 600ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }

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
      <Card className={`${isModal ? 'w-full h-full rounded-none border-0' : 'w-full h-full md:h-[calc(100vh-100px)] rounded-none md:rounded-3xl border-0 md:border-white/10'} flex overflow-hidden shadow-2xl backdrop-blur-xl bg-slate-900 md:bg-white/5 relative`}>
        {/* SIDEBAR */}
        <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-white/10 bg-slate-900/95 ${activeConversationId ? 'hidden md:flex' : 'flex'} flex-col relative z-20 shrink-0`}>
          <div className="h-[75px] px-5 border-b border-white/10 bg-slate-900/50 flex flex-col justify-center shrink-0">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-400" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            {conversations.filter((c: any) => c.lastMessage).map((conv: any) => {
              const partner = getOtherUser(conv)
              const isActive = conv._id === activeConversationId
              const unread = conv.myUnreadCount || 0
              const partnerOnline = onlineUsers.has(partner?._id)
              
              return (
                <div 
                  key={conv._id}
                  onClick={() => setSearchParams({ conversationId: conv._id })}
                  onContextMenu={(e) => handleContextMenu(e, conv._id)}
                  onTouchStart={(e) => handleTouchStart(e, conv._id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={`flex flex-col p-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-primary-600 shadow-md' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm shrink-0 bg-slate-800 relative">
                       <img src={partner?.profilePicture || getMaleAvatarForUser(partner?.name)} alt={partner?.name} className="w-full h-full object-cover" />
                       {partnerOnline && (
                         <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full z-10"></span>
                       )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={`font-bold text-sm truncate pr-2 text-white`}>{partner?.name || 'User'}</h4>
                        {conv.lastMessageTime && (
                          <span className={`text-[10px] shrink-0 font-medium ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{formatTimeAgo(conv.lastMessageTime)}</span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-white/90' : (unread > 0 ? 'text-white font-bold' : 'text-slate-400')}`}>
                        {conv.lastMessage || 'Start of conversation'}
                      </p>
                    </div>
                  </div>
                  
                  {conv.type !== 'DIRECT_CHAT' && (
                    <div className={`mt-2 flex items-center gap-2 p-1.5 rounded-lg border ${isActive ? 'bg-black/20 border-black/10 text-white' : 'bg-white/5 border-white/5 text-slate-300'} text-xs`}>
                      <img src={getProductImage(conv.productId?.images)} className="w-6 h-6 object-cover rounded shadow-sm shrink-0" alt="" />
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
            {conversations.length === 0 && (
              <div className="text-center text-slate-500 py-10 text-sm">
                No active conversations
              </div>
            )}
          </div>
        </div>
        
        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0A0A0A]">
          {activeConversationId ? (
            <>
              {/* HEADER */}
              <div className="h-[75px] px-4 md:px-6 border-b border-white/10 flex items-center justify-between gap-4 bg-[#121212]/95 backdrop-blur-xl z-20 shrink-0 shadow-sm w-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-[#1A1A1A] shrink-0 relative">
                     <img src={otherUser?.profilePicture || getMaleAvatarForUser(otherUser?.name)} alt={otherUser?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-base text-white truncate flex items-center gap-2">
                      {otherUser?.name || "User"}
                      {isOtherUserOnline ? (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 whitespace-nowrap">Online</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                          {otherUser?.lastSeen ? `Last seen ${formatTimeAgo(otherUser.lastSeen)}` : 'Offline'}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-primary-400 mt-0.5 h-4">
                      {typingUsers.has(activeConversationId) ? 'typing...' : ''}
                    </p>
                  </div>
                </div>
                
                {activeConversation?.type !== 'DIRECT_CHAT' && activeConversation?.productId && (
                  <Link to={`/products/${activeConversation.productId._id}`} onClick={() => onClose && onClose()} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 pr-4 transition-colors shrink-0 max-w-[200px] sm:max-w-xs">
                    <img src={getProductImage(activeConversation.productId.images)} className="w-10 h-10 object-cover rounded-lg shadow-sm shrink-0" />
                    <div className="flex flex-col min-w-0 hidden sm:flex">
                      <span className="text-white text-xs font-bold truncate">{activeConversation.productId.title}</span>
                      <span className="text-[#25D366] font-bold text-xs">₹{activeConversation.productId.price?.toLocaleString('en-IN')}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                  </Link>
                )}
              </div>

              {/* MESSAGES LIST */}
              <div 
                ref={chatContainerRef} 
                onScroll={handleScroll} 
                className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-4 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full overflow-x-hidden"
              >
                {loadingHistory && (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary-500"/></div>
                )}
                
                {liveMessages.map((msg: any, idx) => {
                  const isMe = msg.senderId === user?.id || msg.senderId?._id === user?.id
                  
                  if (msg.type === 'system') {
                    return (
                      <div key={idx} className="flex justify-center my-6">
                        <div className="bg-white/10 text-slate-300 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-md">
                          {msg.text}
                        </div>
                      </div>
                    )
                  }

                  if (msg.type === 'purchase_request') {
                    const isSeller = activeConversation?.sellerId?._id === user?.id || activeConversation?.sellerId === user?.id
                    return (
                      <div key={idx} className="flex justify-center my-6 w-full">
                        <Card className="w-full max-w-sm border-white/10 shadow-xl bg-[#1A1A1A] overflow-hidden text-slate-200">
                          <div className="bg-primary-900/30 p-3 text-center border-b border-white/5">
                            <h4 className="font-bold text-primary-400 flex justify-center gap-2 items-center text-sm">
                              <ShieldCheck className="w-4 h-4"/> Purchase Request
                            </h4>
                          </div>
                          <div className="p-4 space-y-4">
                            <p className="text-sm font-medium whitespace-pre-wrap break-words">{msg.text}</p>
                            {msg.productId && (
                              <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex gap-3">
                                  <img src={getProductImage(msg.productId.images)} className="w-16 h-16 object-cover rounded-lg shadow-sm shrink-0 border border-white/10"/>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-sm truncate text-white">{msg.productId.title}</p>
                                  <p className="text-[#25D366] font-bold">₹{msg.productId.price?.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            )}
                            
                            {isSeller && msg.purchaseRequestId && (
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white gap-1 border-none" onClick={() => handleRequestAction(msg.purchaseRequestId, 'Accepted')}>
                                  <Check className="w-4 h-4"/> Accept
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 text-rose-400 hover:bg-rose-500 hover:text-white gap-1 border-rose-500/30 bg-transparent" onClick={() => handleRequestAction(msg.purchaseRequestId, 'Rejected')}>
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
                    <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] p-3 px-4 ${isMe ? 'bg-[#6C3BFF] text-white rounded-2xl rounded-br-sm' : 'bg-[#202020] text-slate-100 rounded-2xl rounded-bl-sm'} shadow-sm`}>
                        <p className="leading-relaxed text-[15px] whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end text-white/70' : 'justify-start text-slate-400'}`}>
                          <span className="text-[10px] font-medium tracking-wide">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isMe && (
                            <span className="ml-1">
                              {msg.read ? <CheckCheck className="w-3.5 h-3.5 text-[#4ade80]" /> : <Check className="w-3.5 h-3.5 text-white/70" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              
              {/* SCROLL TO BOTTOM BUTTON */}
              {showScrollButton && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                  <button 
                    onClick={scrollToBottom}
                    className="bg-[#202020] text-white shadow-xl rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2 animate-bounce transition-colors border border-white/10 hover:bg-[#2A2A2A]"
                  >
                    <ArrowDown className="w-4 h-4" /> New Messages
                  </button>
                </div>
              )}

              {/* MESSAGE COMPOSER */}
              <div className="p-4 bg-[#121212] border-t border-white/10 shrink-0 relative z-30 w-full">
                <form onSubmit={sendMessage} className="flex gap-2 items-end w-full max-w-5xl mx-auto">
                  <div className="flex-1 relative bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-inner">
                    <textarea 
                      value={inputMsg}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Message... (Shift+Enter for new line)" 
                      className="w-full max-h-[120px] min-h-[50px] px-4 py-3.5 bg-transparent text-white placeholder-slate-500 caret-primary-500 focus:outline-none resize-none overflow-y-auto block [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full leading-relaxed text-sm sm:text-base"
                      rows={1}
                      style={{ height: "auto" }}
                    />
                  </div>
                  <Button type="submit" disabled={!inputMsg.trim()} size="icon" className="w-[50px] h-[50px] rounded-2xl shrink-0 bg-[#6C3BFF] hover:bg-[#8B5CF6] text-white border-none transition-all disabled:opacity-50 disabled:hover:bg-[#6C3BFF]">
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-[#0A0A0A]">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                 <MessageSquare className="w-10 h-10 text-slate-600" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
               <p className="text-slate-500 text-sm max-w-xs text-center">Choose an existing conversation from the sidebar or start a new one.</p>
            </div>
          )}
        </div>
      </Card>
  )

  return isModal ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]" onClick={onClose}></div>
      <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] lg:w-[80vw] max-w-[1400px] z-10 animate-in zoom-in-95 duration-200 bg-[#0A0A0A] md:rounded-3xl flex overflow-hidden shadow-2xl border-0 md:border md:border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors border border-white/10 z-50">
          <X className="w-5 h-5" />
        </button>
        {chatContent}
        
        {/* Context Menu */}
        {contextMenu.visible && contextMenu.conversationId && (
          <div 
            className="fixed z-[9999] bg-[#222222] border border-white/10 shadow-2xl rounded-xl py-1 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: Math.min(contextMenu.y, window.innerHeight - 50), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-white/5 flex items-center gap-2 font-medium"
              onClick={() => {
                setContextMenu({ ...contextMenu, visible: false });
                handleDeleteConversation(contextMenu.conversationId!);
              }}
            >
              <X className="w-4 h-4" /> Delete Chat
            </button>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden relative">
      {chatContent}

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.conversationId && (
        <div 
          className="fixed z-[9999] bg-[#222222] border border-white/10 shadow-2xl rounded-xl py-1 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 50), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-white/5 flex items-center gap-2 font-medium"
            onClick={() => {
              setContextMenu({ ...contextMenu, visible: false });
              handleDeleteConversation(contextMenu.conversationId!);
            }}
          >
            <X className="w-4 h-4" /> Delete Chat
          </button>
        </div>
      )}
    </div>
  )
}
