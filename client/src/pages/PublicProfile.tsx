import { useParams, useNavigate } from "react-router-dom"
import { useGetPublicProfileQuery, useCreateDirectChatMutation } from "../features/api/apiSlice"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { MessageSquare, Share2, UserPlus, Phone } from "lucide-react"
import { getMaleAvatarForUser } from "../utils/avatar"

export function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const isMe = user?.id === id

  const { data: stats, isLoading } = useGetPublicProfileQuery(id, { skip: !id })
  const [createDirectChat, { isLoading: isCreatingChat }] = useCreateDirectChatMutation()

  const handleMessage = async () => {
    if (isMe) return
    try {
      const res = await createDirectChat({ receiverId: id }).unwrap()
      navigate(`/chat?conversationId=${res.conversationId}`)
    } catch (err) {
      console.error(err)
      alert("Failed to start conversation")
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-white">Loading profile...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-[#1A1A1A] border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-900"></div>
        <CardContent className="p-6 relative pt-0 text-center">
          <div className="w-32 h-32 bg-[#121212] rounded-full mx-auto -mt-16 flex items-center justify-center shadow-xl p-1 mb-4 border-4 border-[#121212]">
            <img 
              src={getMaleAvatarForUser(stats?.name || "User")} 
              alt={stats?.name || "User"} 
              className="w-full h-full rounded-full object-cover" 
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-1">{stats?.name || "User"}</h2>
          <p className="text-gray-400 mb-6">UniSwap Member</p>

          <div className="flex justify-center gap-4 flex-wrap">
            {isMe ? (
              <Button onClick={() => navigate('/profile')} className="bg-primary-600 hover:bg-primary-500 rounded-xl px-6">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleMessage} disabled={isCreatingChat} className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl gap-2 font-bold px-6 shadow-[0_0_15px_rgba(108,59,255,0.3)]">
                  <MessageSquare className="w-4 h-4" /> Message
                </Button>
                <Button variant="outline" className="bg-[#121212] border-white/10 text-white hover:bg-white/5 rounded-xl gap-2">
                  <UserPlus className="w-4 h-4" /> Follow
                </Button>
                <Button variant="outline" className="bg-[#121212] border-white/10 text-white hover:bg-white/5 rounded-xl gap-2">
                  <Share2 className="w-4 h-4" /> Share Profile
                </Button>
                <Button variant="outline" className="bg-[#121212] border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 rounded-xl gap-2">
                  <Phone className="w-4 h-4" /> WhatsApp
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
