import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { ShieldAlert, Lock, Mail } from "lucide-react"
import { Button } from "../components/ui/Button"
import { setCredentials } from "../features/auth/authSlice"

export function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to authenticate.")
      }

      dispatch(setCredentials({ user: data.user, token: data.token }))
      navigate("/admin/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl border-2 border-rose-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin<span className="text-rose-500">Portal</span></h1>
          <p className="text-gray-400 text-sm text-center">Restricted access. Only authorized administrators may proceed.</p>
        </div>

        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border border-rose-500/20 shadow-2xl p-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Administrator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-[#252525] border border-[#333] rounded-xl text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-[#252525] border border-[#333] rounded-xl text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 mt-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] transition-all font-semibold"
            >
              {isLoading ? "Authenticating..." : "Authorize"}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-8">
          Unauthorized access attempts are logged and strictly prohibited.
        </p>
      </div>
    </div>
  )
}
