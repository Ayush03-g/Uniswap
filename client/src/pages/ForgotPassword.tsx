import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowRight, Loader2, ArrowLeft, Check, X } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card"
import { useSendOtpMutation, useResetPasswordMutation } from "../features/api/apiSlice"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newPasswordTouched, setNewPasswordTouched] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  
  const navigate = useNavigate()
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()
  useEffect(() => {
    let interval: any
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    if (!/^[A-Za-z0-9._%+-]+@medicaps\.ac\.in$/.test(email)) {
      return setErrorMsg("This email is not registered with UniSwap.")
    }

    try {
      await sendOtp({ email, type: "reset" }).unwrap()
      setSuccessMsg("OTP sent successfully. Please check your email.")
      setOtpSent(true)
      setResendTimer(30)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "No account found with this email address.")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    
    if (!/^[A-Z]/.test(newPassword) || newPassword.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(newPassword)) {
      return setErrorMsg("Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.")
    }

    if (newPassword !== confirmPassword) {
      return setErrorMsg("Passwords do not match.")
    }

    try {
      await resetPassword({ email, otp, newPassword }).unwrap()
      setSuccessMsg("Password changed successfully! Redirecting...")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to reset password. Invalid OTP.")
    }
  }

  const handleResendOtp = async () => {
    setErrorMsg("")
    setSuccessMsg("")
    try {
      await sendOtp({ email, type: "reset", isResend: true }).unwrap()
      setSuccessMsg("A new OTP has been sent.")
      setResendTimer(30)
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to resend OTP.")
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <LockIcon />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            {otpSent ? "Enter the OTP sent to your email and a new password" : "Enter your email to receive a password reset OTP"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-200">
                {successMsg}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  required
                  type="email" 
                  placeholder="student@medicaps.ac.in"
                  pattern=".*@medicaps\.ac\.in"
                  title="Only @medicaps.ac.in emails are allowed"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                />
              </div>
            </div>
            
            {otpSent && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">6-Digit OTP</label>
                  <Input 
                    required
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="text-center text-xl tracking-[0.5em] font-mono py-4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleResendOtp}
                      className="text-xs font-medium text-primary-500 hover:text-primary-400 disabled:text-muted-foreground disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend available in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">New Password</label>
                  <Input 
                    required
                    type="password" 
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => setNewPasswordTouched(true)}
                  />
                </div>
                
                {((newPassword.length > 0 || newPasswordTouched) && (!/^[A-Z]/.test(newPassword) || newPassword.length < 6 || !/[!@#$%^&*()_+=\-?.,:;/\\]/.test(newPassword))) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-rose-500 text-xs mt-1.5 font-medium leading-relaxed">Password must be at least 6 characters long, begin with an uppercase letter, and contain at least one special character.</p>
                    <div className="space-y-1.5 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-700 mb-2">Password Requirements</p>
                      <div className="flex items-center gap-2 text-xs">
                        {newPassword.length >= 6 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                        <span className={newPassword.length >= 6 ? "text-emerald-600 font-medium" : "text-slate-500"}>At least 6 characters</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {/^[A-Z]/.test(newPassword) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                        <span className={/^[A-Z]/.test(newPassword) ? "text-emerald-600 font-medium" : "text-slate-500"}>First character must be an uppercase letter (A–Z)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {/[!@#$%^&*()_+=\-?.,:;/\\]/.test(newPassword) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                        <span className={/[!@#$%^&*()_+=\-?.,:;/\\]/.test(newPassword) ? "text-emerald-600 font-medium" : "text-slate-500"}>At least one special character (!@#$%^&*...)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Confirm New Password</label>
                  <Input 
                    required
                    type="password" 
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            <Button className="w-full bg-primary-600 hover:bg-primary-700" size="lg" disabled={otpSent ? isResetting : isSendingOtp}>
              {otpSent ? (
                isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"
              ) : (
                isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center border-t border-border pt-6">
          <Link to="/login" className="flex items-center text-sm text-primary-600 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  )
}
