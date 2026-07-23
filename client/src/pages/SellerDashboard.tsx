import { Card, CardContent } from "../components/ui/Card"
import { BarChart3, Package, Users, DollarSign, MessageSquare, ExternalLink, Loader2 } from "lucide-react"
import { useGetConversationsQuery } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { useNavigate } from "react-router-dom"
import { getProductImage } from "../utils/image"
import { getMaleAvatarForUser } from "../utils/avatar"

export function SellerDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { data: conversations, isLoading } = useGetConversationsQuery(undefined, { skip: !user })
  const navigate = useNavigate()
  
  const sellerConversations = conversations?.filter((c: any) => c.sellerId?._id === user?.id || c.sellerId === user?.id) || []
  const totalUnreadChats = sellerConversations.filter((c: any) => (c.myUnreadCount || 0) > 0).length
  const totalUnreadMessages = sellerConversations.reduce((acc: number, c: any) => acc + (c.myUnreadCount || 0), 0)

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-transparent shadow-soft-md min-h-[400px] lg:col-span-2">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="text-center py-20 text-muted-foreground">
              No orders yet. Start listing products to get sales!
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-transparent shadow-soft-md flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" /> Messages & Inquiries
              </h2>
              {totalUnreadChats > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {totalUnreadChats} Unread Chat{totalUnreadChats !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500"/></div>
              ) : sellerConversations.length > 0 ? (
                sellerConversations.slice(0, 8).map((conv: any) => (
                  <div key={conv._id} onClick={() => navigate(`/chat?conversationId=${conv._id}`)} className="flex flex-col p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-200">
                        <img src={conv.buyerId?.profilePicture || getMaleAvatarForUser(conv.buyerId?.name)} alt={conv.buyerId?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm truncate">{conv.buyerId?.name || 'Buyer'}</h4>
                        </div>
                        <p className={`text-xs truncate ${(conv.myUnreadCount || 0) > 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                          {conv.lastMessage || 'Sent an inquiry'}
                        </p>
                      </div>
                      {(conv.myUnreadCount || 0) > 0 && (
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                      )}
                    </div>
                    {conv.type !== 'DIRECT_CHAT' && conv.productId && (
                      <div className="mt-2 bg-slate-100 rounded-lg p-2 flex items-center gap-2 text-xs">
                        <img src={getProductImage(conv.productId.images)} className="w-6 h-6 rounded object-cover" />
                        <span className="truncate text-slate-600 font-medium flex-1">{conv.productId.title}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No buyer inquiries yet.
                </div>
              )}
            </div>
            
            {sellerConversations.length > 0 && (
              <button onClick={() => navigate('/chat')} className="w-full mt-4 bg-primary-50 text-primary-600 hover:bg-primary-100 font-semibold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                Open Messenger <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
