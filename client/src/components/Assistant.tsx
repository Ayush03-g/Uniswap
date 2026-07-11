import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Loader2 } from "lucide-react"
import { useChatWithAIMutation } from "../features/api/apiSlice"

const MAIN_QUESTIONS = [
  "Sell a Product",
  "Buy a Product",
  "Upload Notes",
  "Contact Seller"
]

const ALL_QUESTIONS = [
  "How do I sell a product?",
  "How do I buy an item?",
  "How do I upload notes?",
  "How does Add to Cart work?",
  "How do I contact a seller?",
  "Can I edit my listing?",
  "How do Categories work?",
  "How do I search products?"
]

export function Assistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false)
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "👋 Hi! I'm UniSwap AI.\n\nHow can I help you today?"
    }
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [chatWithAI, { isLoading }] = useChatWithAIMutation()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (!sessionStorage.getItem('uniswap_welcome_shown')) {
      const timer = setTimeout(() => {
        setShowWelcomeBubble(true)
        sessionStorage.setItem('uniswap_welcome_shown', 'true')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (showWelcomeBubble) {
      const hideTimer = setTimeout(() => {
        setShowWelcomeBubble(false)
      }, 8000)
      return () => clearTimeout(hideTimer)
    }
  }, [showWelcomeBubble])

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage = { role: 'user', content: text }
    const history = [...messages]
    
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const response = await chatWithAI({ history, message: text }).unwrap()
      setMessages(prev => [...prev, { role: 'model', content: response.message }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't connect to my brain. Please try again later." }])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  return (
    <>
      {/* Welcome Bubble */}
      {showWelcomeBubble && !isOpen && (
        <div className="fixed bottom-24 right-6 w-[320px] bg-[rgba(20,20,20,0.85)] backdrop-blur-xl border border-[#8B5CF6]/50 shadow-[0_8px_32px_rgba(139,92,246,0.2)] rounded-[18px] p-5 z-40 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500 origin-bottom-right">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-white font-bold text-lg flex items-center gap-2">
              Welcome to UniSwap! 👋
            </h4>
          </div>
          <div className="text-[14px] text-gray-300 space-y-2 mb-5 leading-relaxed">
            <p>Hi there!</p>
            <p>I'm UniSwap AI.</p>
            <p>Need help finding a product, posting a listing, or navigating the platform?</p>
            <p>I'm here to help you anytime.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setShowWelcomeBubble(false); setIsOpen(true); }}
              className="flex-1 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-md hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:-translate-y-0.5"
            >
              Ask Me
            </button>
            <button 
              onClick={() => setShowWelcomeBubble(false)}
              className="flex-1 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              Dismiss
            </button>
          </div>
          {/* Small tail pointing toward chatbot */}
          <div className="absolute -bottom-[9px] right-8 w-[18px] h-[18px] bg-[rgba(20,20,20,0.85)] border-r border-b border-[#8B5CF6]/50 transform rotate-45 z-[-1] backdrop-blur-xl"></div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[#6C3BFF] to-[#8B5CF6] hover:scale-110 transition-all rounded-full flex items-center justify-center text-3xl z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'} ${!isOpen ? 'animate-gentle-glow' : ''}`}
      >
        🤖
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[95vw] sm:w-[330px] lg:w-[340px] h-[75vh] sm:h-[500px] lg:h-[520px] bg-[rgba(20,20,20,0.65)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] flex flex-col z-50 overflow-hidden transition-all duration-250 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-[rgba(25,25,25,0.45)] backdrop-blur-[15px] border-b border-[rgba(255,255,255,0.05)] h-[72px] px-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[44px] shrink-0 rounded-full bg-[rgba(255,255,255,0.08)] backdrop-blur-[15px] border border-[rgba(255,255,255,0.12)] flex items-center justify-center p-2 hover:bg-[rgba(255,255,255,0.12)] hover:scale-105 transition-all duration-200 ease-out group">
              <Bot className="w-full h-full text-white group-hover:text-primary-300 transition-colors drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-white leading-tight text-[15px]">UniSwap AI</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[11px] text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-transparent scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#2A2A2A]' : 'bg-[#8B5CF6]/20'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-gray-400" /> : <Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />}
              </div>
              <div className={`p-2.5 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-[#6C3BFF]/90 to-[#8B5CF6]/90 backdrop-blur-md text-white rounded-tr-none' : 'bg-[rgba(40,40,40,0.75)] backdrop-blur-md text-gray-200 border border-[rgba(255,255,255,0.05)] rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.05)] rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips */}
        {messages.length === 1 && (
          <div className="bg-[#0F0F0F] px-3 pb-2 shrink-0">
            <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar snap-x">
              {(showAllQuestions ? ALL_QUESTIONS : MAIN_QUESTIONS).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap h-[34px] flex items-center justify-center px-[14px] rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[#8B5CF6]/20 border border-[rgba(255,255,255,0.1)] hover:border-[#8B5CF6]/50 text-[14px] text-gray-300 hover:text-white transition-all snap-start shrink-0"
                >
                  {q}
                </button>
              ))}
              {!showAllQuestions && (
                <button
                  onClick={() => setShowAllQuestions(true)}
                  className="whitespace-nowrap h-[34px] flex items-center justify-center px-[14px] rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[#8B5CF6]/20 border border-[rgba(255,255,255,0.1)] text-[14px] text-[#8B5CF6] hover:text-white transition-all snap-start shrink-0"
                >
                  Show More
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-transparent border-t border-[rgba(255,255,255,0.05)] shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="w-full bg-[rgba(30,30,30,0.55)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl h-[46px] pl-4 pr-[50px] text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 transition-colors shadow-inner"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-1 w-[38px] h-[38px] flex items-center justify-center bg-[#8B5CF6] hover:bg-[#A855F7] disabled:bg-[rgba(255,255,255,0.1)] rounded-lg text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)] hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes gentleGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(108,59,255,0.4); transform: scale(1); }
          50% { box-shadow: 0 0 35px rgba(139,92,246,0.8); transform: scale(1.05); }
        }
        .animate-gentle-glow {
          animation: gentleGlow 3s infinite ease-in-out;
        }
      `}} />
    </>
  )
}
