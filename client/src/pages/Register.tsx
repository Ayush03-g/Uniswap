import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Mail, Lock, User, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card"
import { useRegisterMutation, useSendOtpMutation } from "../features/api/apiSlice"
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
  
  const [otp, setOtp] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const [register, { isLoading: isRegistering }] = useRegisterMutation()
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation()

  // Handle countdown timer
  useEffect(() => {
    let interval: any
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    if (!/^[A-Za-z0-9._%+-]+@medicaps\.ac\.in$/.test(email)) {
      return setErrorMsg("Only Medi-Caps University email addresses (@medicaps.ac.in) are allowed.")
    }

    if (!/^[A-Z]/.test(password) || password.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(password)) {
      return setErrorMsg("Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.")
    }
    
    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match")
    }

    try {
      await sendOtp({ email, type: "register" }).unwrap()
      setSuccessMsg("OTP sent successfully. Please check your email.")
      setShowOtpModal(true)
      setResendTimer(30)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to send OTP. Please try again.")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    
    try {
      const response = await register({ name, email, password, mobile, otp }).unwrap()
      dispatch(setCredentials({ user: response.user, token: response.token }))
      setSuccessMsg("Email verified! Account created successfully.")
      setTimeout(() => {
        navigate("/")
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Invalid or expired OTP.")
    }
  }

  const handleResendOtp = async () => {
    setErrorMsg("")
    setSuccessMsg("")
    try {
      await sendOtp({ email, type: "register" }).unwrap()
      setSuccessMsg("A new OTP has been sent.")
      setResendTimer(30)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to resend OTP.")
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
      <Card className="w-full max-w-[420px] shadow-2xl border-white/10 bg-[#121212]/90 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-4 pt-5">
          <div className="mx-auto w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[10px] flex items-center justify-center mb-1 shadow-lg shadow-primary-500/20">
            <span className="text-white font-bold text-xl leading-none">U</span>
          </div>
          <CardTitle className="text-[28px] font-extrabold tracking-tight text-white">Create Account</CardTitle>
          <CardDescription className="text-[13px] text-gray-400 font-medium">
            Join the exclusive student network for your university
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSendOtp}>
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
              <label className="text-[13px] font-semibold text-gray-300 ml-1">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                <Input 
                  required
                  type="email" 
                  placeholder="student@medicaps.ac.in" 
                  pattern=".*@medicaps\.ac\.in"
                  title="Only @medicaps.ac.in emails are allowed"
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
              <Button className="w-full h-[44px] rounded-[10px] bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold text-[14px] shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300" disabled={isSendingOtp}>
                {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : (
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

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111111] border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                We've sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20 text-center">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 text-sm rounded-xl border border-emerald-500/20 text-center font-medium">
                    {successMsg}
                  </div>
                )}
                <div className="space-y-2 text-center">
                  <Input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="text-center text-2xl tracking-[0.5em] font-mono py-6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                
                <Button className="w-full bg-primary-600 hover:bg-primary-700" size="lg" disabled={isRegistering || otp.length !== 6}>
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Create Account"}
                </Button>
                
                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={handleResendOtp}
                    className="text-sm font-medium text-primary-500 hover:text-primary-400 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                  >
                    {resendTimer > 0 ? `Resend available in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
