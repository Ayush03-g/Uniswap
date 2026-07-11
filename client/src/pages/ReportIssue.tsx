import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"

export function ReportIssue() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-[900px]">
      <Link to="/" className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors mb-8 group font-medium">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Report an Issue</h1>
        <p className="text-xl text-primary-200/80">Let us know if something isn't working.</p>
      </div>

      <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
        {isSuccess ? (
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-lg text-center p-8 animate-in zoom-in duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Report Submitted</h2>
              <p className="text-gray-300 mb-8">
                Thank you for letting us know. Our team will review the issue shortly.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                className="bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)] border-none px-8"
              >
                Submit Another Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Name</label>
                  <Input required placeholder="Your full name" className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-primary-500" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">University Email</label>
                  <Input required type="email" placeholder="your.name@university.edu" className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-primary-500" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Subject</label>
                  <Input required placeholder="Brief description of the issue" className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-primary-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Message</label>
                  <textarea 
                    required
                    rows={5}
                    className="flex w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-primary-500 transition-colors" 
                    placeholder="Provide as much detail as possible..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-none shadow-[0_0_15px_rgba(108,59,255,0.3)] h-12 text-base font-medium mt-4"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-8 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-gray-400 text-sm mb-2">Support Email</p>
          <a href="mailto:ayushgargsbl@gmail.com" className="text-primary-400 hover:text-primary-300 font-medium transition-colors mb-6 inline-block">
            ayushgargsbl@gmail.com
          </a>
          <p className="text-gray-400 text-sm mb-2">Response Time</p>
          <p className="text-white font-medium">Within 24–48 hours.</p>
        </div>
      </div>
    </div>
  )
}
