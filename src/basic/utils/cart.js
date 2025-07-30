import { PRODUCT_DISCOUNT_RATES_BY_PRODUCT_ID } from '../constants/product';

export const getCartElements = () => {
  const cartItemsContainer = document.getElementById('cart-items');
  return Array.from(cartItemsContainer.children);
};

export const calculateCartTotals = (cartElements) => {
  let totalItemCount = 0;
  let subTotalBeforeDiscount = 0;
  let subTotalAfterDiscount = 0;
  const appliedItemDiscounts = [];

  cartElements.forEach((cartElement) => {
    const product = getProductById(cartElement.id);
    if (!product) return;

    const quantity = parseInt(
      cartElement.querySelector('.quantity-number')?.textContent || '0',
      10,
    );
    totalItemCount += quantity;

    const itemSubtotal = product.price * quantity;
    subTotalBeforeDiscount += itemSubtotal;

    let itemDiscountRate = 0;
    if (quantity >= 10 && PRODUCT_DISCOUNT_RATES_BY_PRODUCT_ID[product.id]) {
      itemDiscountRate = PRODUCT_DISCOUNT_RATES_BY_PRODUCT_ID[product.id];
      appliedItemDiscounts.push({ name: product.name, discount: itemDiscountRate * 100 });
    }

    subTotalAfterDiscount += itemSubtotal * (1 - itemDiscountRate);
  });

  return {
    totalItemCount,
    subTotalBeforeDiscount,
    subTotalAfterDiscount,
  };
};
