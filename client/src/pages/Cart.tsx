import { useGetCartQuery, useRemoveFromCartMutation, useCreateOrderMutation } from "../features/api/apiSlice"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { Trash2, ShoppingBag, Loader2, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { getProductImage } from "../utils/image"

export function Cart() {
  const { data: cart, isLoading } = useGetCartQuery({})
  const [removeFromCart] = useRemoveFromCartMutation()
  const [createOrder] = useCreateOrderMutation()
  const navigate = useNavigate()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId).unwrap()
    } catch (err) {
      console.error("Failed to remove item", err)
    }
  }

  const handleCheckout = async () => {
    if (!cart?.items?.length) return
    setIsCheckingOut(true)
    try {
      await createOrder({ items: cart.items }).unwrap()
      alert("Order placed successfully!")
      navigate("/purchases")
    } catch (err: any) {
      alert(err.data?.message || "Failed to checkout")
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-[#202020] border border-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft hover:border-primary-500 transition-colors duration-300">
          <ShoppingBag className="w-12 h-12 text-primary-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Start exploring products and add your favorite items.</p>
        <Link to="/">
          <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-0 shadow-md">Explore Products</Button>
        </Link>
      </div>
    )
  }

  const total = cart.items.reduce((sum: number, item: any) => sum + (item.productId?.price || item.noteId?.price || 0), 0)

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.items.map((item: any) => {
            const product = item.productId || item.noteId;
            if (!product) return null;
            return (
              <Card key={item._id} className="overflow-hidden border border-border bg-[#202020] shadow-sm hover:shadow-md hover:border-primary-500 transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-24 h-24 bg-[#181818] rounded-xl flex-shrink-0 overflow-hidden border border-border">
                      <img src={getProductImage(product.images)} alt={product.title || "Product"} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">{product.title || 'Unknown Product'}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{product.category || 'Note'}</p>
                    <p className="font-bold text-lg text-primary-400">₹{product.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-full" onClick={() => handleRemove(item._id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="w-full lg:w-80">
          <Card className="sticky top-24 shadow-soft bg-[#202020] border-border hover:border-primary-500 transition-colors duration-300">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-4 text-white">Order Summary</h3>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee</span>
                  <span>₹0</span>
                </div>
                <hr className="border-border my-2" />
                <div className="flex justify-between font-bold text-lg text-white">
                  <span>Total</span>
                  <span className="text-primary-400">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Button size="lg" className="w-full rounded-2xl gap-2 shadow-md bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-0" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                {!isCheckingOut && <ArrowRight className="w-4 h-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
