import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"

export function SafetyCenter() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-[900px]">
      <Link to="/" className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors mb-8 group font-medium">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Safety Center</h1>
        <p className="text-xl text-primary-200/80">Stay safe while buying and selling on campus.</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-primary-400 mb-3">Meet in Public Places</h2>
            <p className="text-gray-300 leading-relaxed">
              Always meet inside the university campus in safe, public locations.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-primary-400 mb-3">Inspect Before Buying</h2>
            <p className="text-gray-300 leading-relaxed">
              Check the product carefully before making any payment.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-primary-400 mb-3">Communicate Through UniSwap</h2>
            <p className="text-gray-300 leading-relaxed">
              Use the built-in chat before sharing personal contact details.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-primary-400 mb-3">Report Suspicious Activity</h2>
            <p className="text-gray-300 leading-relaxed">
              Report fake listings or inappropriate behaviour immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
