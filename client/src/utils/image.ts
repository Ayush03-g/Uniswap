export const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400/1a1a1a/6c3bff?text=No+Image";

export const getProductImage = (images?: string | string[]): string => {
  let imgStr = '';
  
  if (Array.isArray(images) && images.length > 0) {
    imgStr = images[0];
  } else if (typeof images === 'string') {
    imgStr = images;
  }
  
  // Log 8: Frontend console value of product.images
  // Only log if it looks like a valid incoming render to avoid spam, or just log unconditionally
  if (imgStr) {
    console.log('8. Frontend received product image value:', images);
  }
  
  let finalUrl = DEFAULT_PRODUCT_IMAGE;

  if (imgStr) {
    // Cloudinary HTTPS URLs or base64 data
    if (imgStr.startsWith('http') || imgStr.startsWith('data:')) {
      finalUrl = imgStr;
    }
    
    // Filter out invalid dead local paths explicitly
    else if (imgStr.includes('/uploads/') || imgStr.includes('localhost') || imgStr.startsWith('file://')) {
      finalUrl = DEFAULT_PRODUCT_IMAGE;
    }
  }
  
  if (finalUrl !== DEFAULT_PRODUCT_IMAGE) {
     console.log('9. Final image URL passed into the ProductCard <img> tag:', finalUrl);
  }
  
  return finalUrl;
};
