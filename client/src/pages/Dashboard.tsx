import { useState, useEffect, useRef } from "react"
import { Filter, Search, SlidersHorizontal, MapPin, PackageOpen, PlusCircle, Heart, ShoppingCart, X, ChevronDown } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardFooter } from "../components/ui/Card"
import { useGetProductsQuery, useSearchProductsQuery } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import { AuthGuardModal } from "../components/AuthGuardModal"
import { useClickOutside } from "../hooks/useClickOutside"
import { WatermarkedImage } from "../components/ui/WatermarkedImage"
import { getProductImage } from "../utils/image"

const CATEGORIES = [
  "Books", "Electronics", "Furniture", "Fashion", "Notes", "Cycles", 
  "Sports", "Lab Equipment", "Hostel Essentials", "Mobile Phones", 
  "Gaming", "Accessories", "Others"
]

const CONDITIONS = ["New", "Like New", "Good", "Fair"]
const POSTED_OPTIONS = ["Today", "Last 3 Days", "Last Week", "Last Month"]
const SORT_OPTIONS = ["Newest First", "Oldest First", "Price: Low to High", "Price: High to Low", "Most Viewed", "Most Recent"]
const AVAILABILITY = ["Available", "Reserved", "Sold"]

type Filters = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string[];
  posted?: string;
  sortBy?: string;
  availability?: string[];
  campus?: string;
}

export function Dashboard() {
  const navigate = useNavigate()
  
  const [appliedFilters, setAppliedFilters] = useState<Filters>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [authModalProduct, setAuthModalProduct] = useState<string | null>(null)
  
  const { isAuthenticated } = useSelector((state: any) => state.auth)
  const searchRef = useRef<HTMLDivElement>(null)

  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Local state for filter drawer
  const [localFilters, setLocalFilters] = useState<Filters>({})

  useClickOutside(searchRef, () => setIsSearchFocused(false), isSearchFocused)
  useClickOutside(categoryRef, () => setIsCategoryOpen(false), isCategoryOpen)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const buildQueryString = (filters: Filters) => {
    const params = new URLSearchParams()
    if (filters.q) params.append('q', filters.q)
    if (filters.category) params.append('category', filters.category)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.condition && filters.condition.length > 0) params.append('condition', filters.condition.join(','))
    if (filters.posted) params.append('posted', filters.posted)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.availability && filters.availability.length > 0) params.append('availability', filters.availability.join(','))
    if (filters.campus) params.append('campus', filters.campus)
    return params.toString()
  }

  const queryString = buildQueryString(appliedFilters)
  const { data: products = [], isLoading, isError } = useGetProductsQuery(queryString)
  const { data: searchResults = [] } = useSearchProductsQuery(debouncedQuery, { skip: !debouncedQuery })

  const handleSearch = () => {
    setAppliedFilters(prev => ({ ...prev, q: searchQuery }))
    setIsSearchFocused(false)
  }

  const handleCategorySelect = (cat: string | null) => {
    setAppliedFilters(prev => {
      const newFilters = { ...prev }
      if (cat) {
        newFilters.category = cat
      } else {
        delete newFilters.category
      }
      return newFilters
    })
    setIsCategoryOpen(false)
  }

  const handleOpenFilters = () => {
    setLocalFilters(appliedFilters)
    setIsFiltersOpen(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(prev => ({
      ...localFilters,
      q: prev.q, // preserve search query
      category: prev.category // preserve category
    }))
    setIsFiltersOpen(false)
  }

  const handleResetFilters = () => {
    const reset = { q: appliedFilters.q, category: appliedFilters.category }
    setLocalFilters(reset)
    setAppliedFilters(reset)
    setIsFiltersOpen(false)
  }

  const toggleCheckbox = (field: 'condition' | 'availability', value: string) => {
    setLocalFilters(prev => {
      const current = prev[field] || []
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-4rem)] relative">
      {/* Search and Main Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-30">
        <div className="relative flex-1 group" ref={searchRef}>
          <button onClick={handleSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-500 transition-colors z-10 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <Input 
            spellCheck={false}
            placeholder="Search books, electronics, furniture, notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            className="pl-12 h-14 text-[18px] font-medium rounded-full border border-border bg-[#FFFFFF] !text-[#000000] !caret-[#000000] focus-visible:ring-2 focus-visible:ring-primary-500 transition-all placeholder:!text-[#6B7280]" 
            style={{ color: '#000000', caretColor: '#000000' }}
          />
          {isSearchFocused && debouncedQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#202020] border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.map((p: any) => (
                <div 
                  key={p._id} 
                  className="flex items-center gap-4 p-3 hover:bg-[rgba(255,255,255,0.05)] border-b border-border last:border-0 transition-colors cursor-pointer" 
                  onClick={() => {
                    setIsSearchFocused(false)
                    if (!isAuthenticated) setAuthModalProduct(p._id)
                    else navigate(`/products/${p._id}`)
                  }}
                >
                  <WatermarkedImage src={getProductImage(p.images)} className="w-12 h-12 object-cover rounded-md" alt={p.title} />
                  <div>
                    <h4 className="font-semibold text-white line-clamp-1">{p.title}</h4>
                    <p className="text-sm text-primary-400">₹{p.price ? p.price.toLocaleString('en-IN') : "0"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 relative z-40">
          <div className="relative" ref={categoryRef}>
            <Button 
              variant={appliedFilters.category ? "default" : "outline"} 
              className={`h-14 rounded-2xl gap-2 px-6 ${appliedFilters.category ? 'bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-white border-0' : 'hover:border-primary-300'}`}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Filter className="w-4 h-4" /> 
              {appliedFilters.category || "Category"}
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </Button>
            
            {/* Category Dropdown */}
            {isCategoryOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#202020] border border-border rounded-xl shadow-xl z-50 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => handleCategorySelect(null)}
                  className="w-full text-left px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] border-b border-border text-red-400 font-medium transition-colors"
                >
                  Clear Category
                </button>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full text-left px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors ${appliedFilters.category === cat ? 'text-primary-400 bg-[rgba(255,255,255,0.02)]' : 'text-gray-300'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button 
            variant={Object.keys(appliedFilters).filter(k => k !== 'q' && k !== 'category').length > 0 ? "default" : "outline"}
            className={`h-14 rounded-2xl gap-2 px-6 ${Object.keys(appliedFilters).filter(k => k !== 'q' && k !== 'category').length > 0 ? 'bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-white border-0' : 'hover:border-primary-300'}`}
            onClick={handleOpenFilters}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>
      </div>

      {/* States: Loading, Error, Empty, Data */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse border-transparent shadow-none">
              <div className="aspect-[4/3] bg-muted rounded-t-2xl"></div>
              <CardContent className="p-4 pt-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">
          <p>Failed to load products. Please check if the server is running.</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card 
              key={product._id} 
              onClick={() => {
                if (!isAuthenticated) setAuthModalProduct(product._id)
                else navigate(`/products/${product._id}`)
              }}
              className="overflow-hidden hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-transparent hover:border-border h-full flex flex-col relative group"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-muted flex-shrink-0">
                <WatermarkedImage 
                  src={getProductImage(product.images)} 
                  alt={product.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold shadow-sm text-primary-400 border border-border">
                  {product.condition}
                </div>
              </div>
              <CardContent className="p-4 pt-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {product.title}
                  </h3>
                </div>
                <p className="text-xl font-bold text-foreground mt-auto">₹{product.price ? product.price.toLocaleString('en-IN') : "0"}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 line-clamp-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {product.college || "Campus"}
                </div>
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    if (!isAuthenticated) setAuthModalProduct(product._id)
                    else navigate(`/products/${product._id}`)
                  }}
                  className="flex items-center justify-center p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full transition-colors z-10"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-[#181818] border border-border rounded-full flex items-center justify-center mb-6 shadow-soft">
            <PackageOpen className="w-12 h-12 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3 text-white">
            {appliedFilters.category || Object.keys(appliedFilters).length > 0 ? "No matching products found. Try changing your filters." : "📦 No products available yet."}
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">
            {appliedFilters.category || Object.keys(appliedFilters).length > 0 ? "Adjust your search or filter criteria to see more results." : "Be the first student to sell an item."}
          </p>
          {(appliedFilters.category || Object.keys(appliedFilters).length > 0) ? (
            <Button size="lg" variant="outline" className="rounded-2xl" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          ) : (
            <Link to="/sell">
              <Button size="lg" className="rounded-2xl gap-2 font-semibold shadow-md bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-0">
                <PlusCircle className="w-5 h-5" /> Sell Product
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Filter Overlay & Drawer */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)}></div>
          <div className="relative w-full md:w-[400px] bg-[#121212] border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 mt-0 md:mt-0">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-primary-500" /> Filters</h2>
              <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Price Range (₹)</h3>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={localFilters.minPrice || ''} 
                    onChange={e => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="bg-[#181818]"
                  />
                  <span className="text-gray-500">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={localFilters.maxPrice || ''} 
                    onChange={e => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="bg-[#181818]"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Condition</h3>
                <div className="grid grid-cols-2 gap-3">
                  {CONDITIONS.map(cond => (
                    <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${localFilters.condition?.includes(cond) ? 'bg-primary-500 border-primary-500' : 'border-gray-600 group-hover:border-primary-400'}`}>
                        {localFilters.condition?.includes(cond) && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                      </div>
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{cond}</span>
                      <input type="checkbox" className="hidden" checked={localFilters.condition?.includes(cond) || false} onChange={() => toggleCheckbox('condition', cond)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sort By</h3>
                <div className="space-y-3">
                  {SORT_OPTIONS.map(sort => (
                    <label key={sort} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${localFilters.sortBy === sort ? 'border-primary-500' : 'border-gray-600 group-hover:border-primary-400'}`}>
                        {localFilters.sortBy === sort && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>}
                      </div>
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{sort}</span>
                      <input type="radio" name="sortBy" className="hidden" checked={localFilters.sortBy === sort} onChange={() => setLocalFilters(prev => ({ ...prev, sortBy: sort }))} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Posted */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Date Posted</h3>
                <div className="space-y-3">
                  {POSTED_OPTIONS.map(posted => (
                    <label key={posted} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${localFilters.posted === posted ? 'border-primary-500' : 'border-gray-600 group-hover:border-primary-400'}`}>
                        {localFilters.posted === posted && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>}
                      </div>
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{posted}</span>
                      <input type="radio" name="posted" className="hidden" checked={localFilters.posted === posted} onChange={() => setLocalFilters(prev => ({ ...prev, posted }))} />
                    </label>
                  ))}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!localFilters.posted ? 'border-primary-500' : 'border-gray-600 group-hover:border-primary-400'}`}>
                      {!localFilters.posted && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>}
                    </div>
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">Any time</span>
                    <input type="radio" name="posted" className="hidden" checked={!localFilters.posted} onChange={() => setLocalFilters(prev => ({ ...prev, posted: undefined }))} />
                  </label>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Availability</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABILITY.map(avail => (
                    <label key={avail} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${localFilters.availability?.includes(avail) ? 'bg-primary-500 border-primary-500' : 'border-gray-600 group-hover:border-primary-400'}`}>
                        {localFilters.availability?.includes(avail) && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                      </div>
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{avail}</span>
                      <input type="checkbox" className="hidden" checked={localFilters.availability?.includes(avail) || false} onChange={() => toggleCheckbox('availability', avail)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Campus */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Campus</h3>
                <Input 
                  placeholder="E.g. Main Campus, North Campus" 
                  value={localFilters.campus || ''}
                  onChange={e => setLocalFilters(prev => ({ ...prev, campus: e.target.value }))}
                  className="bg-[#181818]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border bg-[#121212] flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={handleResetFilters}>
                Reset
              </Button>
              <Button className="flex-1 rounded-xl h-12 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-0" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Authentication Guard Modal */}
      {authModalProduct && (
        <AuthGuardModal 
          productId={authModalProduct} 
          onClose={() => setAuthModalProduct(null)} 
        />
      )}
    </div>
  )
}
