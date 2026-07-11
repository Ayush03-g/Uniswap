export const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400/1a1a1a/6c3bff?text=No+Image";

export const getProductImage = (images?: string[]): string => {
  if (images && images.length > 0 && images[0]) {
    if (images[0].startsWith('http') || images[0].startsWith('data:')) {
      return images[0];
    }
    return `http://localhost:5000${images[0]}`;
  }
  return DEFAULT_PRODUCT_IMAGE;
};
