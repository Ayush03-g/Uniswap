import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Mail, Lock, User, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card"
import { useRegisterMutation } from "../features/api/apiSlice"
import { setCredentials } from "../features/auth/authSlice"

export function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [register, { isLoading: isRegistering }] = useRegisterMutation()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!email.endsWith("@medicaps.ac.in")) {
      return setErrorMsg("Registration is restricted to @medicaps.ac.in email addresses.")
    }

    if (!/^[A-Z]/.test(password) || password.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(password)) {
      return setErrorMsg("Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.")
    }
    
    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match")
    }

    try {
      const response = await register({ name, email, password, mobile }).unwrap()
      dispatch(setCredentials({ user: response.user, token: response.token }))
      setSuccessMsg("Account created successfully.")
      setTimeout(() => {
        navigate("/")
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to register. Please try again.")
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
      <Card className="w-full max-w-[420px] shadow-2xl border-white/10 bg-[#121212]/90 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-4 pt-5">
          <div className="mx-auto w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-1 shadow-lg shadow-primary-500/20">
            <span className="text-white font-bold text-xl leading-none">U</span>
          </div>
          <CardTitle className="text-[28px] font-extrabold tracking-tight text-white">Create Account</CardTitle>
          <CardDescription className="text-[13px] text-gray-400 font-medium">
            Join the exclusive student network for your university
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-3 px-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-200 font-medium">
                {successMsg}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                <Input 
                  required
                  type="text" 
                  placeholder="Aarav Sharma"
                  className="pl-10 h-[44px] rounded-[10px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 transition-all text-[14px]" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-300">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                <Input 
                  required
                  type="email" 
                  placeholder="user@medicaps.ac.in" 
                  className="pl-10 h-[44px] rounded-[10px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 transition-all text-[14px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-300 ml-1">Mobile Number *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-[14px]">+91</span>
                <Input 
                  required
                  type="tel" 
                  placeholder="9876543210" 
                  pattern="^[6-9]\d{9}$"
                  title="Please enter a valid 10-digit Indian mobile number"
                  className="pl-[42px] h-[44px] rounded-[10px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 transition-all text-[14px] tracking-wide"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                <Input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-[44px] rounded-[10px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 transition-all text-[14px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              
              {((password.length > 0 || passwordTouched) && (!/^[A-Z]/.test(password) || password.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(password))) && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-rose-500 text-xs mt-1.5 font-medium leading-relaxed">Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.</p>
                  <div className="space-y-1.5 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-2">Password Requirements</p>
                    <div className="flex items-center gap-2 text-xs">
                      {password.length >= 6 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                      <span className={password.length >= 6 ? "text-emerald-600 font-medium" : "text-slate-500"}>At least 6 characters</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {/^[A-Z]/.test(password) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                      <span className={/^[A-Z]/.test(password) ? "text-emerald-600 font-medium" : "text-slate-500"}>First character must be an uppercase letter (A–Z)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {/[!@#$%^&*()_+=\-?.,:;/\\]/.test(password) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                      <span className={/[!@#$%^&*()_+=\-?.,:;/\\]/.test(password) ? "text-emerald-600 font-medium" : "text-slate-500"}>At least one special character (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-300 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                <Input 
                  required
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-[44px] rounded-[10px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 transition-all text-[14px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <Button className="w-full h-[44px] rounded-[10px] bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold text-[14px] shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300" disabled={isRegistering}>
                {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Create Account <ArrowRight className="w-[18px] h-[18px] ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center border-t border-white/10 pt-4 pb-5 bg-white/5 rounded-b-2xl">
          <p className="text-[13px] text-gray-400 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
