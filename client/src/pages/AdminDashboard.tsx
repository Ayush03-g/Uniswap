import { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Loader2, Users, ShoppingBag, Package, Trash2, Ban, UserCheck, ShieldAlert, FileText, CheckCircle2, MessageSquare, Bell, ShoppingCart, HelpCircle, Settings, Check, X, BookOpen, Megaphone, BarChart3, Edit, Activity, Shield, FileWarning } from "lucide-react"
import { getProductImage } from "../utils/image"
import { getMaleAvatarForUser } from "../utils/avatar"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { 
  useGetAdminAnalyticsQuery, 
  useGetAdminUsersQuery, 
  useUpdateAdminUserStatusMutation, 
  useDeleteAdminUserMutation,
  useGetAdminProductsQuery,
  useUpdateAdminProductStatusMutation,
  useDeleteAdminProductMutation,
  useGetAdminNotesQuery,
  useUpdateAdminNoteStatusMutation,
  useDeleteAdminNoteMutation,
  usePostAdminNotificationMutation,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation
} from "../features/api/apiSlice"

export function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/')
    }
  }, [user, navigate])

  const { data: analytics, refetch: refetchAnalytics } = useGetAdminAnalyticsQuery(undefined, { skip: user?.role !== 'ADMIN' })
  const { data: users, refetch: refetchUsers } = useGetAdminUsersQuery(undefined, { skip: user?.role !== 'ADMIN' || activeTab !== 'users' })
  const { data: products, refetch: refetchProducts } = useGetAdminProductsQuery(undefined, { skip: user?.role !== 'ADMIN' || activeTab !== 'products' })
  const { data: notes, refetch: refetchNotes } = useGetAdminNotesQuery(undefined, { skip: user?.role !== 'ADMIN' || activeTab !== 'notes' })
  const { data: settings, refetch: refetchSettings } = useGetAdminSettingsQuery(undefined, { skip: user?.role !== 'ADMIN' || activeTab !== 'settings' })

  const [updateUserStatus] = useUpdateAdminUserStatusMutation()
  const [deleteUser] = useDeleteAdminUserMutation()
  const [updateProductStatus] = useUpdateAdminProductStatusMutation()
  const [deleteProduct] = useDeleteAdminProductMutation()
  const [updateNoteStatus] = useUpdateAdminNoteStatusMutation()
  const [deleteNote] = useDeleteAdminNoteMutation()
  const [postNotification] = usePostAdminNotificationMutation()
  const [updateSettings] = useUpdateAdminSettingsMutation()

  if (user?.role !== 'ADMIN') return null

  const handleBanUser = async (id: string, currentStatus: string) => {
    if (window.confirm(`Are you sure you want to ${currentStatus === 'BANNED' ? 'unban' : 'ban'} this user?`)) {
      await updateUserStatus({ id, status: currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED' })
      refetchUsers()
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to completely delete this user and all their listings? This cannot be undone.")) {
      await deleteUser(id)
      refetchUsers()
      refetchAnalytics()
    }
  }

  const handleMarkSold = async (id: string) => {
    if (window.confirm("Mark this product as sold?")) {
      await updateProductStatus({ id, status: 'sold' })
      refetchProducts()
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Delete this product listing?")) {
      await deleteProduct(id)
      refetchProducts()
      refetchAnalytics()
    }
  }

  const handleApproveNote = async (id: string) => {
    await updateNoteStatus({ id, status: 'approved' })
    refetchNotes()
  }

  const handleRejectNote = async (id: string) => {
    await updateNoteStatus({ id, status: 'rejected' })
    refetchNotes()
  }

  const handleDeleteNote = async (id: string) => {
    if (window.confirm("Delete this note?")) {
      await deleteNote(id)
      refetchNotes()
      refetchAnalytics()
    }
  }

  const handleSendNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const title = (form.elements.namedItem("title") as HTMLInputElement).value
    const message = (form.elements.namedItem("message") as HTMLInputElement).value
    const recipients = (form.elements.namedItem("recipients") as HTMLSelectElement).value
    
    if (!message) return
    
    if (window.confirm(`Send this notification to ${recipients === 'ALL' ? 'ALL users' : 'selected user'}?`)) {
      await postNotification({ title, message, recipients })
      alert("✔ Notification Sent Successfully")
      form.reset()
    }
  }

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      platformName: (form.elements.namedItem("platformName") as HTMLInputElement).value,
      maintenanceMode: (form.elements.namedItem("maintenanceMode") as HTMLInputElement).checked,
      supportEmail: (form.elements.namedItem("supportEmail") as HTMLInputElement).value,
      whatsappNumber: (form.elements.namedItem("whatsappNumber") as HTMLInputElement).value,
      universityEmailDomain: (form.elements.namedItem("universityEmailDomain") as HTMLInputElement).value,
    }
    await updateSettings(data)
    alert("Settings updated!")
    refetchSettings()
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-900/50 text-purple-400 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-900/50 text-emerald-400 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Products</p>
                <h3 className="text-2xl font-bold text-white">{analytics?.totalProducts || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-900/50 text-blue-400 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Notes Listed</p>
                <h3 className="text-2xl font-bold text-white">{analytics?.totalNotes || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-900/50 text-amber-400 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Chats</p>
                <h3 className="text-2xl font-bold text-white">{analytics?.totalChats || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A] col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Detailed Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Active Users</span>
                <span className="font-bold text-xl text-emerald-400">{analytics?.totalUsers ? (analytics.totalUsers - (analytics.bannedUsers || 0)) : 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Banned Users</span>
                <span className="font-bold text-xl text-rose-400">{analytics?.bannedUsers || 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Products Sold</span>
                <span className="font-bold text-xl text-primary-400">{analytics?.soldListings || 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Total Reports</span>
                <span className="font-bold text-xl text-amber-400">{analytics?.totalReports || 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Support Tickets</span>
                <span className="font-bold text-xl text-blue-400">{analytics?.totalSupportTickets || 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Notifications</span>
                <span className="font-bold text-xl text-rose-400">{analytics?.totalNotifications || 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">Listed Today</span>
                <span className="font-bold text-xl text-purple-400">{analytics?.productsListedToday || 0}</span>
              </div>
              <div className="p-4 bg-[#252525] rounded-xl">
                <span className="text-muted-foreground block mb-1">New (5 Days)</span>
                <span className="font-bold text-xl text-emerald-400">{analytics?.newProductsLast5Days || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent shadow-soft-sm bg-gradient-to-br from-rose-900/20 to-purple-900/20 border border-rose-500/20">
          <CardContent className="p-6 flex flex-col justify-center h-full text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-rose-500" />
            <h3 className="text-xl font-bold text-white mb-2">Send Notification</h3>
            <p className="text-sm text-gray-400 mb-6">Broadcast an important message instantly.</p>
            <form onSubmit={handleSendNotification} className="text-left space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Recipient(s)</label>
                <select name="recipients" className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500" required>
                  <option value="ALL">All Users</option>
                  {users?.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Title</label>
                <input 
                  name="title"
                  type="text"
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500" 
                  placeholder="e.g. System Maintenance"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Message</label>
                <textarea 
                  name="message"
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500" 
                  rows={3} 
                  placeholder="Type your message here..."
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold mt-2">
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUsers = () => (
    <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#252525] text-muted-foreground text-sm">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {users?.map((u: any) => (
              <tr key={u._id} className="hover:bg-[#202020] transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={u.profilePicture || getMaleAvatarForUser(u.name)} alt={u.name} className="w-10 h-10 rounded-full bg-[#333] border border-[#444]" />
                  <div>
                    <span className="font-medium text-white block">{u.name}</span>
                    <span className="text-xs text-gray-500">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'BANNED' ? 'bg-rose-900/50 text-rose-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                    {u.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#333]"><Edit size={14}/></Button>
                  {u.role !== 'ADMIN' && (
                    <>
                      <Button onClick={() => handleBanUser(u._id, u.status || 'ACTIVE')} variant="outline" size="sm" className={`px-3 py-1 text-xs border ${u.status === 'BANNED' ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-950' : 'border-amber-500 text-amber-500 hover:bg-amber-950'}`}>
                        {u.status === 'BANNED' ? 'Unban' : 'Ban'}
                      </Button>
                      <Button onClick={() => handleDeleteUser(u._id)} variant="outline" size="sm" className="px-3 py-1 text-xs border border-rose-500 text-rose-500 hover:bg-rose-950">
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )

  const renderProducts = () => (
    <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#252525] text-muted-foreground text-sm">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Seller</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {products?.map((p: any) => (
              <tr key={p._id} className="hover:bg-[#202020] transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-[#333] overflow-hidden shrink-0">
                    <img src={getProductImage(p.images)} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-medium text-white line-clamp-1">{p.title}</span>
                    <span className="text-xs text-gray-500">{p.category}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400">{p.sellerId?.name || 'Unknown'}</td>
                <td className="p-4 text-emerald-400 font-bold">₹{p.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'sold' ? 'bg-primary-900/50 text-primary-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {p.status !== 'sold' && (
                    <Button onClick={() => handleMarkSold(p._id)} variant="outline" size="sm" className="px-3 py-1 text-xs border border-primary-500 text-primary-500 hover:bg-primary-950">
                      Mark Sold
                    </Button>
                  )}
                  <Button onClick={() => handleDeleteProduct(p._id)} variant="outline" size="sm" className="px-3 py-1 text-xs border border-rose-500 text-rose-500 hover:bg-rose-950">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )

  const renderNotes = () => (
    <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#252525] text-muted-foreground text-sm">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Uploader</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {notes?.map((n: any) => (
              <tr key={n._id} className="hover:bg-[#202020] transition-colors">
                <td className="p-4 font-medium text-white">{n.title}</td>
                <td className="p-4 text-sm text-gray-400">{n.subject}</td>
                <td className="p-4 text-sm text-gray-400">{n.sellerId?.name || 'Unknown'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    n.status === 'approved' ? 'bg-emerald-900/50 text-emerald-400' : 
                    n.status === 'rejected' ? 'bg-rose-900/50 text-rose-400' : 'bg-amber-900/50 text-amber-400'
                  }`}>
                    {n.status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button onClick={() => handleApproveNote(n._id)} variant="outline" size="sm" className="h-8 w-8 text-emerald-500 border-emerald-500 hover:bg-emerald-950 p-0"><Check size={14}/></Button>
                  <Button onClick={() => handleRejectNote(n._id)} variant="outline" size="sm" className="h-8 w-8 text-amber-500 border-amber-500 hover:bg-amber-950 p-0"><X size={14}/></Button>
                  <Button onClick={() => handleDeleteNote(n._id)} variant="outline" size="sm" className="h-8 w-8 text-rose-500 border-rose-500 hover:bg-rose-950 p-0"><Trash2 size={14}/></Button>
                </td>
              </tr>
            ))}
            {(!notes || notes.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No notes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )

  const renderSettings = () => (
    <Card className="border-transparent shadow-soft-sm bg-[#1A1A1A] max-w-2xl">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">Platform Settings</h3>
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
            <input type="text" name="platformName" defaultValue={settings?.platformName} className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none" required />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 cursor-pointer">
              <input type="checkbox" name="maintenanceMode" defaultChecked={settings?.maintenanceMode} className="w-5 h-5 accent-rose-500 rounded bg-[#252525] border border-[#333]" />
              Maintenance Mode (On/Off)
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">University Email Domain</label>
            <input type="text" name="universityEmailDomain" defaultValue={settings?.universityEmailDomain} className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
            <input type="email" name="supportEmail" defaultValue={settings?.supportEmail} className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Contact Number</label>
            <input type="text" name="whatsappNumber" defaultValue={settings?.whatsappNumber} className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none" required />
          </div>
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-8">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'reports', label: 'Reports', icon: FileWarning },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#0F0F0F] text-gray-200">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A1A1A] border-r border-[#333] flex flex-col h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-rose-500">Portal</span></h2>
          </div>
          <p className="text-xs text-rose-400 font-medium tracking-wide uppercase">Unrestricted Access</p>
        </div>
        
        <nav className="flex-1 px-4 pb-6 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                    : 'text-gray-400 hover:bg-[#252525] hover:text-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <header className="px-8 py-6 border-b border-[#333] bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white capitalize">{tabs.find(t => t.id === activeTab)?.label}</h1>
        </header>

        <main className="p-8 flex-1">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'notes' && renderNotes()}
          {activeTab === 'settings' && renderSettings()}
          {['chats', 'support', 'reports', 'analytics'].includes(activeTab) && (
            <div className="text-center py-20 text-muted-foreground bg-[#1A1A1A] rounded-2xl border border-dashed border-[#444]">
              <FileWarning className="w-12 h-12 mx-auto mb-4 opacity-20 text-rose-500" />
              <p className="text-lg text-gray-400">The {activeTab} panel is currently under construction and will be deployed in v2.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
