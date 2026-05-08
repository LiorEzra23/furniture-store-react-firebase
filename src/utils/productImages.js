export function getValidMainImageIndex(product) {
  const images = product?.images || [];
  const index = Number(product?.mainImageIndex || 0);

  if (!images.length || Number.isNaN(index) || index < 0 || index >= images.length) {
    return 0;
  }

  return index;
}

export function getMainProductImage(product) {
  const images = product?.images || [];
  return images[getValidMainImageIndex(product)] || null;
}
