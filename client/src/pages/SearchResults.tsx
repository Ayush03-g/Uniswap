import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Search, MapPin, Heart, ShoppingCart } from "lucide-react"
import { useSearchProductsQuery } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import { AuthGuardModal } from "../components/AuthGuardModal"
import { Card, CardContent, CardFooter } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { getProductImage } from "../utils/image"

export function SearchResults() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  
  const { data: products = [], isLoading, isError } = useSearchProductsQuery(query, { skip: !query })
  const [authModalProduct, setAuthModalProduct] = useState<string | null>(null)
  const { isAuthenticated } = useSelector((state: any) => state.auth)

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
        <p className="text-muted-foreground">Showing results for "{query}"</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          <p>Failed to load search results. Please check if the server is running.</p>
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
                  <img 
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
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!isAuthenticated) setAuthModalProduct(product._id) }}
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
            <Search className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3 text-white">No products found.</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Try another keyword or check back later.
          </p>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/")}>Back to Home</Button>
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
