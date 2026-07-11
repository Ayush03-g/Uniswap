import { useGetPurchasesQuery } from "../features/api/apiSlice"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Download, Package, Loader2 } from "lucide-react"
import { getProductImage } from "../utils/image"

export function MyPurchases() {
  const { data: purchases, isLoading } = useGetPurchasesQuery({})

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-primary-900">My Purchases</h1>
      </div>

      {!purchases || purchases.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-3xl border border-dashed border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">No purchases yet</h2>
          <p className="text-muted-foreground">When you buy items or notes, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase: any) => (
            <Card key={purchase._id} className="overflow-hidden shadow-soft-sm border-transparent hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-border pb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Order ID: {purchase._id}</span>
                    <p className="text-sm font-medium text-foreground">Placed on {new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground block">Total Amount</span>
                    <span className="font-bold text-lg text-primary-600">₹{purchase.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {purchase.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 overflow-hidden">
                          <img src={getProductImage(item.product?.images)} alt={item.product?.title || "Product"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.product?.title || 'Unknown Item'}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div>
                        {item.product?.category === 'Notes' && item.product?.fileUrl ? (
                          <Button variant="outline" size="sm" className="rounded-full gap-2 text-primary-600 border-primary-200 hover:bg-primary-50" onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.product.fileUrl}`, '_blank')}>
                            <Download className="w-4 h-4" /> Download PDF
                          </Button>
                        ) : (
                          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
