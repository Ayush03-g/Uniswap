import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { getProductImage } from "../utils/image"
import { Input } from "../components/ui/Input"
import { 
  User, Package, ShoppingBag, Heart, Eye, IndianRupee, 
  MapPin, BookOpen, GraduationCap, Phone, Calendar, CheckCircle, 
  XCircle, Edit3, X, Eye as EyeIcon, Trash2, Edit2
} from "lucide-react"
import { useGetProfileDashboardQuery, useUpdateProfileMutation } from "../features/api/apiSlice"
import { useDispatch } from "react-redux"
import { updateUser } from "../features/auth/authSlice"
import { getMaleAvatarForUser } from "../utils/avatar"

export function ProfileDashboard() {
  const dispatch = useDispatch()
  const { data, isLoading, refetch } = useGetProfileDashboardQuery(undefined)
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    college: "",
    course: "",
    semester: "",
    profilePicture: ""
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!data) return <div className="text-center py-12 text-white">No profile data found.</div>

  const { user, purchases, stats } = data

  const handleEditClick = () => {
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      college: user.college || "",
      course: user.course || "",
      semester: user.semester || "",
      profilePicture: user.profilePicture || ""
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedUser = await updateProfile(editForm).unwrap()
      dispatch(updateUser(updatedUser))
      setIsEditModalOpen(false)
    } catch (err) {
      console.error("Failed to update profile", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl text-gray-100 bg-[#0F0F0F] min-h-screen font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information Card */}
          <Card className="bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden relative rounded-3xl">
            <div className="h-32 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6]"></div>
            <CardContent className="p-6 relative pt-0 text-center">
              <div className="w-28 h-28 bg-[#1A1A1A] rounded-full mx-auto -mt-14 flex items-center justify-center shadow-xl p-1 mb-4 border-4 border-[#1A1A1A]">
                <img 
                  src={user?.profilePicture || getMaleAvatarForUser(user?.name)} 
                  alt={user?.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-gray-400 mb-4 text-sm">{user?.email}</p>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                {user?.emailVerified ? (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="bg-rose-500/20 text-rose-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium border border-rose-500/30">
                    <XCircle className="w-3 h-3" /> Not Verified
                  </span>
                )}
              </div>

              <div className="space-y-4 text-left mb-6 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                {user?.college && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-[#8B5CF6]" /> <span>{user.college}</span>
                  </div>
                )}
                {user?.course && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <BookOpen className="w-4 h-4 text-[#8B5CF6]" /> <span>{user.course}</span>
                  </div>
                )}
                {user?.semester && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <GraduationCap className="w-4 h-4 text-[#8B5CF6]" /> <span>Semester {user.semester}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-[#8B5CF6]" /> <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-[#8B5CF6]" /> <span>Member since {formatDate(user?.createdAt)}</span>
                </div>
              </div>
              
              <Button onClick={handleEditClick} className="w-full rounded-xl bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-white border-none gap-2 transition-all">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Stats, Listings, Purchases */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Statistics Grid */}
          <h3 className="font-bold text-xl text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#8B5CF6]" /> Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={<Package className="text-blue-400" />} title="Products Listed" value={stats?.productsListed || 0} bg="bg-blue-500/10" border="border-blue-500/20" />
            <StatCard icon={<IndianRupee className="text-emerald-400" />} title="Products Sold" value={stats?.productsSold || 0} bg="bg-emerald-500/10" border="border-emerald-500/20" />
            <StatCard icon={<ShoppingBag className="text-amber-400" />} title="Products Purchased" value={stats?.productsPurchased || 0} bg="bg-amber-500/10" border="border-amber-500/20" />
          </div>


          {/* Recent Purchases */}
          <div className="flex items-center justify-between mt-8">
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B5CF6]" /> Recent Purchases
            </h3>
            <Link to="/purchases" className="text-sm text-[#8B5CF6] hover:text-[#A855F7] transition-colors">View All</Link>
          </div>

          {purchases && purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase: any) => (
                <div key={purchase._id} className="bg-[#1A1A1A] rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 flex items-center gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                      <img src={getProductImage(purchase.product?.images)} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{purchase.product?.title || "Unknown Product"}</h4>
                    <p className="text-xs text-gray-400">Order ID: #{purchase._id.substring(0,8)}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">₹{purchase.amount}</div>
                    <div className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-400/20">{purchase.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1A1A1A] rounded-3xl border border-[rgba(255,255,255,0.05)] p-8 text-center text-gray-400">
              You haven't made any purchases yet.
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] rounded-3xl w-full max-w-lg border border-[#6C3BFF]/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-[#6C3BFF]/30 flex-shrink-0 bg-[#1A1A1A]">
                    <img 
                      src={editForm.profilePicture || getMaleAvatarForUser(user?.name)} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size must be less than 5MB");
                            return;
                          }
                          const formData = new FormData();
                          formData.append("avatar", file);
                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}/api/upload/avatar`, {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.success) {
                              const avatarUrl = data.url.startsWith('http') ? data.url : `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL}${data.url}`;
                              setEditForm(prev => ({ ...prev, profilePicture: avatarUrl }));
                              const updatedUser = await updateProfile({ profilePicture: avatarUrl }).unwrap();
                              dispatch(updateUser(updatedUser));
                            } else {
                              alert("Failed to upload image");
                            }
                          } catch (err) {
                            console.error("Upload error", err);
                          }
                        }
                      }}
                      className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white file:text-white file:bg-[#6C3BFF]/20 file:border-none file:px-3 file:py-1 file:rounded-md cursor-pointer"
                    />
                    {editForm.profilePicture && (
                      <button 
                        type="button" 
                        onClick={async () => {
                          setEditForm(prev => ({ ...prev, profilePicture: "" }));
                          const updatedUser = await updateProfile({ profilePicture: "" }).unwrap();
                          dispatch(updateUser(updatedUser));
                        }}
                        className="text-xs text-rose-500 hover:text-rose-400 self-start mt-1"
                      >
                        Remove Profile Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <Input 
                  name="name" 
                  value={editForm.name} 
                  onChange={handleInputChange} 
                  required
                  className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <Input 
                  value={user?.email || ""} 
                  disabled
                  className="bg-[#202020] border-[rgba(255,255,255,0.05)] text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <Input 
                  name="phone" 
                  value={editForm.phone} 
                  onChange={handleInputChange} 
                  className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">College</label>
                <Input 
                  name="college" 
                  value={editForm.college} 
                  onChange={handleInputChange} 
                  className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Course</label>
                  <Input 
                    name="course" 
                    value={editForm.course} 
                    onChange={handleInputChange} 
                    className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Semester</label>
                  <Input 
                    name="semester" 
                    value={editForm.semester} 
                    onChange={handleInputChange} 
                    className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.1)]">
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating} className="bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-none shadow-lg">
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for hiding scrollbar on horizontal scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}

function StatCard({ icon, title, value, bg, border }: { icon: React.ReactNode, title: string, value: string | number, bg: string, border: string }) {
  return (
    <div className={`p-4 rounded-2xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.05)] hover:border-[#6C3BFF]/30 transition-all group`}>
      <div className={`w-10 h-10 rounded-xl ${bg} ${border} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs mb-1 font-medium">{title}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}
