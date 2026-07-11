import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { io, Socket } from "socket.io-client"
import { Card } from "../components/ui/Card"
import { getProductImage } from "../utils/image"
import { getMaleAvatarForUser } from "../utils/avatar"
import { Button } from "../components/ui/Button"
import { Send, User as UserIcon, MessageSquare, ShieldCheck, Check, X, Loader2, ArrowDown } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { useGetConversationsQuery, useGetMessagesQuery, useUpdatePurchaseRequestMutation } from "../features/api/apiSlice"

export function Chat({ isModal = false, modalConversationId = null, onClose }: { isModal?: boolean; modalConversationId?: string | null; onClose?: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlConversationId = searchParams.get("conversationId")
  const activeConversationId = isModal ? modalConversationId : urlConversationId
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [liveMessages, setLiveMessages] = useState<any[]>([])
  const [inputMsg, setInputMsg] = useState("")
  
  const { data: conversations = [], refetch: refetchConversations } = useGetConversationsQuery(undefined, { skip: !user })
  const { data: historyMessages = [], isLoading: loadingHistory } = useGetMessagesQuery(activeConversationId, { skip: !activeConversationId })
  const [updatePurchaseRequest] = useUpdatePurchaseRequestMutation()
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

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
      
      fetch(`http://localhost:5000/api/chat/read/${activeConversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(() => {
        if (typeof refetchConversations === 'function') refetchConversations()
      }).catch(console.error)
    }
  }, [activeConversationId, historyMessages, refetchConversations])

  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    } else if (liveMessages.length > 0 && !isAtBottom) {
      setShowScrollButton(true)
    }
  }, [liveMessages])

  useEffect(() => {
    if (!user) return
    const newSocket = io("http://localhost:5000", {
      query: { userId: user.id }
    })
    setSocket(newSocket)

    newSocket.on("receive_message", (message) => {
      setLiveMessages(prev => [...prev, message])
      refetchConversations()
    })

    return () => {
      newSocket.close()
    }
  }, [user, refetchConversations])

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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || !activeConversationId) return
    
    try {
      setIsAtBottom(true)
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          text: inputMsg
        })
      })
      const data = await res.json()
      setInputMsg("")
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
        <div className={`w-full md:w-[260px] lg:w-[280px] border-r border-slate-200/50 bg-white/80 ${activeConversationId ? 'hidden md:flex' : 'flex'} flex-col backdrop-blur-md relative z-20 shrink-0`}>
          <div className="p-5 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.filter((c: any) => c.lastMessage).map((conv: any) => {
              const partner = getOtherUser(conv)
              const isActive = conv._id === activeConversationId
              return (
                <div 
                  key={conv._id}
                  onClick={() => setSearchParams({ conversationId: conv._id })}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-primary-500 shadow-md text-white' : 'bg-transparent hover:bg-slate-100/60 text-slate-700'}`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-200 relative flex items-center justify-center">
                    {conv.type === 'DIRECT_CHAT' ? (
                       <img src={partner?.profilePicture || getMaleAvatarForUser(partner?.name)} alt={partner?.name} className="w-full h-full object-cover" />
                    ) : (
                       <img src={getProductImage(conv.productId?.images)} alt="Product" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>{partner?.name || 'User'}</h4>
                      {conv.lastMessageTime && (
                        <span className={`text-[10px] shrink-0 font-medium ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>{new Date(conv.lastMessageTime).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-primary-100' : 'text-slate-500'}`}>{conv.lastMessage || 'Start of conversation'}</p>
                  </div>
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
              <div className="absolute inset-0 z-0 bg-black/75" />

              <div className="h-[70px] px-4 md:px-5 border-b border-white/10 flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl z-10 shrink-0 shadow-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-[#1A1A1A] shadow-sm flex-shrink-0">
                  {activeConversation?.type === 'DIRECT_CHAT' ? (
                     <img src={otherUser?.profilePicture || getMaleAvatarForUser(otherUser?.name)} alt={otherUser?.name} className="w-full h-full object-cover" />
                  ) : (
                     <img src={getProductImage(activeConversation?.productId?.images)} alt="Product" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 w-full">
                    {activeConversation?.type === 'DIRECT_CHAT' ? (
                       <div className="flex flex-col justify-center">
                         <h3 className="font-bold text-base text-white truncate drop-shadow-sm leading-tight">{otherUser?.name || "User"}</h3>
                         <p className="text-xs text-slate-400 mt-1">Direct Conversation</p>
                       </div>
                    ) : (
                       <div className="flex flex-col justify-center overflow-hidden">
                         <h3 className="font-bold text-base text-white truncate drop-shadow-sm leading-tight">
                           {activeConversation?.productId?.title || "Product"}
                         </h3>
                         <div className="flex flex-wrap items-center gap-x-2 mt-1 text-xs text-slate-300">
                           <span className="text-[#25D366] font-bold tracking-wide">₹{activeConversation?.productId?.price?.toLocaleString('en-IN') || "0"}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                           <span className="font-medium flex items-center gap-1 shrink-0">
                             <UserIcon className="w-3 h-3" /> {otherUser?.name || "User"}
                           </span>
                           <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0 hidden sm:block"></span>
                           <span className="opacity-80 truncate hidden sm:block">({activeConversation?.productId?.category} • {activeConversation?.productId?.condition})</span>
                         </div>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div 
                ref={chatContainerRef} 
                onScroll={handleScroll} 
                className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar overflow-x-hidden"
              >
                {loadingHistory && (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary-500"/></div>
                )}
                {liveMessages.map((msg: any, idx) => {
                  const isMe = msg.senderId === user?.id || msg.senderId?._id === user?.id
                  
                  if (msg.type === 'system') {
                    return (
                      <div key={idx} className="flex justify-center my-4">
                        <div className="bg-slate-200 text-slate-600 px-4 py-2 rounded-full text-xs font-medium">
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
                      <div className={`max-w-[65%] p-2.5 px-3.5 ${isMe ? 'bg-primary-600 text-white rounded-xl rounded-tr-sm shadow-md' : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-xl rounded-tl-sm shadow-md'} backdrop-blur-md`}>
                        <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end text-primary-200' : 'justify-start text-slate-400'}`}>
                          <span className="text-[10px] font-medium tracking-wide">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
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

              <div className="p-3 bg-slate-900/60 border-t border-white/10 shrink-0 relative z-30 backdrop-blur-xl w-full">
                <form onSubmit={sendMessage} className="flex gap-2 items-center w-full">
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 px-4 py-3 rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-800/80 text-white placeholder-slate-400 caret-primary-500 transition-all shadow-inner"
                  />
                  <Button type="submit" size="icon" className="w-11 h-11 rounded-full shadow-soft-lg shrink-0 bg-primary-600 hover:bg-primary-700 text-white border-none">
                    <Send className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900 relative">
               <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-3xl z-0"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <MessageSquare className="w-16 h-16 text-slate-700 mb-4" />
                 <h3 className="text-xl font-bold text-slate-300 mb-2">No Chat Selected</h3>
               </div>
            </div>
          )}
        </div>
      </Card>
  )

  return isModal ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[12px]" onClick={onClose}></div>
      <div className="relative w-full md:w-[72vw] lg:w-[68vw] max-w-[1100px] h-[75vh] z-10 animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl bg-white flex overflow-hidden">
        <button onClick={onClose} className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors border border-white/20 shadow-sm z-50">
          <X className="w-6 h-6" />
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
