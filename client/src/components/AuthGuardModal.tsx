import { useNavigate } from "react-router-dom"
import { Lock, X } from "lucide-react"
import { Button } from "./ui/Button"

interface AuthGuardModalProps {
  productId?: string
  redirectPath?: string
  title?: string
  message?: string
  bottomText?: string
  onClose: () => void
}

export function AuthGuardModal({ productId, redirectPath, title, message, bottomText, onClose }: AuthGuardModalProps) {
  const navigate = useNavigate()
  
  const finalPath = redirectPath || `/products/${productId}`
  const finalTitle = title || "🔒 Login Required"
  const finalMessage = message || "Please log in or create an account to view product details, contact sellers, add products to your cart, and purchase items on UniSwap."
  const finalBottomText = bottomText || "Continue your UniSwap journey by signing in."

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-[10px] animate-in fade-in duration-300 p-4">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />
      <div className="w-full max-w-[420px] bg-[#1A1A1A] rounded-[20px] p-8 border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(108,59,255,0.15)] flex flex-col items-center text-center relative animate-in zoom-in-95 duration-250">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-gradient-to-tr from-[#6C3BFF]/20 to-[#8B5CF6]/20 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">{finalTitle}</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          {finalMessage}
        </p>
        
        <div className="w-full flex flex-col gap-3 mb-6">
          <Button 
            onClick={() => navigate("/login", { state: { from: { pathname: finalPath } } })}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white font-semibold text-lg border-none"
          >
            Log In
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/register", { state: { from: { pathname: finalPath } } })}
            className="w-full h-12 rounded-xl border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-white font-semibold text-lg bg-transparent"
          >
            Sign Up
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          {finalBottomText}
        </p>
      </div>
    </div>
  )
}
