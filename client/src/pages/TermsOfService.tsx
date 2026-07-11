import { FileText, CheckCircle, Package, Ban, Handshake, CreditCard, Mail } from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"

export function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-[900px]">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="w-10 h-10 text-primary-500" /> Terms of Service
        </h1>
        <p className="text-xl text-primary-200/80">Simple rules to keep UniSwap safe for everyone.</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Who Can Use UniSwap</h2>
                <p className="text-gray-300">
                  Only verified students with a valid university email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Allowed Listings</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Books</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Electronics</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Furniture</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Notes</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Hostel Essentials</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Ban className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Not Allowed</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Illegal items</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Weapons</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Fake products</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Stolen goods</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Spam</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Handshake className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Buyer & Seller Responsibility</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Meet safely on campus.</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Inspect products before buying.</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Agree on the final price together.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Payments</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> UniSwap does not handle payments.</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Buyers and sellers deal directly with each other.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-primary-500/50 transition-colors duration-300 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-600">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-900/30 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
                <p className="text-gray-300 mb-2">Questions?</p>
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
