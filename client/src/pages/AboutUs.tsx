import { Link } from "react-router-dom"
import { ArrowLeft, Users, Target, Lightbulb, CheckCircle2, UserCircle } from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"

export function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-[900px]">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">About Us</h1>
        <p className="text-xl text-primary-200/80">Built by students, for students.</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-400 mb-3">Who We Are</h2>
                <p className="text-gray-300 leading-relaxed">
                  UniSwap is a student-to-student campus platform designed to make buying and selling easier within the university community. It connects students directly, helping them exchange books, electronics, furniture, notes, and other campus essentials in a simple and organized way.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-400 mb-3">Our Mission</h2>
                <p className="text-gray-300 leading-relaxed">
                  Our mission is to create a trusted campus platform where students can easily connect, exchange useful items, and support one another while reducing waste and saving money.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Lightbulb className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-400 mb-3">Our Vision</h2>
                <p className="text-gray-300 leading-relaxed">
                  We aim to build a smarter and more connected campus community by making student exchanges simple, transparent, and accessible for everyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-400 mb-4">Why UniSwap?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                    <span>Student-only platform</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                    <span>Verified university accounts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                    <span>Direct buyer and seller communication</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                    <span>Simple and secure product listings</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                    <span>Easy-to-use interface</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></div>
                    <span>Built specifically for campus life</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500 overflow-hidden relative">
          {/* Subtle gradient glow behind founder section */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-600/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
          
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#8B5CF6] p-1 shadow-[0_0_20px_rgba(108,59,255,0.3)] mb-4 shrink-0">
                  <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                    <UserCircle className="w-16 h-16 text-primary-400" />
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg whitespace-nowrap">AYUSH GARG</h3>
                <p className="text-primary-400 text-sm font-medium text-center">Founder & Full Stack Developer</p>
              </div>
              <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                <h2 className="text-xl font-semibold text-primary-400 mb-3 hidden md:block">Meet the Founder</h2>
                <p className="text-gray-300 leading-relaxed">
                  UniSwap was created to solve everyday challenges faced by students when buying and selling campus essentials. The goal is to provide a clean, reliable, and student-focused platform that makes campus exchanges easier for everyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600">
        <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-[18px] p-[22px] w-[320px] max-w-full min-h-[210px] flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.3)]">
          <div>
            <p className="text-[24px] font-bold text-white mb-[10px] leading-tight">Need Assistance?</p>
            <p className="text-[14px] text-[#A1A1AA] mb-4 leading-[1.5] line-clamp-3">
              Have a question or found a bug? Send us a support request and we'll help you as soon as possible.
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new Event('openSupportModal'))}
            className="w-full h-[42px] bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white text-[15px] font-medium rounded-[14px] border-none transition-all duration-300 hover:shadow-[0_8px_20px_rgba(139,92,246,0.3)]"
          >
            Contact Support
          </button>
        </div>
      </div>
      
      <div className="mt-16 text-center animate-in fade-in duration-700 delay-700">
        <p className="text-gray-400 mb-2 font-medium">Built with passion for the student community.</p>
        <p className="text-gray-500 text-sm mb-10">UniSwap &copy; 2026</p>
        
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white text-sm font-medium rounded-xl border border-[rgba(255,255,255,0.1)] transition-all duration-300 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
