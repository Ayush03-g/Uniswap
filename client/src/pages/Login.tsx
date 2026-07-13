import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import { ArrowRight, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import { useDispatch } from "react-redux"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card"
import { useLoginMutation } from "../features/api/apiSlice"
import { setCredentials } from "../features/auth/authSlice"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { startTransition } = useOutletContext<any>()
  
  const [login, { isLoading }] = useLoginMutation()

  useEffect(() => {
    if (location.state?.message) {
      setErrorMsg(location.state.message)
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await login({ email, password }).unwrap()
      
      startTransition("Signing you in...", () => {
        dispatch(setCredentials({ user: result.user, token: result.token }))
        const from = location.state?.from?.pathname || "/"
        navigate(from)
      })
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Login failed. Please check your credentials.")
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-11 h-11 bg-primary-600 rounded-full flex items-center justify-center mb-4 shadow-md">
            <span className="text-white font-bold text-2xl leading-none">U</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your university email to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  required
                  type="email" 
                  placeholder="user@example.com" 
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center border-t border-border pt-6 pb-8">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
