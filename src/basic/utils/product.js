export const getLightningSaleProduct = (productList) => {
  const availableProducts = productList.filter(
    (product) => product.quantity > 0 && !product.isOnSale,
  );

  if (availableProducts.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  return availableProducts[randomIndex];
};

export const findRecommendedProduct = (productList, excludeId) => {
  return productList.find(
    (product) => product.id !== excludeId && product.quantity > 0 && !product.isRecommended,
  );
};
