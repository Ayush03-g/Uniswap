import { useState } from "react"
import { X, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react"

export function SupportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fileError, setFileError] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 4000)
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError("")
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File must be under 5MB.")
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#1A1A1A] w-full max-w-[520px] max-h-[85vh] flex flex-col rounded-2xl border border-[#6C3BFF]/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 mt-10 sm:mt-0">
        <div className="py-[18px] px-5 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[#202020] shrink-0">
          <h3 className="font-bold text-white text-[26px] leading-none">Support Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] p-1.5 rounded-full shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#6C3BFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(108,59,255,0.3)]">
                <CheckCircle2 className="w-8 h-8 text-[#8B5CF6]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Support Request Submitted</h4>
              <p className="text-gray-300 mb-2">Thank you! We've received your request.</p>
              <p className="text-gray-400 text-sm">Our team will review it and get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-gray-300">Full Name *</label>
                  <input required type="text" className="w-full h-[44px] rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-medium text-gray-300">Email Address *</label>
                  <input required type="email" className="w-full h-[44px] rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none transition-colors" placeholder="user@example.com" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[14px] font-medium text-gray-300">Subject *</label>
                <input required type="text" className="w-full h-[44px] rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-medium text-gray-300">Category *</label>
                <select required className="w-full h-[44px] rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none transition-colors">
                  <option value="" disabled selected>Select category</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Product Listing">Product Listing</option>
                  <option value="Chat Problem">Chat Problem</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Report a User">Report a User</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[14px] font-medium text-gray-300">Describe Your Issue *</label>
                <textarea required className="w-full h-[100px] resize-none rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] p-3 text-sm text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"></textarea>
              </div>
              
              <div className="space-y-1">
                <label className="text-[14px] font-medium text-gray-300">Attach Screenshot (Optional)</label>
                <div className="relative">
                  <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="absolute inset-0 w-full h-[60px] opacity-0 cursor-pointer" />
                  <div className="w-full h-[60px] flex items-center justify-center gap-2 border border-dashed border-[rgba(255,255,255,0.2)] rounded-lg bg-[#0F0F0F] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-[14px] text-gray-400">Click to upload (Max 5MB)</span>
                  </div>
                </div>
                {fileError && <p className="text-xs text-rose-500 mt-1">{fileError}</p>}
              </div>
              
              <div className="pt-3 flex gap-3 justify-end shrink-0">
                <button type="button" onClick={onClose} className="px-5 h-[44px] text-[14px] font-medium text-gray-300 hover:text-white transition-colors rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] flex items-center">Cancel</button>
                <button type="submit" disabled={isSubmitting || !!fileError} className="px-5 h-[44px] text-[14px] font-medium bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white rounded-lg shadow-[0_0_15px_rgba(108,59,255,0.3)] disabled:opacity-50 flex items-center gap-2 transition-all">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
