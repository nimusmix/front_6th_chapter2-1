const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  POUCH: 'p4',
  SPEAKER: 'p5',
};

const PRODUCT_LIST = [
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

const PRODUCT_DISCOUNT_RATES_BY_PRODUCT_ID = {
  [PRODUCT_IDS.KEYBOARD]: 10 / 100,
  [PRODUCT_IDS.MOUSE]: 15 / 100,
  [PRODUCT_IDS.MONITOR_ARM]: 20 / 100,
  [PRODUCT_IDS.POUCH]: 5 / 100,
  [PRODUCT_IDS.SPEAKER]: 25 / 100,
};

function main() {
  const root = document.getElementById('app');
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;

  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  const rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;

  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  const selectElement = document.createElement('select');
  selectElement.id = 'product-select';
  selectElement.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  const addToCartButton = document.createElement('button');
  addToCartButton.id = 'add-to-cart';
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';
  addToCartButton.innerHTML = 'Add to Cart';

  const stockStatusElement = document.createElement('div');
  stockStatusElement.id = 'stock-status';
  stockStatusElement.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  selectorContainer.appendChild(selectElement);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockStatusElement);
  leftColumn.appendChild(selectorContainer);

  const cartItemsContainer = document.createElement('div');
  cartItemsContainer.id = 'cart-items';
  leftColumn.appendChild(cartItemsContainer);

  const manualGuideToggleButton = document.createElement('button');
  manualGuideToggleButton.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualGuideToggleButton.innerHTML = `
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
`;

  const manualGuideOverlay = document.createElement('div');
  manualGuideOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';

  const manualGuideSidebar = document.createElement('div');
  manualGuideSidebar.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualGuideSidebar.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;

  manualGuideToggleButton.onclick = function () {
    manualGuideOverlay.classList.toggle('hidden');
    manualGuideSidebar.classList.toggle('translate-x-full');
  };

  manualGuideOverlay.onclick = function (e) {
    if (e.target === manualGuideOverlay) {
      manualGuideOverlay.classList.add('hidden');
      manualGuideSidebar.classList.add('translate-x-full');
    }
  };

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualGuideOverlay.appendChild(manualGuideSidebar);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualGuideToggleButton);
  root.appendChild(manualGuideOverlay);

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
    doUpdatePricesInCart();
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
    doUpdatePricesInCart();
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
  const cartElements = cartItemsContainer.children;
  let totalItemCount = 0;
  let totalAmountBeforeDiscount = 0;
  let totalAmountAfterDiscount = 0;
  const itemDiscounts = [];

  cartElements.forEach((cartEl) => {
    const product = PRODUCT_LIST.find((p) => p.id === cartEl.id);
    if (!product) return;

    const quantity = parseInt(cartEl.querySelector('.quantity-number').textContent, 10);
    const itemTotalPrice = product.price * quantity;
    let discountRate = 0;

    totalItemCount += quantity;
    totalAmountBeforeDiscount += itemTotalPrice;

    // bold 처리
    const priceElems = cartEl.querySelectorAll('.text-lg, .text-xs');
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

  const today = new Date();
  const isTuesday = today.getDay() === 2;
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

  stockStatusElement.textContent = stockMessages.join('\n');

  handleStockStatusElementUpdate();
  doRenderBonusPoints();
}

var doRenderBonusPoints = function () {
  let basePoints;
  let finalPoints;
  let pointsDetail;
  let hasKeyboard;
  let hasMouse;
  let hasMonitorArm;
  let nodes;
  if (cartItemsContainer.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }
  basePoints = Math.floor(totalAmountAfterDiscount / 1000);
  finalPoints = 0;
  pointsDetail = [];
  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push(`기본: ${basePoints}p`);
  }
  if (new Date().getDay() === 2) {
    if (basePoints > 0) {
      finalPoints = basePoints * 2;
      pointsDetail.push('화요일 2배');
    }
  }
  hasKeyboard = false;
  hasMouse = false;
  hasMonitorArm = false;
  nodes = cartItemsContainer.children;
  for (const node of nodes) {
    let product = null;
    for (let pIdx = 0; pIdx < PRODUCT_LIST.length; pIdx++) {
      if (PRODUCT_LIST[pIdx].id === node.id) {
        product = PRODUCT_LIST[pIdx];
        break;
      }
    }
    if (!product) continue;
    if (product.id === PRODUCT_IDS.KEYBOARD) {
      hasKeyboard = true;
    } else if (product.id === PRODUCT_IDS.MOUSE) {
      hasMouse = true;
    } else if (product.id === PRODUCT_IDS.MONITOR_ARM) {
      hasMonitorArm = true;
    }
  }
  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + 50;
    pointsDetail.push('키보드+마우스 세트 +50p');
  }
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + 100;
    pointsDetail.push('풀세트 구매 +100p');
  }
  if (totalItemCount >= 30) {
    finalPoints = finalPoints + 100;
    pointsDetail.push('대량구매(30개+) +100p');
  } else {
    if (totalItemCount >= 20) {
      finalPoints = finalPoints + 50;
      pointsDetail.push('대량구매(20개+) +50p');
    } else {
      if (totalItemCount >= 10) {
        finalPoints = finalPoints + 20;
        pointsDetail.push('대량구매(10개+) +20p');
      }
    }
  }

  const bonusPoints = finalPoints;
  const ptsTag = document.getElementById('loyalty-points');
  if (ptsTag) {
    if (bonusPoints > 0) {
      ptsTag.innerHTML =
        `<div>적립 포인트: <span class="font-bold">${bonusPoints}p</span></div>` +
        `<div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>`;
      ptsTag.style.display = 'block';
    } else {
      ptsTag.textContent = '적립 포인트: 0p';
      ptsTag.style.display = 'block';
    }
  }
};

function onGetStockTotal() {
  let sum;
  let i;
  let currentProduct;
  sum = 0;
  for (i = 0; i < PRODUCT_LIST.length; i++) {
    currentProduct = PRODUCT_LIST[i];
    sum += currentProduct.quantity;
  }
  return sum;
}

var handleStockStatusElementUpdate = function () {
  let infoMsg;
  let totalStock;
  let messageOptimizer;
  infoMsg = '';
  totalStock = onGetStockTotal();
  if (totalStock < 30) {
  }
  PRODUCT_LIST.forEach(function (item) {
    if (item.quantity < 5) {
      if (item.quantity > 0) {
        infoMsg = `${infoMsg + item.name}: 재고 부족 (${item.quantity}개 남음)\n`;
      } else {
        infoMsg = `${infoMsg + item.name}: 품절\n`;
      }
    }
  });
  stockStatusElement.textContent = infoMsg;
};

function doUpdatePricesInCart() {
  let totalCount = 0,
    j = 0;
  let cartItems;
  while (cartItemsContainer.children[j]) {
    const qty = cartItemsContainer.children[j].querySelector('.quantity-number');
    totalCount += qty ? parseInt(qty.textContent) : 0;
    j++;
  }
  totalCount = 0;
  for (j = 0; j < cartItemsContainer.children.length; j++) {
    totalCount += parseInt(
      cartItemsContainer.children[j].querySelector('.quantity-number').textContent,
    );
  }
  cartItems = cartItemsContainer.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    let product = null;
    for (let productIdx = 0; productIdx < PRODUCT_LIST.length; productIdx++) {
      if (PRODUCT_LIST[productIdx].id === itemId) {
        product = PRODUCT_LIST[productIdx];
        break;
      }
    }
    if (product) {
      const priceDiv = cartItems[i].querySelector('.text-lg');
      const nameDiv = cartItems[i].querySelector('h3');
      if (product.isOnSale && product.isRecommended) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-purple-600">₩${product.price.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡💝${product.name}`;
      } else if (product.isOnSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-red-500">₩${product.price.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡${product.name}`;
      } else if (product.isRecommended) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-blue-500">₩${product.price.toLocaleString()}</span>`;
        nameDiv.textContent = `💝${product.name}`;
      } else {
        priceDiv.textContent = `₩${product.price.toLocaleString()}`;
        nameDiv.textContent = product.name;
      }
    }
  }
  handleCalculateCartStuff();
}

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
