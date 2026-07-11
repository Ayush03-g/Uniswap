import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Heart, MapPin, Share2, Shield, MessageCircle, ShoppingCart, Loader2, PlusCircle, X, Copy, CheckCircle2, Download, Smartphone, Send, Mail, Lock, Edit } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { WatermarkedImage } from "../components/ui/WatermarkedImage"
import { useGetProductByIdQuery, useCreatePurchaseRequestMutation, useAddToCartMutation, useGetCartQuery } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { AuthGuardModal } from "../components/AuthGuardModal"
import { Chat } from "./Chat"
import { getMaleAvatarForUser } from "../utils/avatar"

export function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id)
  const [createPurchaseRequest] = useCreatePurchaseRequestMutation()
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [showRestrictedModal, setShowRestrictedModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [id])
  
  // Share state
  const [showShareModal, setShowShareModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login first to add to cart")
      navigate("/login")
      return
    }
    
    const isDuplicate = cartData?.items?.some((item: any) => item.productId?._id === product?._id || item.productId === product?._id);
    if (isDuplicate) {
      alert("This product is already in your cart.")
      return
    }

    try {
      await addToCart({ productId: product?._id }).unwrap()
      alert("Added to cart successfully!")
    } catch (err: any) {
      console.error("Failed to add to cart", err)
      alert(err.data?.message || "Failed to add to cart")
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } })
      return
    }
    
    if (user?.id === product?.sellerId) {
      alert("You cannot buy your own product!")
      return
    }
    
    setShowPurchaseModal(true)
  }

  const handleInterested = async () => {
    try {
      setIsRequesting(true)
      const res = await createPurchaseRequest({
        productId: product?._id,
        sellerId: product?.sellerId
      }).unwrap()
      
      if (res.conversationId) {
        setActiveConversationId(res.conversationId)
      }
      setShowPurchaseModal(false)
      setShowChatModal(true)
    } catch (err: any) {
      console.error("Failed to create request", err)
      alert(err.data?.message || "Failed to send purchase request")
    } finally {
      setIsRequesting(false)
    }
  }

  // --- SHARE FUNCTIONALITY ---
  const productUrl = `${window.location.origin}/products/${id}`
  const shareText = `📦 ${product?.title}\n₹${product?.price?.toLocaleString('en-IN')}\n${product?.category}\n\nCheck out this product on UniSwap.\n${productUrl}`

  const handleShareBtnClick = async () => {
    if (navigator.share && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: product?.title || 'UniSwap Product',
          text: `Check out this ${product?.title} on UniSwap!`,
          url: productUrl,
        });
        return;
      } catch (err) {
        console.log('Native sharing failed or cancelled.', err);
      }
    }
    // Fallback to custom modal
    setShowShareModal(true);
  }

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    triggerToast();
  }

  const handleCopyDetails = () => {
    const details = `${product?.title}\nPrice: ₹${product?.price?.toLocaleString('en-IN')}\nCategory: ${product?.category}\nCondition: ${product?.condition}\n\nView Product:\n${productUrl}`
    navigator.clipboard.writeText(details);
    triggerToast();
  }

  // Generate a QR Code using QR Server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}&margin=10`;

  const downloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `UniSwap-QR-${product?._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download QR code", err);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-rose-500">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/dashboard">
          <Button variant="outline">Return to Marketplace</Button>
        </Link>
      </div>
    )
  }

  // Format date
  const listedDate = product.createdAt 
    ? new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : "Recently"

  // Format initials
  const initials = product.sellerName ? product.sellerName.substring(0, 2).toUpperCase() : "AN"

  // Base URL for images
  const getImageUrl = (path: string) => `http://localhost:5000${path}`
  
  const hasImages = product.images && product.images.length > 0
  const coverImage = hasImages ? getImageUrl(product.images[selectedImage]) : ""

  const isOwner = isAuthenticated && user && product && (user.id === product.sellerId || user.id === product.seller?._id);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-full flex items-center gap-2 shadow-xl animate-in slide-in-from-top-5 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Copied to clipboard.</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images */}
        <div className="w-full lg:w-3/5 space-y-4">
          <div 
            className="aspect-video bg-[#181818] rounded-3xl overflow-hidden relative flex items-center justify-center border border-border cursor-pointer group"
            onClick={() => hasImages && setLightboxOpen(true)}
          >
            {hasImages ? (
              <WatermarkedImage 
                src={coverImage} 
                alt={product.title} 
                className="object-contain w-full h-full bg-[#181818] transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="text-muted-foreground">No images uploaded</span>
            )}
            
            {hasImages && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 text-white rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm transform scale-90 group-hover:scale-100 shadow-xl border border-white/20">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={selectedImage}
            on={{ view: ({ index }) => setSelectedImage(index) }}
            slides={hasImages ? product.images.map((img: string) => ({ src: getImageUrl(img) })) : []}
            plugins={[Zoom, Thumbnails, Counter]}
            animation={{ fade: 250, swipe: 250 }}
            controller={{ closeOnBackdropClick: true }}
            styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.95)", backdropFilter: "blur(10px)" } }}
          />
          
          {hasImages && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-24 h-24 bg-[#181818] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === idx ? 'border-primary-500' : 'border-transparent hover:border-primary-400'}`}
                >
                  <WatermarkedImage 
                    src={getImageUrl(img)} 
                    alt={`Thumbnail ${idx}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full lg:w-2/5 flex flex-col relative">
          <div className="mb-6 relative">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-primary-600 font-medium">{product.condition}</span>
            </div>
            
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-foreground flex-1 pr-12">{product.title || "Untitled Product"}</h1>
              <button 
                onClick={handleShareBtnClick} 
                className="absolute top-8 right-0 w-[42px] h-[42px] rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary-500/20 hover:border-primary-500 hover:text-primary-400 hover:shadow-[0_0_15px_rgba(108,59,255,0.4)] transition-all transform hover:scale-110 z-10"
                title="Share Product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-4xl font-extrabold text-foreground mb-4">₹{product.price ? product.price.toLocaleString('en-IN') : "0"}</p>
            <div className="flex items-center gap-2 text-muted-foreground mb-6 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{product.college || "Campus"}</span>
              <span>•</span>
              <span>Listed {listedDate}</span>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#6C3BFF]/50 bg-[#1A1A1A] shadow-lg">
                  <img 
                    src={product.seller?.profilePicture || getMaleAvatarForUser(product.seller?.name || product.sellerName)} 
                    alt="Seller" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{product.sellerName || "Anonymous Seller"}</h3>
                  <p className="text-sm text-muted-foreground capitalize">Seller</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/user/' + (product.seller?._id || product.seller))}>View Profile</Button>
              </div>
            </CardContent>
          </Card>

          {showRestrictedModal && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex items-center gap-3 mb-6 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#6C3BFF]/50 bg-[#1A1A1A]">
                      <img 
                        src={product.seller?.profilePicture || getMaleAvatarForUser(product.seller?.name || product.sellerName)} 
                        alt="Seller" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold">Profile Restricted</h3>
                      <p className="text-muted-foreground text-sm">
                        Seller profiles are restricted to protect user privacy. You can chat with the seller directly to know more about the product.
                      </p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 rounded-xl" onClick={() => setShowRestrictedModal(false)}>Understood</Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4 mb-8 flex-1">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            {isOwner ? (
              <div className="bg-primary-900/20 border border-primary-500/30 rounded-2xl p-4 text-center">
                <p className="text-primary-300 font-medium mb-3">This is your own listing.</p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" size="sm" className="gap-2 border-primary-500/50 hover:bg-primary-500/20" onClick={() => navigate('/my-listings')}>
                    <Edit className="w-4 h-4" /> Manage Listing
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <Button size="lg" className="flex-1 rounded-2xl shadow-soft-lg gap-2" onClick={handleBuyNow} disabled={isRequesting}>
                    {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />} 
                    {isRequesting ? "Sending..." : "Buy Now"}
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1 rounded-2xl gap-2 border-primary-200 text-primary-700 hover:bg-primary-50" onClick={handleAddToCart} disabled={isAddingToCart}>
                    {isAddingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />} 
                    Add to Cart
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-2xl gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white border-none shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-all hover:scale-[1.02]" 
                    onClick={() => {
                      if (!product?.whatsappNumber) {
                        alert("Seller has not provided a WhatsApp contact.");
                        return;
                      }
                      let number = product.whatsappNumber.replace(/\D/g, '');
                      if (number.length === 10) number = `91${number}`;
                      
                      const imageUrl = (hasImages && product.images && product.images[0]) ? getImageUrl(product.images[0]) : '';
                      const imageSection = imageUrl ? `\n🖼 Product Image:\n${imageUrl}\n` : '';
                      
                      const msg = `Hello! 👋\n\nI found your product on UniSwap and I'm interested in buying it.\n\n📦 Product: ${product.title}\n\n💰 Price: ₹${product.price?.toLocaleString('en-IN')}\n${imageSection}\nCould you please let me know if it is still available?`;
                      window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    WhatsApp Seller
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end lg:justify-center items-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#181818] w-full max-w-md rounded-t-3xl lg:rounded-3xl shadow-2xl border border-primary-500/20 overflow-hidden animate-in slide-in-from-bottom-10 lg:zoom-in-95 duration-300">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[#202020]">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary-500" /> Share Product
              </h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-400 hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2 mb-6">
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">WhatsApp</span>
                </a>
                
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">Facebook</span>
                </a>

                <button onClick={() => { handleCopyLink(); setShowShareModal(false); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center group-hover:bg-pink-500/20 group-hover:scale-110 transition-all">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">Instagram</span>
                </button>

                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`Check out ${product?.title} on UniSwap!`)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-500/10 border border-gray-500/20 text-gray-300 flex items-center justify-center group-hover:bg-gray-500/20 group-hover:scale-110 transition-all">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.9 3.5h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.3-7-6.1 7H2l7.8-8.9L1.6 3.5h7l4.8 6.3 5.5-6.3zm-1.2 18h1.9L7.2 5.3H5.1l12.6 16.2z"></path></svg>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">X (Twitter)</span>
                </a>

                <a href={`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:scale-110 transition-all">
                    <Send className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">Telegram</span>
                </a>

                <a href={`mailto:?subject=${encodeURIComponent(`Check out ${product?.title} on UniSwap`)}&body=${encodeURIComponent(shareText)}`} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:scale-110 transition-all">
                    <Mail className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">Email</span>
                </a>
                
                <button onClick={() => { handleCopyLink(); setShowShareModal(false); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center group-hover:bg-primary-500/20 group-hover:scale-110 transition-all">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">Copy Link</span>
                </button>

                <button onClick={() => { handleCopyDetails(); setShowShareModal(false); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all">
                    <Copy className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors text-center">Details</span>
                </button>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.05)] pt-6 flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider">Scan QR Code</p>
                <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-primary-100 relative group overflow-hidden">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={downloadQR} className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-500 transform hover:scale-110 transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Purchase Request Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#121212] w-full max-w-[440px] max-h-[88vh] rounded-[18px] shadow-2xl border-2 border-primary-500 overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-5 flex flex-col items-center">
              <h2 className="text-[26px] font-bold text-white mb-4 mt-2">Purchase Request</h2>
              
              <div className="w-[110px] h-[110px] rounded-2xl bg-[#1A1A1A] border border-white/10 overflow-hidden mb-3">
                {hasImages ? (
                  <WatermarkedImage src={coverImage} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Image</div>
                )}
              </div>
              
              <h3 className="text-xl font-extrabold text-white text-center mb-1">{product.title || "Untitled Product"}</h3>
              <p className="text-sm text-gray-400 mb-3">{product.category} • {product.condition}</p>
              
              <div className="w-full bg-[#1A1A1A] rounded-xl p-3 border border-white/5 space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Seller</span>
                  <span className="text-white font-medium">{product.sellerName || "Anonymous"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Seller's Price</span>
                  <span className="text-primary-400 font-extrabold text-lg">₹{product.price ? product.price.toLocaleString('en-IN') : "0"}</span>
                </div>
              </div>

              <p className="text-white font-medium mb-4 text-center text-base">
                Interested in this product?
              </p>

              <div className="flex flex-col gap-2 w-full">
                <Button 
                  size="lg" 
                  className="w-full rounded-[14px] bg-primary-600 hover:bg-primary-500 text-white font-bold h-12 text-base border-none shadow-[0_0_20px_rgba(108,59,255,0.3)] transition-all transform hover:scale-[1.01]"
                  onClick={handleInterested}
                  disabled={isRequesting}
                >
                  {isRequesting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "🟣 Interested"}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full rounded-[14px] bg-[#1A1A1A] hover:bg-[#252525] text-white border-white/10 h-12 text-base transition-all"
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={isRequesting}
                >
                  ⚪ Not Interested
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showChatModal && (
        <Chat isModal={true} modalConversationId={activeConversationId} onClose={() => setShowChatModal(false)} />
      )}
    </div>
  )
}
