import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "./features/auth/authSlice"
import { Loader2 } from "lucide-react"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ScrollToTop } from "./components/ScrollToTop"
import { Landing } from "./pages/Landing"
import { Dashboard } from "./pages/Dashboard"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ForgotPassword } from "./pages/ForgotPassword"
import { ProductDetails } from "./pages/ProductDetails"
import { SellProduct } from "./pages/SellProduct"
import { MyListings } from "./pages/MyListings"
import { Chat } from "./pages/Chat"
import { Cart } from "./pages/Cart"
import { ProfileDashboard } from "./pages/ProfileDashboard"
import { NotesMarketplace } from "./pages/NotesMarketplace"
import { MyPurchases } from "./pages/MyPurchases"
import { SellerDashboard } from "./pages/SellerDashboard"
import { SearchResults } from "./pages/SearchResults"
import { CategoryResults } from "./pages/CategoryResults"
import { HelpCenter } from "./pages/HelpCenter"
import { SafetyCenter } from "./pages/SafetyCenter"
import { CommunityGuidelines } from "./pages/CommunityGuidelines"
import { ReportIssue } from "./pages/ReportIssue"
import { AdminDashboard } from "./pages/AdminDashboard"
import { AdminLogin } from "./pages/AdminLogin"
import { PublicProfile } from "./pages/PublicProfile"
import { PrivacyPolicy } from "./pages/PrivacyPolicy"
import { TermsOfService } from "./pages/TermsOfService"
import { AboutUs } from "./pages/AboutUs"

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    // Clear auth on every full page load for dev/demo purposes
    dispatch(logout())
    sessionStorage.clear()
    
    // Redirect to home page if not already there
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/')
    }
    
    // Brief loading screen to mask the auth state transition
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [dispatch])

  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-[#0F0F0F] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <span className="text-white font-bold text-3xl">U</span>
        </div>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Starting UniSwap...</h2>
        <p className="text-slate-400 text-sm mt-2">Clearing previous session</p>
      </div>
    )
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="admin/login" element={<AdminLogin />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="user/:id" element={<PublicProfile />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="category/:categoryName" element={<CategoryResults />} />
          <Route path="notes" element={<NotesMarketplace />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="safety" element={<SafetyCenter />} />
          <Route path="guidelines" element={<CommunityGuidelines />} />
          <Route path="report-issue" element={<ReportIssue />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="about" element={<AboutUs />} />
          
          {/* Protected Routes */}
          <Route path="sell" element={<ProtectedRoute><SellProduct /></ProtectedRoute>} />
          <Route path="my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />
          <Route path="purchases" element={<ProtectedRoute><MyPurchases /></ProtectedRoute>} />
          <Route path="seller-dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
