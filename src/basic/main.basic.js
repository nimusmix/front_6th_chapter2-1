import { getIsTuesday } from './utils/date';
import { PRODUCT_LIST, PRODUCT_IDS } from './constants/product';
import {
  renderCartItemsBlock,
  renderHeader,
  renderManualGuideBlock,
  renderRootLayout,
  renderSelectorBlock,
} from './render';

function main() {
  const root = document.getElementById('app');
  const header = renderHeader();
  const { gridContainer, leftColumn } = renderRootLayout();

  const selectorBlock = renderSelectorBlock();
  leftColumn.appendChild(selectorBlock);
  const cartItemsBlock = renderCartItemsBlock();
  leftColumn.appendChild(cartItemsBlock);

  const manualGuideBlock = renderManualGuideBlock();

  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualGuideBlock.toggleButton);
  root.appendChild(manualGuideBlock.overlay);

  onUpdateSelectOptions();
  handleCalculateCartStuff();

  const lightningDelay = Math.random() * 10000;
  const applyLightningSaleToRandomProduct = () => {
    const availableProducts = PRODUCT_LIST.filter(
      (product) => product.quantity > 0 && !product.isOnSale,
    );

    if (availableProducts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    const product = availableProducts[randomIndex];

    product.price = Math.round((product.originalPrice * 80) / 100);
    product.isOnSale = true;

    alert(`⚡번개세일! ${product.name}이(가) 20% 할인 중입니다!`);
    onUpdateSelectOptions();
    updatePricesInCart();
  };

  const startLightningSaleInterval = (delay = 10000, interval = 30000) => {
    setTimeout(() => {
      setInterval(() => {
        applyLightningSaleToRandomProduct();
      }, interval);
    }, delay);
  };
  startLightningSaleInterval(lightningDelay);

  let lastSelectedProductId = null;
  const findRecommendedProduct = (excludeId) => {
    return PRODUCT_LIST.find(
      (product) => product.id !== excludeId && product.quantity > 0 && !product.isRecommended,
    );
  };

  const applyRecommendationDiscount = (product) => {
    product.price = Math.round((product.price * 95) / 100);
    product.isRecommended = true;
    alert(`💝 ${product.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);
    onUpdateSelectOptions();
    updatePricesInCart();
  };

  const startRecommendationInterval = (delay = 20000, interval = 60000) => {
    setTimeout(() => {
      setInterval(() => {
        if (!lastSelectedProductId) return;
        if (cartItemsContainer.children.length > 0) return;

        const product = findRecommendedProduct(lastSelectedProductId);
        if (product) {
          applyRecommendationDiscount(product);
        }
      }, interval);
    }, delay);
  };

  startRecommendationInterval();
}

function onUpdateSelectOptions() {
  const productSelectElement = document.getElementById('product-select');
  productSelectElement.innerHTML = '';

  const totalStock = PRODUCT_LIST.reduce((total, product) => total + product.quantity, 0);

  for (let i = 0; i < PRODUCT_LIST.length; i++) {
    const item = PRODUCT_LIST[i];

    const optionElement = document.createElement('option');
    optionElement.value = item.id;

    const discountBadgeText = item.isOnSale ? ' ⚡SALE' : item.isRecommended ? ' 💝추천' : '';

    if (item.quantity === 0) {
      optionElement.textContent = `${item.name} - ${item.price}원 (품절)${discountBadgeText}`;
      optionElement.disabled = true;
      optionElement.className = 'text-gray-400';
    } else if (item.isOnSale && item.isRecommended) {
      optionElement.textContent = `⚡💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (25% SUPER SALE!)`;
      optionElement.className = 'text-purple-600 font-bold';
    } else if (item.isOnSale) {
      optionElement.textContent = `⚡${item.name} - ${item.originalPrice}원 → ${item.price}원 (20% SALE!)`;
      optionElement.className = 'text-red-500 font-bold';
    } else if (item.isRecommended) {
      optionElement.textContent = `💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (5% 추천할인!)`;
      optionElement.className = 'text-blue-500 font-bold';
    } else {
      optionElement.textContent = `${item.name} - ${item.price}원${discountBadgeText}`;
    }

    productSelectElement.appendChild(optionElement);
  }

  if (totalStock < 50) {
    productSelectElement.style.borderColor = 'orange';
  } else {
    productSelectElement.style.borderColor = '';
  }
}

function handleCalculateCartStuff() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartElements = Array.from(cartItemsContainer.children);
  let totalItemCount = 0;
  let totalAmountBeforeDiscount = 0;
  let totalAmountAfterDiscount = 0;
  const itemDiscounts = [];

  cartElements.forEach((cartElement) => {
    const product = PRODUCT_LIST.find((p) => p.id === cartElement.id);
    if (!product) return;

    const quantity = parseInt(cartElement.querySelector('.quantity-number').textContent, 10);
    const itemTotalPrice = product.price * quantity;
    let discountRate = 0;

    totalItemCount += quantity;
    totalAmountBeforeDiscount += itemTotalPrice;

    // bold 처리
    const priceElems = cartElement.querySelectorAll('.text-lg, .text-xs');
    priceElems.forEach((elem) => {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
      }
    });

    // 10개 이상 구매 시 개별 상품 할인
    if (quantity >= 10 && discountRatesByProductId[product.id]) {
      discountRate = discountRatesByProductId[product.id];
      itemDiscounts.push({ name: product.name, discount: discountRate * 100 });
    }

    totalAmountAfterDiscount += itemTotalPrice * (1 - discountRate);
  });

  let discountRate = 0;
  if (totalItemCount >= 30) {
    totalAmountAfterDiscount = (totalAmountBeforeDiscount * 75) / 100;
    discountRate = 25 / 100;
  } else {
    discountRate =
      (totalAmountBeforeDiscount - totalAmountAfterDiscount) / totalAmountBeforeDiscount;
  }

  const isTuesday = getIsTuesday();
  const tuesdaySpecialElement = document.getElementById('tuesday-special');

  if (isTuesday && totalAmountAfterDiscount > 0) {
    totalAmountAfterDiscount = (totalAmountAfterDiscount * 90) / 100;
    discountRate = 1 - totalAmountAfterDiscount / totalAmountBeforeDiscount;
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }

  const itemCountElement = document.getElementById('item-count');
  itemCountElement.textContent = `🛍️ ${totalItemCount} items in cart`;

  const summaryDetailsElement = document.getElementById('summary-details');
  summaryDetailsElement.innerHTML = '';

  if (totalAmountBeforeDiscount > 0) {
    const fragments = [];

    cartElements.forEach((element) => {
      const itemId = element.id;
      const product = PRODUCT_LIST.find((p) => p.id === itemId);
      if (!product) return;

      const quantity = parseInt(element.querySelector('.quantity-number')?.textContent || '0');
      const itemTotalPrice = product.price * quantity;

      fragments.push(`
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>₩${itemTotalPrice.toLocaleString()}</span>
        </div>
      `);
    });

    fragments.push(`
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${totalAmountBeforeDiscount.toLocaleString()}</span>
      </div>
    `);

    if (totalItemCount >= 30) {
      fragments.push(`
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `);
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(({ name, discount }) => {
        fragments.push(`
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${name} (10개↑)</span>
            <span class="text-xs">-${discount}%</span>
          </div>
        `);
      });
    }

    if (isTuesday && totalAmountAfterDiscount > 0) {
      fragments.push(`
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-10%</span>
        </div>
      `);
    }

    fragments.push(`
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `);

    summaryDetailsElement.innerHTML = fragments.join('');
  }

  const totalPriceElement = summaryDetailsElement.querySelector('.text-2xl');
  if (totalPriceElement) {
    totalPriceElement.textContent = `₩${Math.round(totalAmountAfterDiscount).toLocaleString()}`;
  }

  const loyaltyPointsElement = document.getElementById('loyalty-points');
  if (loyaltyPointsElement) {
    const points = Math.floor(totalAmountAfterDiscount / 1000);
    loyaltyPointsElement.textContent = `적립 포인트: ${points > 0 ? points : 0}p`;
    loyaltyPointsElement.style.display = 'block';
  }

  const discountInfoElement = document.getElementById('discount-info');
  discountInfoElement.innerHTML = '';
  if (discountRate > 0) {
    const discountAmount = totalAmountBeforeDiscount - totalAmountAfterDiscount;
    discountInfoElement.innerHTML = `
    <div class="bg-green-500/20 rounded-lg p-3">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
        <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
      </div>
      <div class="text-2xs text-gray-300">₩${Math.round(discountAmount).toLocaleString()} 할인되었습니다</div>
    </div>
    `;
  }

  if (itemCountElement) {
    const countMatch = itemCountElement.textContent.match(/\d+/);
    const previousItemCount = countMatch ? parseInt(countMatch[0], 10) : 0;

    itemCountElement.textContent = `🛍️ ${totalItemCount} items in cart`;

    if (previousItemCount !== totalItemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  const stockMessages = PRODUCT_LIST.filter((item) => item.quantity < 5).map((item) => {
    if (item.quantity > 0) {
      return `${item.name}: 재고 부족 (${item.quantity}개 남음)`;
    }
    return `${item.name}: 품절`;
  });

  const stockStatusElement = document.getElementById('stock-status');
  stockStatusElement.textContent = stockMessages.join('\n');

  handleStockStatusElementUpdate();
  renderBonusPoints();
}

const renderBonusPoints = () => {
  const cartItemsContainer = document.getElementById('cart-items');
  if (cartItemsContainer.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  const basePoints = Math.floor(totalAmountAfterDiscount / 1000);
  let finalPoints = 0;
  const pointsDetail = [];

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push(`기본: ${basePoints}p`);
  }

  const isTuesday = getIsTuesday();
  if (isTuesday && basePoints > 0) {
    finalPoints = basePoints * 2;
    pointsDetail.push('화요일 2배');
  }

  let hasKeyboard = false;
  let hasMouse = false;
  let hasMonitorArm = false;

  const nodes = Array.from(cartItemsContainer.children);
  for (const node of nodes) {
    const product = PRODUCT_LIST.find((p) => p.id === node.id);
    if (!product) continue;

    switch (product.id) {
      case PRODUCT_IDS.KEYBOARD:
        hasKeyboard = true;
        break;
      case PRODUCT_IDS.MOUSE:
        hasMouse = true;
        break;
      case PRODUCT_IDS.MONITOR_ARM:
        hasMonitorArm = true;
        break;
    }
  }

  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + 50;
    pointsDetail.push('키보드+마우스 세트 +50p');

    if (hasMonitorArm) {
      finalPoints = finalPoints + 100;
      pointsDetail.push('풀세트 구매 +100p');
    }
  }

  if (totalItemCount >= 30) {
    finalPoints += 100;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (totalItemCount >= 20) {
    finalPoints += 50;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (totalItemCount >= 10) {
    finalPoints += 20;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  const loyaltyPointsElement = document.getElementById('loyalty-points');
  if (!loyaltyPointsElement) return;

  loyaltyPointsElement.style.display = 'block';
  if (finalPoints > 0) {
    loyaltyPointsElement.innerHTML =
      `<div>적립 포인트: <span class="font-bold">${finalPoints}p</span></div>` +
      `<div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>`;
  } else {
    loyaltyPointsElement.textContent = '적립 포인트: 0p';
  }
};

const handleStockStatusElementUpdate = () => {
  const lowStockItems = PRODUCT_LIST.filter((item) => item.quantity < 5).map((item) => {
    if (item.quantity > 0) {
      return `${item.name}: 재고 부족 (${item.quantity}개 남음)`;
    } else {
      return `${item.name}: 품절`;
    }
  });

  const stockStatusElement = document.getElementById('stock-status');
  stockStatusElement.textContent = lowStockItems.join('\n');
};

const updatePricesInCart = () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartItemElements = Array.from(cartItemsContainer.children);

  let totalCount = 0;
  for (const cartItemElement of cartItemElements) {
    const itemId = cartItemElement.id;
    const product = PRODUCT_LIST.find((p) => p.id === itemId);
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

  handleCalculateCartStuff();
};

main();

addToCartButton.addEventListener('click', function () {
  const selItem = sel.value;
  let hasItem = false;
  for (let idx = 0; idx < PRODUCT_LIST.length; idx++) {
    if (PRODUCT_LIST[idx].id === selItem) {
      hasItem = true;
      break;
    }
  }
  if (!selItem || !hasItem) {
    return;
  }
  let itemToAdd = null;
  for (let j = 0; j < PRODUCT_LIST.length; j++) {
    if (PRODUCT_LIST[j].id === selItem) {
      itemToAdd = PRODUCT_LIST[j];
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
    handleCalculateCartStuff();
    lastSelectedProductId = selItem;
  }
});

cartItemsContainer.addEventListener('click', function (event) {
  const tgt = event.target;
  if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    let prod = null;
    for (let prdIdx = 0; prdIdx < PRODUCT_LIST.length; prdIdx++) {
      if (PRODUCT_LIST[prdIdx].id === prodId) {
        prod = PRODUCT_LIST[prdIdx];
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
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
