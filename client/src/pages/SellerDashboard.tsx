import { Card, CardContent } from "../components/ui/Card"
import { BarChart3, Package, Users, DollarSign } from "lucide-react"

export function SellerDashboard() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-primary-900">Seller Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-transparent shadow-soft-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">Total Sales</h3>
              <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">₹0</p>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-soft-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">Active Listings</h3>
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-soft-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">Customers</h3>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-soft-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">Views</h3>
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-transparent shadow-soft-md min-h-[400px]">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="text-center py-20 text-muted-foreground">
            No orders yet. Start listing products to get sales!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
