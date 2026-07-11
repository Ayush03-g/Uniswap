import { useState } from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { WatermarkedImage } from "../components/ui/WatermarkedImage"
import { getProductImage } from "../utils/image"
import { Check, X, MessageCircle, Package, Trash2, Loader2 } from "lucide-react"
import { useGetProductsQuery, useDeleteProductMutation } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { Link } from "react-router-dom"

export function MyListings() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { data: products = [], isLoading: isLoadingProducts } = useGetProductsQuery(`sellerId=${user?.id}`, { skip: !user })
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  
  const [requests, setRequests] = useState<any[]>([])
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAccept = (id: number) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: "accepted" } : r))
  }

  const handleReject = (id: number) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: "rejected" } : r))
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    setDeletingId(productToDelete)
    setShowDeleteModal(false)
    
    try {
      await deleteProduct(productToDelete).unwrap()
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      console.error("Failed to delete product", err)
      alert("Failed to delete product. Please try again.")
    } finally {
      setDeletingId(null)
      setProductToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-full flex items-center gap-2 shadow-xl animate-in slide-in-from-top-5 fade-in duration-300">
          <Check className="w-5 h-5" />
          <span className="font-medium">Listing deleted successfully.</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl border-rose-500/20 animate-in zoom-in-95 duration-200 bg-[#181818]">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Delete Listing?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to delete this listing?<br/>This action cannot be undone.
              </p>
              <div className="flex gap-4 mt-6">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowDeleteModal(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-none" onClick={handleDeleteConfirm}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground">Manage your products and purchase requests</p>
        </div>
      </div>
      
      <div className="grid gap-12 max-w-4xl">
        {/* Products Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Products</h2>
          
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-primary-200">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-foreground">You haven't listed any products yet.</h3>
              <p className="text-muted-foreground mt-1 mb-6">Start selling to reach more students.</p>
              <Link to="/sell">
                <Button className="rounded-xl px-8 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-soft-lg">
                  Sell Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {products.map((product: any) => (
                <Card 
                  key={product._id} 
                  className={`border-primary-100 shadow-soft-md transition-all duration-300 ${deletingId === product._id ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 hover:shadow-soft-lg'}`}
                >
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative group">
                        <WatermarkedImage 
                          src={getProductImage(product.images)} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      
                      {/* Delete Icon */}
                      <button 
                        onClick={() => { setProductToDelete(product._id); setShowDeleteModal(true); }}
                        className="absolute top-2 right-2 w-[38px] h-[38px] rounded-full bg-black/50 hover:bg-[#EF4444] text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 z-10"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/products/${product._id}`} className="hover:underline">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.title}</h3>
                        </Link>
                        <span className="font-bold text-primary-600 text-lg shrink-0">₹{product.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>{product.category}</span>
                        <span>•</span>
                        <span>{product.condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${product.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                          {product.status}
                        </div>
                        <span className="text-xs text-muted-foreground">Listed {new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Requests Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-primary-200">
              <Package className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No purchase requests yet</h3>
              <p className="text-muted-foreground mt-1">When someone wants to buy your items, requests will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {requests.map(req => (
                <Card key={req.id} className="border-primary-100 shadow-soft-md transition-all hover:shadow-soft-lg">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <WatermarkedImage 
                          src={getProductImage([req.image])} 
                          alt={req.product} 
                          className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-foreground">{req.product}</h3>
                        <span className="text-sm text-muted-foreground">{req.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Requested by <span className="font-medium text-foreground">{req.buyer}</span> • Offered: <span className="font-bold text-primary-600">₹{req.price}</span>
                      </p>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                        ${req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 
                          'bg-rose-100 text-rose-800'}`}>
                        {req.status}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                      {req.status === "pending" && (
                        <>
                          <Button onClick={() => handleAccept(req.id)} className="flex-1 md:flex-none gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                            <Check className="w-4 h-4" /> Accept
                          </Button>
                          <Button onClick={() => handleReject(req.id)} variant="outline" className="flex-1 md:flex-none gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl">
                            <X className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}
                      <Button variant="secondary" className="flex-1 md:flex-none gap-2 rounded-xl">
                        <MessageCircle className="w-4 h-4" /> Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
