import { Shield, User, Lock, Mail } from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-[900px]">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4 flex items-center justify-center gap-3">
          <Shield className="w-10 h-10 text-primary-500" /> Privacy Policy
        </h1>
        <p className="text-xl text-primary-200/80">Your privacy matters to us.</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Name</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> University Email</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> WhatsApp Number</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Profile Picture (Optional)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">How We Use It</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Verify student accounts</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Connect buyers and sellers</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Improve your experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Your Privacy</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> We never sell your personal data.</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> We do not process payments.</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Your information stays secure.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
                <p className="text-gray-300 mb-2">Need help?</p>
                <div className="text-gray-300">
                  Email: <a href="mailto:ayushgargsbl@gmail.com" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">ayushgargsbl@gmail.com</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
