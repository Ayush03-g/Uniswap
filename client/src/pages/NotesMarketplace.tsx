import { useState } from "react"
import { useGetNotesQuery, useAddNoteMutation, useAddToCartMutation } from "../features/api/apiSlice"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { BookOpen, Upload, ShoppingCart, Loader2, FileText } from "lucide-react"
import { getProductImage } from "../utils/image"
import { getMaleAvatarForUser } from "../utils/avatar"

export function NotesMarketplace() {
  const { data: notes, isLoading } = useGetNotesQuery({})
  const [addNote, { isLoading: isUploading }] = useAddNoteMutation()
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation()
  
  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !price || !file) return
    
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("price", price)
    formData.append("category", "Notes")
    formData.append("file", file)

    try {
      await addNote(formData).unwrap()
      alert("Note uploaded successfully!")
      setShowUpload(false)
      setTitle("")
      setDescription("")
      setPrice("")
      setFile(null)
    } catch (err: any) {
      alert(err.data?.message || "Failed to upload note")
    }
  }

  const handleBuy = async (noteId: string) => {
    try {
      await addToCart({ productId: noteId, quantity: 1 }).unwrap()
      alert("Added to cart!")
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary-900 mb-2">Notes Marketplace</h1>
          <p className="text-muted-foreground">Buy and sell study materials, assignments, and lecture notes.</p>
        </div>
        <Button size="lg" className="rounded-full shadow-soft-md gap-2" onClick={() => setShowUpload(!showUpload)}>
          <Upload className="w-5 h-5" />
          {showUpload ? "Cancel Upload" : "Upload Notes"}
        </Button>
      </div>

      {showUpload && (
        <Card className="mb-12 shadow-soft-xl border-primary-100 bg-primary-50/50">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-primary-900">Upload Your Notes</h2>
            <form onSubmit={handleUpload} className="space-y-4 max-w-2xl">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., CS101 Midterm Notes" className="bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea 
                  className="flex w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's included in these notes?"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Price (₹)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="bg-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">PDF File</label>
                  <Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="bg-white pt-2.5" />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full mt-4 rounded-xl" disabled={isUploading}>
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Upload to Marketplace
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {notes?.map((note: any) => (
          <Card key={note._id} className="overflow-hidden border-transparent shadow-soft-sm hover:shadow-soft-xl transition-all group">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center p-6 relative">
              <FileText className="w-24 h-24 text-primary-300 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-700">
                ₹{note.price}
              </div>
            </div>
            <CardContent className="p-5">
              <div className="text-xs text-primary-600 font-medium mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Notes
              </div>
              <h3 className="font-bold text-lg mb-1 truncate text-foreground">{note.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">{note.description}</p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center text-sm text-gray-400 mt-auto">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#6C3BFF]/50 bg-[#1A1A1A] mr-3">
                    <img 
                      src={getMaleAvatarForUser(note.sellerName || 'User')} 
                      alt="Seller" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-20">{note.sellerName || 'User'}</span>
                </div>
                <Button size="sm" className="rounded-full shadow-soft-sm gap-1" onClick={() => handleBuy(note._id)} disabled={isAdding}>
                  <ShoppingCart className="w-3 h-3" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {notes?.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            No notes found. Be the first to upload!
          </div>
        )}
      </div>
    </div>
  )
}
