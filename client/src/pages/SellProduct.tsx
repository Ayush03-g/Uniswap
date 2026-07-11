import React, { useState, useRef, useEffect } from "react"
import { Upload, X, CheckCircle2, Loader2, Camera, Image as ImageIcon, RefreshCw } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { useAddProductMutation } from "../features/api/apiSlice"

export function SellProduct() {
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [price, setPrice] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  
  // Modals state
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  
  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState("")
  
  // Hidden inputs
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [addProduct, { isLoading, isError }] = useAddProductMutation()

  useEffect(() => {
    if (submitted) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  }, [submitted])

  // Validate File
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) return 'Invalid format. Use JPG, PNG, or WEBP.'
    if (file.size > 5 * 1024 * 1024) return 'Image must be under 5MB.'
    return null
  }

  const handleFiles = (filesArray: File[]) => {
    setErrorMsg("")
    const validFiles: File[] = []
    
    for (let i = 0; i < filesArray.length; i++) {
      const err = validateFile(filesArray[i])
      if (err) {
        setErrorMsg(err)
        return
      }
      validFiles.push(filesArray[i])
    }

    if (replaceIndex !== null && validFiles.length > 0) {
      // Replace single image
      const newImages = [...images]
      newImages[replaceIndex] = validFiles[0]
      setImages(newImages)
      
      const newPreviews = [...imagePreviews]
      newPreviews[replaceIndex] = URL.createObjectURL(validFiles[0])
      setImagePreviews(newPreviews)
      setReplaceIndex(null)
    } else {
      // Append images
      const availableSlots = 5 - images.length
      const filesToAdd = validFiles.slice(0, availableSlots)
      
      if (validFiles.length > availableSlots) {
        setErrorMsg(`You can only upload up to 5 images. Only the first ${availableSlots} were added.`)
      }
      
      setImages(prev => [...prev, ...filesToAdd])
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
    
    setIsSelectionModalOpen(false)
  }

  const handleGalleryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      // Only accept images
      const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'))
      if (imageFiles.length > 0) {
        handleFiles(imageFiles)
      } else {
        setErrorMsg("Please drop only valid image files (JPG, PNG, WEBP).")
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove))
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove))
  }

  const openSelectionModal = (index: number | null = null) => {
    setReplaceIndex(index)
    setIsSelectionModalOpen(true)
    setErrorMsg("")
  }

  // Webcam handling
  const startWebcam = async () => {
    setCameraError("")
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsWebcamModalOpen(true)
      setIsSelectionModalOpen(false)
    } catch (err: any) {
      console.error("Camera access denied or unavailable", err)
      setCameraError("Camera access denied or unavailable. Please use the mobile camera option or choose from gallery.")
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsWebcamModalOpen(false)
  }

  useEffect(() => {
    return () => {
      stopWebcam() // cleanup on unmount
    }
  }, [stream])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
            handleFiles([file])
            stopWebcam()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (Number(price) <= 0) return
    if (images.length === 0) {
      setErrorMsg("Please upload at least one product image.")
      return
    }

    const formData = new FormData(e.currentTarget)
    images.forEach(image => {
      formData.append('images', image)
    })

    try {
      await addProduct(formData).unwrap()
      setSubmitted(true)
    } catch (err: any) {
      console.error("Failed to add product:", err)
      setErrorMsg(err.data?.message || err.message || "Failed to add product. Ensure all fields are filled correctly.")
    }
  }

  // Check if it's desktop or mobile to route "Take Photo"
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const handleTakePhotoClick = () => {
    if (isMobile) {
      // Trigger native camera via hidden input
      setIsSelectionModalOpen(false)
      cameraInputRef.current?.click()
    } else {
      // Trigger custom webcam modal
      startWebcam()
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md text-center p-8 animate-in zoom-in duration-500 bg-[#1A1A1A] border-[#6C3BFF]/30">
          <div className="w-20 h-20 bg-[#6C3BFF]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(108,59,255,0.3)]">
            <CheckCircle2 className="w-10 h-10 text-[#8B5CF6]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Listing Published!</h2>
          <p className="text-gray-400 mb-8">
            Your item is now live on the marketplace. Buyers can now contact you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" className="border-[rgba(255,255,255,0.1)] text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.1)]" onClick={() => {
              setSubmitted(false)
              setImages([])
              setImagePreviews([])
              setPrice("")
            }}>List Another Item</Button>
            <Button className="bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-none" onClick={() => window.location.href = '/'}>Discover More</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-gray-100 bg-[#0F0F0F] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Sell an Item</h1>
        <p className="text-gray-400">List your item for sale to other students on campus.</p>
        {isError && (
          <div className="mt-4 p-4 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            Failed to connect to the server. Please make sure the backend and MongoDB are running.
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-4 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            {errorMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card className="bg-[#1A1A1A] border-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="text-white">Product Details</CardTitle>
              <CardDescription className="text-gray-400">Provide clear details to help buyers find your item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Title *</label>
                <Input name="title" required placeholder="e.g. MacBook Pro M1 2020" className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category *</label>
                  <select name="category" required defaultValue="" className="flex h-10 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-[#8B5CF6]">
                    <option value="" disabled className="text-gray-500">Select a category</option>
                    {["Books", "Electronics", "Furniture", "Fashion", "Stationery", "Sports", "Lab Equipment", "Hostel Essentials", "Cycles", "Other"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Condition *</label>
                  <select name="condition" required defaultValue="" className="flex h-10 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-[#8B5CF6]">
                    <option value="" disabled className="text-gray-500">Select condition</option>
                    {["Brand New", "Like New", "Good", "Fair", "Poor"].map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description *</label>
                <textarea 
                  name="description"
                  required
                  rows={4}
                  className="flex w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-[#8B5CF6]" 
                  placeholder="Describe the item, any flaws, and reason for selling..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Price (₹) *</label>
                <div className="relative w-full md:w-1/2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <Input 
                    name="price"
                    required 
                    type="number" 
                    min="1" 
                    step="1" 
                    placeholder="e.g. 500" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] pl-8 text-white focus:border-[#8B5CF6]" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="text-white">Product Images *</CardTitle>
              <CardDescription className="text-gray-400">Upload up to 5 images. Max 5MB per image.</CardDescription>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div 
                  className={`w-full p-8 md:p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                    ${isDragging 
                      ? 'border-[#8B5CF6] bg-[#6C3BFF]/20 scale-[1.02]' 
                      : 'border-[#6C3BFF]/40 bg-[#6C3BFF]/5 hover:bg-[#6C3BFF]/10 hover:border-[#8B5CF6]'
                    }`}
                  onClick={() => openSelectionModal(null)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 rounded-full bg-[#6C3BFF]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(108,59,255,0.2)]">
                    <Camera className="w-8 h-8 text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">Upload Product Images</h3>
                  <p className="text-gray-400 text-sm mb-4">Click or Drag & Drop</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>JPG • PNG • WEBP</span>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <span>Maximum 5 Images</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {imagePreviews.map((img, idx) => (
                      <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] group">
                        <img src={img} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openSelectionModal(idx); }}
                            className="bg-black/70 text-white p-1.5 rounded-lg hover:bg-[#8B5CF6] transition-colors"
                            title="Replace Image"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="bg-black/70 text-white p-1.5 rounded-lg hover:bg-rose-500 transition-colors"
                            title="Remove Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {idx === 0 && (
                          <span className="absolute bottom-2 left-2 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase">Cover</span>
                        )}
                      </div>
                    ))}
                    
                    {images.length < 5 && (
                      <div 
                        onClick={() => openSelectionModal(null)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                          ${isDragging 
                            ? 'border-[#8B5CF6] bg-[#6C3BFF]/20 scale-[1.02]' 
                            : 'border-[#6C3BFF]/40 bg-[#6C3BFF]/5 hover:bg-[#6C3BFF]/10 text-[#8B5CF6]'
                          }`}
                      >
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Add Image</span>
                        <span className="text-xs text-gray-500 mt-1">{images.length}/5</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Supported formats: JPG, JPEG, PNG, WEBP.</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="text-white">Contact & Location</CardTitle>
              <CardDescription className="text-gray-400">How should buyers reach you?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">College/Hostel (Optional)</label>
                <Input name="college" placeholder="e.g. Block B / North Campus" className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">WhatsApp Number *</label>
                <Input 
                  type="text" 
                  name="whatsappNumber" 
                  required 
                  placeholder="10-digit number" 
                  pattern="\d{10}" 
                  maxLength={10} 
                  title="Please enter a valid 10-digit WhatsApp number." 
                  className="bg-[#0F0F0F] border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]" 
                  onInput={(e: any) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }} 
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]">Cancel</Button>
            <Button type="submit" size="lg" className="px-8 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white border-none shadow-[0_0_15px_rgba(108,59,255,0.3)] gap-2" disabled={isLoading || (price !== "" && Number(price) <= 0) || images.length === 0}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Listing"}
            </Button>
          </div>
        </div>
      </form>

      {/* Hidden inputs for gallery & mobile camera */}
      <input 
        type="file" 
        multiple={replaceIndex === null} 
        accept="image/jpeg, image/png, image/webp" 
        className="hidden" 
        ref={galleryInputRef} 
        onChange={handleGalleryInput} 
      />
      <input 
        type="file" 
        accept="image/jpeg, image/png, image/webp" 
        capture="environment" 
        className="hidden" 
        ref={cameraInputRef} 
        onChange={handleGalleryInput} 
      />

      {/* Upload Options Modal / Bottom Sheet */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/60 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
          <div className="bg-[#1A1A1A] w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-[#6C3BFF]/30 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[#202020]">
              <h3 className="font-bold text-white text-lg">{replaceIndex !== null ? "Replace Image" : "Upload Image"}</h3>
              <button onClick={() => setIsSelectionModalOpen(false)} className="p-2 text-gray-400 hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {cameraError && (
                <div className="p-3 bg-amber-500/10 text-amber-400 text-sm rounded-xl border border-amber-500/20 mb-4">
                  {cameraError}
                </div>
              )}
              <button 
                type="button"
                onClick={handleTakePhotoClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#2A2A2A] to-[#252525] border border-[rgba(255,255,255,0.05)] hover:border-[#6C3BFF]/50 hover:bg-[#6C3BFF]/10 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#6C3BFF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-lg">Take Photo</p>
                  <p className="text-sm text-gray-400">Capture using your camera</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsSelectionModalOpen(false)
                  galleryInputRef.current?.click()
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#2A2A2A] to-[#252525] border border-[rgba(255,255,255,0.05)] hover:border-[#6C3BFF]/50 hover:bg-[#6C3BFF]/10 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#6C3BFF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-lg">Choose from Gallery</p>
                  <p className="text-sm text-gray-400">Select existing images</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Webcam Modal */}
      {isWebcamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1A1A] w-full max-w-2xl rounded-3xl border border-[#6C3BFF]/30 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[#202020]">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#8B5CF6]" /> Capture Photo
              </h3>
              <button onClick={stopWebcam} className="p-2 text-gray-400 hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-6 bg-[#1A1A1A] flex justify-center items-center gap-6">
              <button onClick={stopWebcam} className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                Cancel
              </button>
              <button 
                type="button"
                onClick={capturePhoto} 
                className="w-16 h-16 rounded-full bg-white border-4 border-[#6C3BFF] shadow-[0_0_20px_rgba(108,59,255,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
