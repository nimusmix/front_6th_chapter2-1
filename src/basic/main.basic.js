import { getIsTuesday } from './utils/date';
import { PRODUCT_IDS } from './constants/product';
import { renderAppLayout, renderBonusPoints, renderProductSelectOptions } from './render';
import { setupIntervalEvent } from './utils/intervalEvent';
import { findRecommendedProduct, getLightningSaleProduct } from './utils/product';
import { getCartElements } from './utils/cart';
import { updateCartUI } from './utils/ui/cart';

const productList = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: '버그 없애는 키보드',
    price: 10000,
    originalPrice: 10000,
    quantity: 50,
    isOnSale: false,
    isRecommended: false,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: '생산성 폭발 마우스',
    price: 20000,
    originalPrice: 20000,
    quantity: 30,
    isOnSale: false,
    isRecommended: false,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: '거북목 탈출 모니터암',
    price: 30000,
    originalPrice: 30000,
    quantity: 20,
    isOnSale: false,
    isRecommended: false,
  },
  {
    id: PRODUCT_IDS.POUCH,
    name: '에러 방지 노트북 파우치',
    price: 15000,
    originalPrice: 15000,
    quantity: 0,
    isOnSale: false,
    isRecommended: false,
  },
  {
    id: PRODUCT_IDS.SPEAKER,
    name: `코딩할 때 듣는 Lo-Fi 스피커`,
    price: 25000,
    originalPrice: 25000,
    quantity: 10,
    isOnSale: false,
    isRecommended: false,
  },
];
let lastSelectedProductId = null;

function main() {
  renderAppLayout();

  renderProductSelectOptions(productList);
  updateCartState();

  setupLightningSale();
  setupRecommendationSale();
}

function setupLightningSale() {
  const applyLightningSaleToRandomProduct = () => {
    const product = getLightningSaleProduct(productList);
    if (!product) return;

    product.price = Math.round((product.originalPrice * 80) / 100);
    product.isOnSale = true;

    alert(`⚡번개세일! ${product.name}이(가) 20% 할인 중입니다!`);
    renderProductSelectOptions(productList);
    updatePricesInCart();
  };

  setupIntervalEvent({
    action: applyLightningSaleToRandomProduct,
    delay: Math.random() * 10000,
    interval: 30000,
  });
}

function setupRecommendationSale() {
  const applyRecommendationDiscount = () => {
    const product = findRecommendedProduct(productList, lastSelectedProductId);
    if (!product) return;

    product.price = Math.round((product.price * 95) / 100);
    product.isRecommended = true;

    alert(`💝 ${product.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);
    renderProductSelectOptions(productList);
    updatePricesInCart();
  };

  setupIntervalEvent({
    delay: 20000,
    interval: 60000,
    action: applyRecommendationDiscount,
  });
}

function updateCartState() {
  const cartElements = getCartElements();

  const {
    totalItemCount,
    subTotalBeforeDiscount,
    subTotalAfterDiscount: subTotalAfterItemDiscount,
  } = calculateCartTotals(cartElements);
  let subTotalAfterDiscount = subTotalAfterItemDiscount;

  if (totalItemCount >= 30) {
    subTotalAfterDiscount = subTotalBeforeDiscount * 0.75;
  }

  const isTuesday = getIsTuesday();
  if (isTuesday) {
    subTotalAfterDiscount = subTotalAfterDiscount * 0.9;
  }

  const discountRate = 1 - subTotalAfterDiscount / subTotalBeforeDiscount;

  updateCartUI({
    cartElements,
    productList,
    itemDiscounts,
    totalItemCount,
    subTotalBeforeDiscount,
    subTotalAfterDiscount,
    discountRate,
    isTuesday,
  });

  renderBonusPoints({
    cartElements,
    productList,
    totalItemCount,
    subTotalAfterDiscount,
    isTuesday,
  });
}

const updatePricesInCart = () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartItemElements = Array.from(cartItemsContainer.children);

  let totalCount = 0;
  for (const cartItemElement of cartItemElements) {
    const itemId = cartItemElement.id;
    const product = productList.find((p) => p.id === itemId);
    if (!product) continue;

    const qtyEl = cartItemElement.querySelector('.quantity-number');
    const qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 0;
    totalCount += qty;

    const priceDiv = cartItemElement.querySelector('.text-lg');
    const nameDiv = cartItemElement.querySelector('h3');

    if (!priceDiv || !nameDiv) continue;

    const formattedPrice = `₩${product.price.toLocaleString()}`;
    const formattedOriginal = `₩${product.originalPrice.toLocaleString()}`;

    let namePrefix = '';
    let priceHtml = formattedPrice;

    if (product.isOnSale && product.isRecommended) {
      namePrefix = '⚡💝';
      priceHtml = `<span class="line-through text-gray-400">${formattedOriginal}</span> <span class="text-purple-600">${formattedPrice}</span>`;
    } else if (product.isOnSale) {
      namePrefix = '⚡';
      priceHtml = `<span class="line-through text-gray-400">${formattedOriginal}</span> <span class="text-red-500">${formattedPrice}</span>`;
    } else if (product.isRecommended) {
      namePrefix = '💝';
      priceHtml = `<span class="line-through text-gray-400">${formattedOriginal}</span> <span class="text-blue-500">${formattedPrice}</span>`;
    }

    nameDiv.textContent = `${namePrefix}${product.name}`;
    priceDiv.innerHTML = priceHtml;
  }

  updateCartState();
};

main();

addToCartButton.addEventListener('click', (e) => {
  const selectedItemId = e.target.value;
  console.log(selectedItemId);
  console.log(selectedItemId);
  console.log(selectedItemId);
  console.log(selectedItemId);

  let hasItem = false;
  for (let idx = 0; idx < productList.length; idx++) {
    if (productList[idx].id === selectedItemId) {
      hasItem = true;
      break;
    }
  }
  if (!selItem || !hasItem) {
    return;
  }
  let itemToAdd = null;
  for (let j = 0; j < productList.length; j++) {
    if (productList[j].id === selItem) {
      itemToAdd = productList[j];
      break;
    }
  }
  if (itemToAdd && itemToAdd.quantity > 0) {
    const item = document.getElementById(itemToAdd['id']);
    if (item) {
      const qtyElem = item.querySelector('.quantity-number');
      const newQty = parseInt(qtyElem['textContent']) + 1;
      if (newQty <= itemToAdd.quantity + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd['quantity']--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className =
        'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${itemToAdd.isOnSale && itemToAdd.isRecommended ? '⚡💝' : itemToAdd.isOnSale ? '⚡' : itemToAdd.isRecommended ? '💝' : ''}${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${itemToAdd.isOnSale || itemToAdd.isRecommended ? `<span class="line-through text-gray-400">₩${itemToAdd.originalPrice.toLocaleString()}</span> <span class="${itemToAdd.isOnSale && itemToAdd.isRecommended ? 'text-purple-600' : itemToAdd.isOnSale ? 'text-red-500' : 'text-blue-500'}">₩${itemToAdd.price.toLocaleString()}</span>` : `₩${itemToAdd.price.toLocaleString()}`}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
            <div class="text-lg mb-2 tracking-tight tabular-nums">${itemToAdd.isOnSale || itemToAdd.isRecommended ? `<span class="line-through text-gray-400">₩${itemToAdd.originalPrice.toLocaleString()}</span> <span class="${itemToAdd.isOnSale && itemToAdd.isRecommended ? 'text-purple-600' : itemToAdd.isOnSale ? 'text-red-500' : 'text-blue-500'}">₩${itemToAdd.price.toLocaleString()}</span>` : `₩${itemToAdd.price.toLocaleString()}`}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
        </div>
      `;
      cartItemsContainer.appendChild(newItem);
      itemToAdd.quantity--;
    }
    updateCartState();
    lastSelectedProductId = selItem;
  }
});

cartItemsContainer.addEventListener('click', function (event) {
  const tgt = event.target;
  if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    let prod = null;
    for (let prdIdx = 0; prdIdx < productList.length; prdIdx++) {
      if (productList[prdIdx].id === prodId) {
        prod = productList[prdIdx];
        break;
      }
    }
    if (tgt.classList.contains('quantity-change')) {
      const qtyChange = parseInt(tgt.dataset.change);
      var qtyElem = itemElem.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + qtyChange;
      if (newQty > 0 && newQty <= prod.quantity + currentQty) {
        qtyElem.textContent = newQty;
        prod.quantity -= qtyChange;
      } else if (newQty <= 0) {
        prod.quantity += currentQty;
        itemElem.remove();
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      var qtyElem = itemElem.querySelector('.quantity-number');
      const remQty = parseInt(qtyElem.textContent);
      prod.quantity += remQty;
      itemElem.remove();
    }
    if (prod && prod.quantity < 5) {
    }
    updateCartState();
    renderProductSelectOptions(productList);
  }
});
