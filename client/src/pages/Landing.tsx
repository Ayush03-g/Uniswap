import { useState, useEffect, useRef } from "react"
import { ArrowRight, Book, Laptop, ShoppingBag, Zap, Shield, Heart, Search } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent } from "../components/ui/Card"
import { Link, useNavigate } from "react-router-dom"
import { useSearchProductsQuery, useGetNewArrivalsQuery } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import { AuthGuardModal } from "../components/AuthGuardModal"
import { useClickOutside } from "../hooks/useClickOutside"
import { WatermarkedImage } from "../components/ui/WatermarkedImage"
import { getProductImage } from "../utils/image"

export function Landing() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [authModalProduct, setAuthModalProduct] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useSelector((state: any) => state.auth)

  useClickOutside(searchRef, () => setIsSearchFocused(false), isSearchFocused)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const { data: searchResults = [] } = useSearchProductsQuery(debouncedQuery, { skip: !debouncedQuery })
  const { data: newArrivals = [] } = useGetNewArrivalsQuery(undefined)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just Now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 172800) return 'Yesterday'
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const isNew = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()
    return (now.getTime() - date.getTime()) <= 5 * 24 * 60 * 60 * 1000
  }

  const displayedProducts = newArrivals
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-background to-background"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            Where Every Listing Finds a <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500">Student.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Buy and sell textbooks, electronics, furniture, and more within your university campus. Safe, fast, and exactly what you need.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6 relative z-10">
            <Link to="/dashboard">
              <Button size="lg" className="rounded-full font-semibold shadow-soft-lg gap-2">
                Start Exploring <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button variant="outline" size="lg" className="rounded-full font-semibold">
                Sell an Item
              </Button>
            </Link>
          </div>
          
          <div className="mt-11 md:mt-12 lg:mt-16 flex justify-center w-full max-w-[1200px] mx-auto px-6">
            <div className="relative w-full max-w-[900px] group" ref={searchRef}>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary-400 to-accent-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative flex items-center rounded-2xl bg-white p-2 shadow-soft-lg border border-primary-100">
                <Input 
                  spellCheck={false}
                  placeholder="Search books, electronics, furniture, notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                  className="border-0 bg-transparent text-lg shadow-none focus-visible:ring-0 px-4 h-14 w-full !text-[#000000] !caret-[#000000] placeholder:!text-[#6B7280]" 
                  style={{ color: '#000000', caretColor: '#000000' }}
                />
                <Button 
                  onClick={handleSearch} 
                  className="rounded-[14px] w-[56px] h-[44px] shrink-0 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] border-0 flex items-center justify-center p-0"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-white" />
                </Button>
              </div>

              {isSearchFocused && debouncedQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#202020] border border-border rounded-xl shadow-xl max-h-96 overflow-y-auto text-left animate-in fade-in slide-in-from-top-2 duration-200 z-40">
                  {searchResults.map((p: any) => (
                    <Link key={p._id} to={`/products/${p._id}`} className="flex items-center gap-4 p-3 hover:bg-[rgba(255,255,255,0.05)] border-b border-border last:border-0 transition-colors" onClick={() => setIsSearchFocused(false)}>
                      <WatermarkedImage src={getProductImage(p.images)} className="w-12 h-12 object-cover rounded-md shrink-0" alt={p.title} />
                      <div>
                        <h4 className="font-semibold text-white line-clamp-1">{p.title}</h4>
                        <p className="text-sm text-primary-400">₹{p.price ? p.price.toLocaleString('en-IN') : "0"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {isSearchFocused && debouncedQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#202020] border border-border rounded-xl shadow-xl p-4 text-center text-muted-foreground text-left animate-in fade-in slide-in-from-top-2 duration-200 z-40">
                  🔍 No products found. Try another keyword.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">🔥 New Arrivals</h2>
              <p className="mt-2 text-muted-foreground">Freshly listed by Medi-Caps students</p>
            </div>
            {newArrivals.length >= 8 && (
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-full gap-2 hover:bg-primary-50">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {newArrivals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-300">
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">No new arrivals right now.</h3>
              <p className="text-muted-foreground mb-8">Check back soon or be the first to sell something new!</p>
              <Link to="/sell">
                <Button size="lg" className="rounded-full font-semibold shadow-soft-lg gap-2">
                  Sell Product <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 md:pb-0 hide-scrollbar">
              {displayedProducts.map((product: any, idx: number) => (
                <Card 
                  key={product._id} 
                  onClick={() => {
                    if (!isAuthenticated) setAuthModalProduct(product._id)
                    else navigate(`/products/${product._id}`)
                  }}
                  className="w-[85vw] sm:w-[45vw] md:w-auto flex-shrink-0 snap-start cursor-pointer hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 group overflow-hidden"
                  style={{ animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
                >
                  <div className="aspect-square sm:aspect-[4/3] relative overflow-hidden bg-muted">
                    <WatermarkedImage 
                      src={getProductImage(product.images)} 
                      alt={product.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {isNew(product.createdAt) && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                        🆕 NEW
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-medium text-white z-10">
                      {formatRelativeTime(product.createdAt)}
                    </div>
                  </div>
                  <CardContent className="p-4 pt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{product.category}</span>
                      <span className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">{product.condition}</span>
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary-600 transition-colors mb-1">
                      {product.title}
                    </h3>
                    <p className="text-xl font-bold text-foreground">₹{product.price ? product.price.toLocaleString('en-IN') : "0"}</p>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5 line-clamp-1">
                      🏫 {product.college || "Campus"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* How it Works */}
      <section className="pt-[50px] pb-[50px] bg-primary-950 text-white rounded-[3rem] mx-4 lg:mx-12 my-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-600 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent-500 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-[35px]">
            <h2 className="text-[30px] font-bold tracking-tight mb-[20px]">How UniSwap Works</h2>
            <p className="text-primary-200">Simple, safe, and built for students.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "List it fast", desc: "Snap a photo, set a price, and post your item in seconds.", icon: Zap },
              { title: "Chat securely", desc: "Connect with buyers instantly through our in-app messaging.", icon: Shield },
              { title: "Connect with Students", desc: "Every listing connects students directly, making buying and selling simple, transparent, and reliable across your campus.", icon: Heart },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group h-full">
                <div className="w-[64px] h-[64px] rounded-2xl bg-primary-800/80 flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors duration-300 shrink-0">
                  <step.icon className="w-8 h-8 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-[16px] leading-[1.6] text-primary-200/80 max-w-[320px] mx-auto text-center whitespace-normal break-words">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-[850px] mx-auto bg-[rgba(25,25,25,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[24px] shadow-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header above image */}
            <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-white mb-6 flex items-center justify-center md:justify-start gap-3 leading-tight">
              <span>👤</span> Meet the Founder
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Left Side: Image */}
              <div className="w-full md:w-auto flex flex-col items-center shrink-0">
                <div 
                  className="relative group cursor-pointer w-[200px] h-[260px] rounded-[18px] overflow-hidden shadow-[0_8px_30px_rgba(139,92,246,0.15)] border border-primary-500/30 transition-transform duration-300 hover:scale-[1.02]"
                  onClick={() => setIsZoomed(true)}
                >
                  <img 
                    src="/founder.jpeg" 
                    alt="Ayush Garg - Founder of UniSwap" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Click to Zoom
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 font-medium flex items-center justify-center gap-1.5 w-[200px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                  🔍 Click to Zoom
                </p>
              </div>

              {/* Right Side: Text */}
              <div className="w-full flex-1 flex flex-col justify-center max-w-[620px]">
                <div className="mb-[18px]">
                  <h3 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] leading-[1.2] tracking-normal">
                    AYUSH GARG
                  </h3>
                  <p className="text-[16px] text-[#B794F4] font-medium tracking-[1px] mt-[6px]">
                    Founder & Full Stack Developer
                  </p>
                </div>

                <div className="space-y-[14px] text-[15px] font-normal text-[rgba(255,255,255,0.78)] leading-[1.7]">
                  <p>
                    UniSwap started with one simple goal—making it easier for students to connect, exchange, and help one another through technology.
                  </p>
                  <p>
                    As an MCA student, I noticed that many students struggle to find affordable books, electronics, furniture, notes, and other campus essentials. Most exchanges happen through scattered WhatsApp groups and social media posts, making the process confusing, time-consuming, and unreliable.
                  </p>
                  <p>
                    That inspired me to build <strong className="text-white">UniSwap</strong>—a dedicated student platform where buying, selling, and sharing useful resources becomes simple, organized, and accessible for everyone.
                  </p>
                  <p>
                    I believe great software is not just about writing code—it's about creating solutions that make everyday life easier for people.
                  </p>
                  
                  <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-[16px] mt-[18px] whitespace-normal sm:whitespace-nowrap text-left">
                    "Built with passion. Designed for students. Inspired by real campus life."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
            <img 
              src="/founder.jpeg" 
              alt="Ayush Garg" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute top-4 right-4 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
      {authModalProduct && (
        <AuthGuardModal 
          productId={authModalProduct} 
          onClose={() => setAuthModalProduct(null)} 
        />
      )}
    </div>
  )
}
