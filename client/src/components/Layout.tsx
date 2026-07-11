import { useState, useEffect, useRef } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Bell, ShoppingCart, LogOut, PlusCircle, Lock, X } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "./ui/Button"
import type { RootState } from "../store"
import { logout } from "../features/auth/authSlice"
import { useGetCartQuery, useGetNotificationsQuery, useMarkReadMutation, useClearNotificationsMutation, useDeleteNotificationMutation } from "../features/api/apiSlice"
import { io, Socket } from "socket.io-client"
import { useClickOutside } from "../hooks/useClickOutside"
import { Assistant } from "./Assistant"
import { AuthGuardModal } from "./AuthGuardModal"
import { getMaleAvatarForUser } from "../utils/avatar"
import { SupportModal } from "./SupportModal"

export function Layout() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const { data: notificationsData } = useGetNotificationsQuery(undefined, { skip: !isAuthenticated })
  const [markRead] = useMarkReadMutation()
  const [clearAllNotifications] = useClearNotificationsMutation()
  const [deleteSingleNotification] = useDeleteNotificationMutation()

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<any[]>([])
  const [toastNotification, setToastNotification] = useState<{title: string, message: string} | null>(null)
  
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (notificationsData) {
      setLocalNotifications(notificationsData)
    }
  }, [notificationsData])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketRef.current = io("http://localhost:5000", {
        query: { userId: user.id }
      })

      socketRef.current.on("new_notification", (notification) => {
        setLocalNotifications(prev => [notification, ...prev])
        setToastNotification({ title: notification.title || 'New Notification', message: notification.message })
        setTimeout(() => setToastNotification(null), 5000)
      })

      return () => {
        socketRef.current?.disconnect()
      }
    }
  }, [isAuthenticated, user])

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowProfileMenu(false)
    if (!showNotifications) {
      const unreadIds = localNotifications.filter(n => !n.read).map(n => n._id)
      unreadIds.forEach(id => markRead(id))
      setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  const handleClearAll = async () => {
    setLocalNotifications([])
    setIsClearConfirmOpen(false)
    await clearAllNotifications(undefined)
  }

  const handleDeleteIndividual = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setLocalNotifications(prev => prev.filter(n => n._id !== id))
    await deleteSingleNotification(id)
  }

  const [footerAuthPath, setFooterAuthPath] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [transitionState, setTransitionState] = useState({ active: false, message: "" })

  const startTransition = (message: string, callback: () => void) => {
    setTransitionState({ active: true, message })
    setTimeout(() => {
      callback()
      setTimeout(() => {
        setTransitionState({ active: false, message: "" })
      }, 100)
    }, 450)
  }

  const handleLogout = () => {
    setShowProfileMenu(false)
    startTransition("Signing you out...", () => {
      dispatch(logout())
      navigate("/")
    })
  }

  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useClickOutside(notificationsRef, () => setShowNotifications(false), showNotifications)
  useClickOutside(profileRef, () => setShowProfileMenu(false), showProfileMenu)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleOpenModal = () => setIsSupportModalOpen(true)
    window.addEventListener("openSupportModal", handleOpenModal)
    return () => window.removeEventListener("openSupportModal", handleOpenModal)
  }, [])

  const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <li>
      <Link 
        to={to} 
        onClick={(e) => {
          if (!isAuthenticated) {
            e.preventDefault()
            setFooterAuthPath(to)
          }
        }}
        className="text-[#A3A3A3] hover:text-[#8B5CF6] transition-colors duration-[250ms] font-normal leading-[1.8] text-[15px] flex items-center w-max gap-2 group"
      >
        {children}
        {!isAuthenticated && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity" title="Login required">
            <Lock className="w-3 h-3 text-[#8B5CF6]" />
          </span>
        )}
      </Link>
    </li>
  )

  return (
    <>
      {transitionState.active && (
        <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.75)] flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center animate-spin-slow mb-6 shadow-lg shadow-primary-600/40" style={{ animationDuration: '3s' }}>
            <span className="text-white font-bold text-4xl leading-none" style={{ animation: 'pulse 2s infinite' }}>U</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{transitionState.message}</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      )}
      
      <div className={`min-h-screen flex flex-col bg-[#0F0F0F] transition-all duration-[450ms] ease-in-out ${transitionState.active ? 'opacity-0 blur-[6px] pointer-events-none' : 'opacity-100 blur-0'}`}>
      <header className={`sticky top-0 z-[1000] w-full border-b transition-all duration-300 ${scrolled ? 'bg-[rgba(15,15,15,0.9)] backdrop-blur-[30px] border-[rgba(255,255,255,0.15)] shadow-sm' : 'bg-[rgba(15,15,15,0.80)] backdrop-blur-[20px] border-[rgba(255,255,255,0.08)]'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-11 h-11 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-2xl leading-none">U</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">UniSwap</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              user?.role === 'ADMIN' ? (
                <div className="flex items-center gap-4">
                  <Link to="/admin/dashboard" className="text-white hover:text-rose-400 font-bold transition-colors">Admin Dashboard</Link>
                  <Button onClick={handleLogout} variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-950 rounded-full px-6">
                    Logout
                  </Button>
                </div>
              ) : (
              <>
                <Link to="/sell" className="hidden sm:block">
                  <Button className="rounded-full gap-2 text-white bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] shadow-md hover:shadow-lg transition-all duration-300 border-0 animate-in fade-in slide-in-from-right-2 duration-300">
                    <PlusCircle className="w-4 h-4" />
                    Sell Product
                  </Button>
                </Link>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="relative" ref={notificationsRef}>
                    <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-[rgba(255,255,255,0.1)] transition-colors animate-in fade-in duration-300" onClick={handleOpenNotifications}>
                      <Bell className="w-5 h-5 text-white" />
                      {isAuthenticated && localNotifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                          {localNotifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </Button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-[340px] bg-[#202020]/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                          <h3 className="font-bold text-white">Notifications</h3>
                          {localNotifications.length > 0 && (
                            <button 
                              onClick={() => setIsClearConfirmOpen(true)}
                              className="text-[#8B5CF6] text-xs font-medium border border-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white h-[34px] px-3 rounded-[12px] transition-all duration-300"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                          {localNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6">
                              <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-3">
                                <Bell className="w-5 h-5 text-gray-500" />
                              </div>
                              <h4 className="font-bold text-white mb-1">No Notifications</h4>
                              <p className="text-xs text-gray-400 text-center max-w-[200px]">You're all caught up! New notifications will appear here.</p>
                            </div>
                          ) : (
                            localNotifications.map((n: any, idx: number) => (
                              <div key={n._id || idx} className={`relative group p-3 rounded-xl border ${n.read ? 'bg-[rgba(255,255,255,0.02)] border-transparent' : 'bg-[rgba(139,92,246,0.1)] border-[#8B5CF6]/30'}`}>
                                <h4 className="font-semibold text-sm text-white mb-1 pr-6">{n.title || (n.type === 'admin_message' ? 'Admin Notification' : 'Notification')}</h4>
                                <p className="text-xs text-gray-400 pr-2">{n.message}</p>
                                <button 
                                  onClick={(e) => handleDeleteIndividual(e, n._id)}
                                  className="absolute top-3 right-3 text-gray-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors relative animate-in fade-in duration-300">
                      <ShoppingCart className="w-5 h-5 text-white" />
                      {cartData && cartData.items?.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                          {cartData.items.length}
                        </span>
                      )}
                    </Button>
                  </Link>
                  
                  <div className="relative" ref={profileRef}>
                    <button 
                      className="flex items-center justify-center p-0 cursor-pointer rounded-full hover:scale-105 transition-all duration-300 shadow-[0_4px_12px_rgba(108,59,255,0.25)]"
                      onClick={() => {
                        setShowProfileMenu(!showProfileMenu)
                        setShowNotifications(false)
                      }}
                    >
                      <div className="w-[42px] h-[42px] rounded-full overflow-hidden border-2 border-[#8B5CF6] shadow-sm flex items-center justify-center bg-[#1A1A1A]">
                        <img 
                          src={user?.profilePicture || getMaleAvatarForUser(user?.name)} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </button>
                    
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#202020]/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl z-50 py-2 overflow-hidden text-white animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link to="/profile" className="block px-4 py-2 hover:bg-[rgba(255,255,255,0.1)] hover:text-primary-400 text-sm transition-colors" onClick={() => setShowProfileMenu(false)}>My Profile</Link>
                        <Link to="/my-listings" className="block px-4 py-2 hover:bg-[rgba(255,255,255,0.1)] hover:text-primary-400 text-sm transition-colors" onClick={() => setShowProfileMenu(false)}>My Listings</Link>
                        <hr className="my-1 border-border" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-4 py-2 hover:bg-[rgba(255,0,0,0.1)] text-sm text-rose-500 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
              )
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                <Link to="/login">
                  <Button className="rounded-full px-6 text-white bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] shadow-md border-0">
                    Log In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <Outlet context={{ startTransition }} />
      </main>

      <footer className="relative pt-20 pb-10 mt-auto overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ backgroundColor: '#0F0F10' }}>
        {/* Subtle Gradient Border at Top */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-50"></div>
        
        {/* Radial Gradient Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7C3AED] rounded-full blur-[150px] opacity-[0.03] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#8B5CF6] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-6 lg:px-10 xl:px-[60px] 2xl:px-[80px] relative z-10">
          <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap justify-between items-start gap-12 lg:gap-[60px] mb-16">
            <div className="flex flex-col w-full md:w-[45%] lg:w-auto lg:flex-1 lg:max-w-[300px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-primary-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                  <span className="text-white font-bold text-2xl leading-none">U</span>
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">UniSwap</span>
              </div>
              <p className="text-[15px] text-[#A3A3A3] mb-8 leading-relaxed">
                The premier student-to-student marketplace. Buy, sell, and trade books, electronics, and essentials effortlessly on campus.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.instagram.com/ayush03_g/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram Profile" 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[#A3A3A3] hover:text-white hover:bg-[#8B5CF6] hover:border-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              </div>
            </div>
            
            <div className="w-full md:w-[45%] lg:w-auto">
              <h4 className="font-semibold mb-[18px] text-[rgba(255,255,255,0.9)] text-[16px] tracking-[0.8px] uppercase">Explore</h4>
              <ul className="space-y-3">
                <FooterLink to="/">All Products</FooterLink>
                <FooterLink to="/category/Electronics">Electronics</FooterLink>
                <FooterLink to="/category/Books">Books</FooterLink>
                <FooterLink to="/category/Notes">Notes & Study Material</FooterLink>
              </ul>
            </div>
            
            <div className="w-full md:w-[45%] lg:w-auto">
              <h4 className="font-semibold mb-[18px] text-[rgba(255,255,255,0.9)] text-[16px] tracking-[0.8px] uppercase">Support</h4>
              <ul className="space-y-3">
                <FooterLink to="/help">Help Center</FooterLink>
                <FooterLink to="/safety">Safety Center</FooterLink>
                <FooterLink to="/guidelines">Community Guidelines</FooterLink>
                <FooterLink to="/report-issue">Report an Issue</FooterLink>
              </ul>
            </div>
            
            <div className="flex flex-col items-center w-full md:w-[45%] lg:w-auto">
              <h4 className="font-semibold mb-[18px] text-[rgba(255,255,255,0.9)] text-[16px] tracking-[0.8px] uppercase text-center">Contact Us</h4>
              <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-[18px] p-[22px] w-[340px] max-w-full min-h-[210px] flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.3)]">
                <div>
                  <p className="text-[24px] font-bold text-white mb-[10px] leading-tight">Need Assistance?</p>
                  <p className="text-[14px] text-[#A1A1AA] mb-4 leading-[1.5] line-clamp-3">
                    Have a question or found a bug? Send us a support request and we'll help you as soon as possible.
                  </p>
                </div>
                <button 
                  onClick={() => setIsSupportModalOpen(true)}
                  className="w-full h-[42px] bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white text-[15px] font-medium rounded-[14px] border-none transition-all duration-300 hover:shadow-[0_8px_20px_rgba(139,92,246,0.3)]"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[14px] text-[#737373] order-2 md:order-1">
              &copy; {new Date().getFullYear()} UniSwap. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[14px] order-1 md:order-2 flex-wrap justify-center">
              <Link to="/about" className="text-[#737373] hover:text-[#8B5CF6] transition-colors">About Us</Link>
              <Link to="/privacy" className="text-[#737373] hover:text-[#8B5CF6] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-[#737373] hover:text-[#8B5CF6] transition-colors">Terms of Service</Link>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="ml-4 md:ml-8 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#A3A3A3] hover:text-white hover:bg-[#8B5CF6] hover:border-[#8B5CF6] transition-all duration-300 hover:-translate-y-1"
                aria-label="Back to Top"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {footerAuthPath && (
        <AuthGuardModal 
          redirectPath={footerAuthPath} 
          message="Please log in or create an account to access this feature and continue using UniSwap."
          bottomText="Join UniSwap to explore all features securely."
          onClose={() => setFooterAuthPath(null)} 
        />
      )}
      
      {isSupportModalOpen && <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />}
      
      {/* Clear Notifications Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-[99999] bg-[rgba(0,0,0,0.8)] backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Clear All Notifications?</h3>
            <p className="text-sm text-gray-400 mb-6">This will permanently remove all your notifications. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsClearConfirmOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-[#252525]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleClearAll}
                className="bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-md"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-4 right-4 bg-[#202020]/95 backdrop-blur-xl border border-[#8B5CF6]/50 shadow-[0_4px_24px_rgba(139,92,246,0.3)] rounded-2xl p-4 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300 min-w-[300px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#8B5CF6] flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{toastNotification.title}</h4>
                <p className="text-xs text-gray-300 mt-0.5">{toastNotification.message}</p>
              </div>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Assistant />
      </div>
    </>
  )
}
