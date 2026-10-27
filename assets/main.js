/* ==========================================================================
   PrintMe Theme - Main JavaScript Controller
   Interactive UI logic: Slideshow, Tabs, Cart Drawer, Modals & Toast
   ========================================================================== */

let titleTypingTimer = null;

function animateTypingText(elemOrId, text, speed = 35) {
  const elem = typeof elemOrId === 'string' ? document.getElementById(elemOrId) : elemOrId;
  if (!elem || !text) return;

  if (titleTypingTimer) {
    clearInterval(titleTypingTimer);
    titleTypingTimer = null;
  }

  elem.textContent = '';
  elem.classList.add('typing-active');
  let charIdx = 0;

  titleTypingTimer = setInterval(() => {
    if (charIdx < text.length) {
      elem.textContent = text.substring(0, charIdx + 1);
      charIdx++;
    } else {
      clearInterval(titleTypingTimer);
      titleTypingTimer = null;
      setTimeout(() => elem.classList.remove('typing-active'), 400);
    }
  }, speed);
}

/* --------------------------------------------------------------------------
   HyperText Matrix Scramble Animation Effect on Hover
   -------------------------------------------------------------------------- */
const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

window.triggerHyperTextEffect = function (elem) {
  // Animation disabled for finish buttons
  return;
};

function initHyperTextHover() {
  // Disabled
}

function initParallaxEffects() {
  const parallaxLayers = document.querySelectorAll('.parallax-floating-layer');
  if (!parallaxLayers.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        parallaxLayers.forEach(layer => {
          const speed = parseFloat(layer.dataset.speed || layer.dataset.parallaxSpeed) || 0.15;
          const rect = layer.getBoundingClientRect();
          if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
            const yPos = Math.round(scrolled * speed * 0.4);
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function filterHomeCategory(category, buttonEl) {
  const section = (buttonEl && buttonEl.closest('.product-tabs-section')) || document.querySelector('.product-tabs-section');
  if (!section) return;

  const pills = section.querySelectorAll('.product-filter-pills .filter-pill');
  pills.forEach(pill => {
    pill.classList.remove('active');
    pill.style.background = '#ffffff';
    pill.style.color = '#475569';
    pill.style.boxShadow = 'none';
    const cat = pill.getAttribute('data-category');
    if (cat === 'tshirts') pill.style.borderColor = 'rgba(168,212,176,0.6)';
    else if (cat === 'tumbler') pill.style.borderColor = 'rgba(245,173,114,0.6)';
    else if (cat === 'mugs') pill.style.borderColor = 'rgba(162,217,247,0.6)';
    else if (cat === 'gifts') pill.style.borderColor = 'rgba(178,180,179,0.6)';
    else pill.style.borderColor = '#e2e8f0';
  });

  const activePill = buttonEl || section.querySelector(`.product-filter-pills .filter-pill[data-category="${category}"]`);
  if (activePill) {
    activePill.classList.add('active');
    activePill.style.background = '#0f172a';
    activePill.style.color = '#ffffff';
    activePill.style.borderColor = '#0f172a';
    activePill.style.boxShadow = '0 4px 14px rgba(15,23,42,0.2)';
  }

  const cards = section.querySelectorAll('.product-grid .product-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    const inAll = card.getAttribute('data-in-all') === 'true';

    if (category === 'all') {
      card.style.display = inAll ? 'flex' : 'none';
    } else {
      card.style.display = (cardCat === category) ? 'flex' : 'none';
    }
  });
}
window.filterHomeCategory = filterHomeCategory;

function initProductTabs() {
  const section = document.querySelector('.product-tabs-section');
  if (!section) return;
  const pills = section.querySelectorAll('.product-filter-pills .filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      const cat = this.getAttribute('data-category') || 'all';
      filterHomeCategory(cat, this);
    });
  });
}
window.initProductTabs = initProductTabs;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initSlideshow === 'function') initSlideshow();
  if (typeof initProductTabs === 'function') initProductTabs();
  if (typeof initCartDrawer === 'function') initCartDrawer();
  if (typeof initWishlistDrawer === 'function') initWishlistDrawer();
  if (typeof initQuickView === 'function') initQuickView();
  if (typeof initSearchOverlay === 'function') initSearchOverlay();
  if (typeof window.shuffleInbuiltStickers === 'function') window.shuffleInbuiltStickers();
  if (typeof initScrollReveal === 'function') initScrollReveal();
  if (typeof init3DTiltEffects === 'function') init3DTiltEffects();
  if (typeof initHyperTextHover === 'function') initHyperTextHover();
  if (typeof initParallaxEffects === 'function') initParallaxEffects();

  const mainTitle = document.getElementById('product-title-main');
  if (mainTitle && mainTitle.textContent.trim()) {
    animateTypingText(mainTitle, mainTitle.textContent.trim(), 35);
  }
});

/* ==========================================================================
   Shopify Cart & Drawer State Controller
   ========================================================================== */
let localCartItems = [];

function parsePriceToNumber(priceVal) {
  if (priceVal === null || priceVal === undefined) return 0;

  if (typeof priceVal === 'number') {
    if (isNaN(priceVal)) return 0;
    if (priceVal >= 10000 && Number.isInteger(priceVal) && priceVal % 100 === 0) {
      return priceVal / 100;
    }
    return priceVal;
  }

  const str = String(priceVal).trim();
  if (!str) return 0;

  const hasCurrencySymbol = str.includes('₹') || str.includes('Rs') || str.includes('RS') || str.includes('rs');
  const hasDecimal = str.includes('.');
  const cleaned = str.replace(/[^0-9.]/g, '');
  let num = parseFloat(cleaned) || 0;

  if (num === 0) return 0;

  if (!hasCurrencySymbol && !hasDecimal && num >= 10000 && Number.isInteger(num) && num % 100 === 0) {
    num = num / 100;
  }

  return num;
}
window.parsePriceToNumber = parsePriceToNumber;


function getSlabDiscountedUnitPrice(baseUnitPrice, qty) {
  const TSHIRT_SLABS = [
    { min: 1, max: 2, discount: 0 },
    { min: 3, max: 4, discount: 0.11 },
    { min: 5, max: 9, discount: 0.24 },
    { min: 10, max: 19, discount: 0.27 },
    { min: 20, max: 29, discount: 0.32 },
    { min: 30, max: 49, discount: 0.35 },
    { min: 50, max: 75, discount: 0.40 },
    { min: 76, max: 9999, discount: 0.43 }
  ];

  let activeDiscount = 0;
  for (let i = 0; i < TSHIRT_SLABS.length; i++) {
    if (qty >= TSHIRT_SLABS[i].min && qty <= TSHIRT_SLABS[i].max) {
      activeDiscount = TSHIRT_SLABS[i].discount;
      break;
    }
  }
  if (qty >= 76) activeDiscount = 0.43;

  return Math.round(baseUnitPrice * (1 - activeDiscount));
}

function isGarmentItem(itemOrShopifyItem) {
  if (!itemOrShopifyItem) return false;
  const props = itemOrShopifyItem.properties || {};
  const name = String(itemOrShopifyItem.name || itemOrShopifyItem.title || itemOrShopifyItem.product_title || '').toLowerCase();
  const fitProp = props['T-Shirt Fit'] ? String(props['T-Shirt Fit']).toLowerCase() : '';

  if (fitProp) return true;
  if (name.includes('t-shirt') || name.includes('tee') || name.includes('shirt') || name.includes('polo') || name.includes('oversiz') || name.includes('hoodie') || name.includes('sweatshirt') || name.includes('apparel') || name.includes('garment') || name.includes('roundneck') || name.includes('v-neck')) return true;
  return false;
}

function isInbuiltGarment(itemOrShopifyItem) {
  if (!itemOrShopifyItem) return false;
  if (itemOrShopifyItem.isInbuilt === true) return true;
  const props = itemOrShopifyItem.properties || {};
  if (props['Type'] === 'In-Built Ready-Made' || props['Product Type'] === 'In-Built') return true;
  const name = String(itemOrShopifyItem.name || itemOrShopifyItem.title || itemOrShopifyItem.product_title || '').toLowerCase();

  if (name.startsWith('customized ') || name.startsWith('custom ') || name.includes('custom polo') || name.includes('custom oversized') || name.includes('custom round') || name.includes('with your company logo') || name.includes('order logo printed')) {
    return false;
  }

  if (props['Uploaded Logo 1'] || props['Artwork'] || props['Logo 1'] || props['Front Print'] || props['Back Print'] || props['Print Location']) {
    return false;
  }

  if (isGarmentItem(itemOrShopifyItem)) {
    return true;
  }
  return false;
}
window.isInbuiltGarment = isInbuiltGarment;

function isStickerProduct(itemOrShopifyItem) {
  if (!itemOrShopifyItem) return false;
  if (isGarmentItem(itemOrShopifyItem)) return false;
  const props = itemOrShopifyItem.properties || {};
  const name = String(itemOrShopifyItem.name || itemOrShopifyItem.title || itemOrShopifyItem.product_title || '').toLowerCase();

  if (props['Finish / Material']) return true;
  if (name.includes('sticker') || name.includes('uv dtf') || name.includes('transfer sheet') || name.includes('die cut') || (name.includes('dtf') && !isGarmentItem(itemOrShopifyItem))) return true;
  return false;
}

function isCapProduct(itemOrShopifyItem) {
  if (!itemOrShopifyItem) return false;
  const props = itemOrShopifyItem.properties || {};
  const name = String(itemOrShopifyItem.name || itemOrShopifyItem.title || itemOrShopifyItem.product_title || itemOrShopifyItem.baseTitle || '').toLowerCase();
  const rawId = String(itemOrShopifyItem.mappedVariantId || itemOrShopifyItem.id || itemOrShopifyItem.variant_id || '').trim();
  const itemId = String(itemOrShopifyItem.id || '').trim();
  const hasCapProp = Boolean(props['Cap Color'] || props['Cap Customization'] || props['Cap Preview Photo']);
  const hasCapWord = /\bcaps?\b/i.test(name) || /\bcaps?\b/i.test(String(itemOrShopifyItem.baseTitle || ''));
  return Boolean(hasCapWord || rawId === '67587052437636' || itemId.startsWith('cap_') || hasCapProp);
}
window.isCapProduct = isCapProduct;

function getItemUnitPrice(itemOrShopifyItem) {
  if (!itemOrShopifyItem) return 625;
  const props = itemOrShopifyItem.properties || {};
  const qty = parseInt(itemOrShopifyItem.quantity || 1, 10);
  const name = String(itemOrShopifyItem.name || itemOrShopifyItem.title || itemOrShopifyItem.product_title || '').toLowerCase();

  const isGarment = isGarmentItem(itemOrShopifyItem);
  const isSticker = isStickerProduct(itemOrShopifyItem);

  if (isSticker) {
    if (props['Total Price']) {
      const tot = parsePriceToNumber(props['Total Price']);
      if (tot >= 1) return tot;
    }
    if (props['Price']) {
      const p = parsePriceToNumber(props['Price']);
      if (p >= 1) return p;
    }
    if (props['Unit Price']) {
      const u = parsePriceToNumber(props['Unit Price']);
      if (u >= 1) return u;
    }
    if (props['Unit Rate']) {
      const r = parsePriceToNumber(props['Unit Rate']);
      if (r >= 1) return r * qty;
    }
    let rawStickerPrice = 0;
    if (typeof itemOrShopifyItem.final_price === 'number') {
      rawStickerPrice = itemOrShopifyItem.final_price >= 10000 ? itemOrShopifyItem.final_price / 100 : itemOrShopifyItem.final_price;
    } else {
      rawStickerPrice = parsePriceToNumber(itemOrShopifyItem.price);
    }
    if (rawStickerPrice >= 1) return rawStickerPrice;

    return 150;
  }

  // A1. Check if item is a Tumbler or Mug vessel
  const isTumbler = name.includes('tumbler') && !name.includes('sheet') && !name.includes('trasfer') && !name.includes('transfer') && !name.includes('sticker');
  const isMug = name.includes('mug') && !name.includes('sheet') && !name.includes('trasfer') && !name.includes('transfer') && !name.includes('sticker');
  if (isTumbler || isMug) {
    if (props['Unit Price']) {
      const u = parsePriceToNumber(props['Unit Price']);
      if (u >= 100) return u;
    }
    if (props['Price']) {
      const p = parsePriceToNumber(props['Price']);
      if (p >= 100 && qty > 0) return Math.round(p / qty);
    }
    if (itemOrShopifyItem.price) {
      const rawP = parsePriceToNumber(itemOrShopifyItem.price);
      if (rawP >= 100 && qty > 0) return Math.round(rawP / qty);
    }
    return 200;
  }

  // A2. Check if item is a Gift Product
  const isGift = name.includes('gift') || name.includes('card holder') || name.includes('keychain') || name.includes('pen comes with box') || name.includes('diary');
  if (isGift) {
    if (props['Price']) {
      const p = parsePriceToNumber(props['Price']);
      if (p >= 100) return p;
    }
    if (props['Unit Price']) {
      const u = parsePriceToNumber(props['Unit Price']);
      if (u >= 100) return u;
    }
    let giftPrice = parsePriceToNumber(itemOrShopifyItem.price);
    if (giftPrice >= 100) return giftPrice;
    return 249;
  }

  // B. Check if item is a Cap Product
  const isCap = isCapProduct(itemOrShopifyItem);
  if (isCap) {
    let capUnitPrice = 250;
    if (qty >= 150) capUnitPrice = 138;
    else if (qty >= 100) capUnitPrice = 148;
    else if (qty >= 50) capUnitPrice = 170;
    else if (qty >= 25) capUnitPrice = 188;
    else if (qty >= 10) capUnitPrice = 205;
    else if (qty >= 5) capUnitPrice = 220;
    else capUnitPrice = 250;
    return capUnitPrice;
  }

  // C. Garment Pricing
  const isOversized = name.includes('oversiz') || (props['T-Shirt Fit'] && String(props['T-Shirt Fit']).toLowerCase().includes('oversiz'));
  const isPolo = name.includes('polo') || (props['T-Shirt Fit'] && String(props['T-Shirt Fit']).toLowerCase().includes('polo'));
  const isRound = name.includes('round') || (props['T-Shirt Fit'] && String(props['T-Shirt Fit']).toLowerCase().includes('round'));

  let baseUnitPrice = 625;
  if (name.includes('hangry') || name.includes('naruto')) {
    baseUnitPrice = 999;
  } else if (name.includes('cool dogs') || name.includes('earth is art') || name.includes('flow')) {
    baseUnitPrice = 799;
  } else if (name.includes('nature harmony')) {
    baseUnitPrice = 499;
  } else if (isOversized) {
    baseUnitPrice = 799;
  } else if (isPolo) {
    baseUnitPrice = 625;
  } else if (isRound) {
    baseUnitPrice = 599;
  }

  const hasBackPrint = name.includes('with back print') || (props['Back Print'] && String(props['Back Print']).toLowerCase().includes('with back print'));
  if (hasBackPrint) {
    baseUnitPrice += 100;
  }

  // In-Built T-Shirts: Flat price, no discount slab!
  if (typeof isInbuiltGarment === 'function' && isInbuiltGarment(itemOrShopifyItem)) {
    return baseUnitPrice;
  }

  return getSlabDiscountedUnitPrice(baseUnitPrice, qty);
}
window.getItemUnitPrice = getItemUnitPrice;


function formatMoney(amount) {
  const num = parsePriceToNumber(amount);
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCapImageUrl(colorName) {
  const cleanColor = String(colorName || 'black').toLowerCase();
  let fileName = 'cap-black-front.jpg';
  if (cleanColor.includes('white')) fileName = 'cap-white-front.jpg';
  else if (cleanColor.includes('navy') || cleanColor.includes('blue')) fileName = 'cap-navy-front.jpg';
  else if (cleanColor.includes('red')) fileName = 'cap-red-front.jpg';
  else fileName = 'cap-black-front.jpg';

  if (window.elementaCapAssets && window.elementaCapAssets[fileName]) {
    return window.elementaCapAssets[fileName];
  }
  if (window.getShopifyAsset) {
    return window.getShopifyAsset('assets/' + fileName);
  }
  return 'assets/' + fileName;
}

function deduplicateLocalCart() {
  if (!Array.isArray(localCartItems) || localCartItems.length <= 1) return;
  const cleaned = [];
  const seenMap = {};

  localCartItems.forEach(item => {
    if (!item) return;
    const rawId = String(item.id || '').trim();
    const mappedId = String(item.mappedVariantId || '').trim();
    const vKey = (mappedId && /^\d+$/.test(mappedId)) ? mappedId : ((rawId && /^\d+$/.test(rawId)) ? rawId : null);

    const props = item.properties || {};
    const cartId = props['_cartId'] || '';
    const hasCustomProps = Object.keys(props).length > 0 && (
      Boolean(props['Finish / Material']) || Boolean(props['Uploaded Artwork']) || Boolean(props['Size Breakdown']) ||
      Boolean(props['Back Print']) || Boolean(props['Product Name']) || Boolean(props['T-Shirt Fit']) ||
      Boolean(props['Front Artwork']) || Boolean(props['Back Artwork']) || Boolean(props['Custom Text']) ||
      Boolean(props['Paired Sticker']) || Boolean(props['Add-on Paired']) || Boolean(props['_pairId']) || Boolean(item.pairId) || Boolean(cartId)
    );

    const pairTag = item.pairId || props['_pairId'] || props['Pair ID'] || (item.isAddon ? ('addon_' + (item.parentItemId || rawId)) : '') || (item.isParentItem ? ('parent_' + rawId) : '');
    const customSig = hasCustomProps ? `${props['Finish / Material'] || ''}_${props['Shape / Sheet Size'] || ''}_${props['Size'] || ''}_${props['Uploaded Artwork'] || ''}_${props['Front Artwork'] || ''}_${props['Back Artwork'] || ''}_${props['Custom Text'] || ''}_${cartId || rawId}` : '';
    const dedupVKey = vKey ? (pairTag ? `${vKey}_${pairTag}_${rawId}` : (customSig ? `${vKey}_custom_${customSig}` : vKey)) : null;

    if (dedupVKey) {
      if (seenMap[dedupVKey] !== undefined) {
        const existingIdx = seenMap[dedupVKey];
        const existingItem = cleaned[existingIdx];
        const existingProps = existingItem.properties || {};
        const existingHasProps = Object.keys(existingProps).length > 0 && (
          Boolean(existingProps['Finish / Material']) || Boolean(existingProps['Uploaded Artwork']) || Boolean(existingProps['Size Breakdown']) ||
          Boolean(existingProps['Back Print']) || Boolean(existingProps['Product Name']) || Boolean(existingProps['T-Shirt Fit']) ||
          Boolean(existingProps['Front Artwork']) || Boolean(existingProps['Back Artwork']) || Boolean(existingProps['Custom Text']) ||
          Boolean(existingProps['Paired Sticker']) || Boolean(existingProps['Add-on Paired']) || Boolean(existingProps['_pairId']) || Boolean(existingItem.pairId)
        );

        if (hasCustomProps && !existingHasProps) {
          cleaned[existingIdx] = item;
        } else if (!hasCustomProps && existingHasProps) {
          // Discard generic server duplicate
        } else {
          cleaned[existingIdx] = item;
        }
      } else {
        seenMap[dedupVKey] = cleaned.length;
        cleaned.push(item);
      }
    } else {
      cleaned.push(item);
    }
  });

  localCartItems = cleaned;
}

function loadLocalCart() {
  try {
    const saved = localStorage.getItem('elementa_cart_items');
    if (saved) {
      localCartItems = JSON.parse(saved);
      localCartItems.forEach(item => {
        if (item && window.inbuiltProductVariantMap) {
          const rawName = String(item.name || item.title || '').replace(/^Product Name:\s*/i, '').trim();
          const rawBaseTitle = String(item.baseTitle || '').replace(/^Product Name:\s*/i, '').trim();
          const priceStr = String(item.price || (item.properties && item.properties['Price']) || '');
          const normName = (rawName + ' ' + rawBaseTitle).toLowerCase().replace(/[^a-z0-9]/g, '');

          let mappedId = null;

          if (item.mappedVariantId && /^\d{14,}$/.test(String(item.mappedVariantId).trim())) {
            mappedId = String(item.mappedVariantId).trim();
          } else if (normName.includes('3in1')) {
            mappedId = '67585069416580';
          } else if (normName.includes('2in1')) {
            if (normName.includes('cardholder')) mappedId = '67585069351044';
            else mappedId = '67585069285508';
          } else if (normName.includes('4in1')) {
            const numPrice = (typeof parsePriceToNumber === 'function') ? parsePriceToNumber(priceStr || item.price) : 0;
            if (priceStr.includes('1099') || priceStr.includes('1,099') || numPrice >= 1000) mappedId = '67585069514884';
            else mappedId = '67585069449348';
          }

          if (!mappedId) {
            const mapKeys = Object.keys(window.inbuiltProductVariantMap).filter(k => k.length > 3).sort((a, b) => b.length - a.length);
            for (const key of mapKeys) {
              const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (normName.includes(normKey)) {
                mappedId = window.inbuiltProductVariantMap[key];
                item.baseTitle = key;
                break;
              }
            }
          }

          if (mappedId) {
            item.mappedVariantId = mappedId;
          }
        }

        const isCap = (item.name || '').toLowerCase().includes('cap') || (item.properties && item.properties['Cap Color']);
        if (isCap) {
          const capColor = (item.properties && item.properties['Cap Color']) || item.name || 'black';
          const capPhoto = getCapImageUrl(capColor);
          if (!item.img || item.img.includes('slider-1') || item.img.includes('placeholder')) {
            item.img = capPhoto;
          }
        }

        if (item) {
          if (item.properties) {
            if (item.properties['_pairId'] && !item.pairId) item.pairId = item.properties['_pairId'];
            if (item.properties['_parentItemId'] && !item.parentItemId) item.parentItemId = item.properties['_parentItemId'];
            if (item.properties['Paired Sticker']) item.isAddon = true;
            if (item.properties['Add-on Paired']) item.isParentItem = true;
          }
          const itemLowerName = String(item.name || item.title || '').toLowerCase();
          const itemIsGarment = itemLowerName.includes('custom') || itemLowerName.includes('t-shirt') || itemLowerName.includes('tee') || itemLowerName.includes('shirt') || itemLowerName.includes('polo') || itemLowerName.includes('oversiz') || itemLowerName.includes('hoodie');
          const itemIsSticker = !itemIsGarment && (itemLowerName.includes('sticker') || itemLowerName.includes('dtf') || (item.properties && item.properties['Finish / Material']));
          const itemIsTumblerOrMug = itemLowerName.includes('tumbler') || itemLowerName.includes('mug');

          if (item.price && parsePriceToNumber(item.price) < 300 && !itemIsSticker && !itemIsTumblerOrMug) {
            delete item.price;
          }
          if (item.properties) {
            if (item.properties['Price'] && parsePriceToNumber(item.properties['Price']) < 300 && !itemIsSticker && !itemIsTumblerOrMug) {
              delete item.properties['Price'];
            }
            if (item.properties['Unit Price'] && parsePriceToNumber(item.properties['Unit Price']) < 300 && !itemIsSticker && !itemIsTumblerOrMug) {
              delete item.properties['Unit Price'];
            }
          }

          if (isCapProduct(item)) {
            item.quantity = Math.max(2, parseInt(item.quantity || 2, 10));
          }

          const unitNum = getItemUnitPrice(item);
          item.price = '₹' + unitNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      });
      deduplicateLocalCart();
      saveLocalCart();
    } else {
      localCartItems = [];
    }
  } catch (e) {
    localCartItems = [];
  }
  window.localCartItems = localCartItems;
}

function saveLocalCart() {
  window.localCartItems = localCartItems;
  try {
    localStorage.setItem('elementa_cart_items', JSON.stringify(localCartItems));
  } catch (e) { }
}

window.showToast = function (message, type = 'success') {
  const container = document.getElementById('cart-toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #A8D4B0; font-size: 18px;"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
};
function showToast(message, type = 'success') {
  if (typeof window.showToast === 'function') {
    return window.showToast(message, type);
  }
}


window.openCartDrawer = function () {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (drawer) drawer.classList.add('active', 'open');
  if (overlay) overlay.classList.add('active', 'open');
  document.body.style.overflow = 'hidden';
};

window.closeCartDrawer = function () {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (drawer) drawer.classList.remove('active', 'open');
  if (overlay) overlay.classList.remove('active', 'open');
  document.body.style.overflow = '';
};

window.toggleCartDrawer = function () {
  const drawer = document.getElementById('cart-drawer');
  if (drawer && (drawer.classList.contains('active') || drawer.classList.contains('open'))) {
    window.closeCartDrawer();
  } else {
    window.openCartDrawer();
  }
};

window.renderCartDrawer = function () {
  const container = document.getElementById('cart-drawer-items');
  const subtotalElem = document.getElementById('cart-subtotal-price');
  const badgeCounts = document.querySelectorAll('.cart-badge-count, .badge-count');

  let totalQty = 0;
  let subtotal = 0;

  localCartItems.forEach(item => {
    const unitPriceNum = getItemUnitPrice(item);
    const formattedUnit = '₹' + unitPriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    item.price = formattedUnit;

    const qty = parseInt(item.quantity || 1, 10);
    totalQty += qty;
    subtotal += unitPriceNum * qty;
  });

  badgeCounts.forEach(badge => {
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'inline-flex' : 'inline-block';
  });

  if (subtotalElem) {
    subtotalElem.textContent = '₹' + subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (!container) return;

  if (localCartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <i class="fa-solid fa-basket-shopping empty-cart-icon"></i>
        <p style="font-size: 16.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Your cart is empty</p>
        <p style="font-size: 13.5px; margin: 0;">Browse our custom apparel & stickers and add your favorite products!</p>
      </div>
    `;
    return;
  }

  let html = '';
  localCartItems.forEach((item, index) => {
    const isSticker = isStickerProduct(item);
    const finishProp = (item.properties && item.properties['Finish / Material']) ? String(item.properties['Finish / Material']).toLowerCase() : '';

    let finishImg = 'assets/sticker-transparent-main.jpg';
    if (finishProp.includes('transparent')) {
      finishImg = 'assets/sticker-transparent-main.jpg';
    } else if (finishProp.includes('vinyl')) {
      finishImg = 'assets/sticker-vinyl-hand-elementa.jpg';
    } else if (finishProp.includes('uv dtf')) {
      finishImg = 'assets/sticker-uvdtf-serum-bottle.jpg';
    } else if (finishProp.includes('standard') || finishProp.includes('paper')) {
      finishImg = 'assets/sticker-paper-redbox.jpg';
    }

    const isCap = isCapProduct(item);
    if (isCap && (item.quantity || 1) < 2) {
      item.quantity = 2;
    }
    let itemImg = item.img || item.image;
    if (isCap) {
      const capColor = (item.properties && item.properties['Cap Color']) || item.name || 'black';
      const capPhoto = getCapImageUrl(capColor);
      itemImg = (item.img && !item.img.includes('slider-1') && !item.img.includes('placeholder')) ? item.img : capPhoto;
    } else {
      const defaultFallback = isSticker ? finishImg : 'assets/elementa-logo.png';
      itemImg = item.img || item.image || (window.getShopifyAsset ? window.getShopifyAsset(defaultFallback) : defaultFallback);
    }
    const itemTitle = item.name || item.title || 'Custom Product';
    const itemPrice = formatMoney(item.price);

    let metaHtml = '';
    if (item.properties && typeof item.properties === 'object') {
      metaHtml = Object.entries(item.properties)
        .map(([k, v]) => {
          if (!v) return '';
          // Filter internal tracking properties
          if (k.startsWith('_') || k === 'Pair ID' || k === 'Parent Item ID' || k === 'Add-on Type' || k === 'Cap Preview Photo' || k.toLowerCase().includes('cap preview')) return '';
          let valStr = String(v);
          if (v instanceof File) {
            valStr = `📎 ${v.name}`;
          } else if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('//'))) {
            valStr = `<a href="${v}" target="_blank" rel="noopener" style="color: #0284c7; text-decoration: underline; font-weight: 700;">View File ↗</a>`;
          }
          return `<div><strong>${k}:</strong> ${valStr}</div>`;
        })
        .join('');
    } else if (item.variant) {
      metaHtml = `<div>${item.variant}</div>`;
    }

    let addonBadgeHtml = '';
    const isAddonItem = item.isAddon || Boolean(item.properties && item.properties['Paired Sticker']);
    const isParentWithAddon = item.isParentItem || Boolean(item.properties && item.properties['Add-on Paired']);

    if (isAddonItem) {
      const pairedTitle = (item.properties && item.properties['Paired Sticker']) || 'Sticker';
      addonBadgeHtml = `
        <div style="margin-bottom: 4px;">
          <span style="display: inline-flex; align-items: center; gap: 4px; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe; text-transform: uppercase;">
            <i class="fa-solid fa-paperclip"></i> Add-on with ${pairedTitle}
          </span>
        </div>
      `;
    } else if (isParentWithAddon) {
      const vesselTitle = (item.properties && item.properties['Add-on Paired']) || 'Vessel';
      addonBadgeHtml = `
        <div style="margin-bottom: 4px;">
          <span style="display: inline-flex; align-items: center; gap: 4px; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; border: 1px solid #a7f3d0; text-transform: uppercase;">
            <i class="fa-solid fa-mug-hot"></i> Includes ${vesselTitle} Add-on
          </span>
        </div>
      `;
    }

    html += `
      <div class="cart-item">
        <button class="cart-item-remove" onclick="removeFromCart('${item.id || index}')" title="Remove Item">
          <i class="fa-regular fa-trash-can"></i>
        </button>
        <img src="${itemImg}" alt="${itemTitle}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/80';">
        <div class="cart-item-details">
          ${addonBadgeHtml}
          <h4 class="cart-item-title">${itemTitle}</h4>
          ${metaHtml ? `<div class="cart-item-meta">${metaHtml}</div>` : ''}
          <div class="cart-item-price">${itemPrice}</div>
          <div class="cart-item-qty-row">
            <button class="cart-qty-btn" onclick="updateCartItemQty('${item.id || index}', -1)" ${isCap && (item.quantity || 1) <= 2 ? 'title="Minimum order for Customized Caps is 2 pcs" style="opacity: 0.55; cursor: not-allowed;"' : ''}>-</button>
            <span class="cart-qty-val">${item.quantity || 1}</span>
            <button class="cart-qty-btn" onclick="updateCartItemQty('${item.id || index}', 1)">+</button>
            ${isCap ? '<span style="font-size: 11px; font-weight: 700; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 6px; margin-left: 6px;"><i class="fa-solid fa-circle-info" style="font-size: 10px; margin-right: 3px;"></i>Min 2 Pcs</span>' : ''}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
};

window.handleAddToCart = function (itemData) {
  if (!itemData) return;

  const rawId = itemData.id || itemData.variant_id || itemData.mappedVariantId || '';
  const itemName = itemData.name || itemData.title || itemData.product_title || 'Custom Product';

  let priceNum = parsePriceToNumber(itemData.price);
  const isCustomConfigured = !!(
    (itemData.properties && (
      itemData.properties['Total Price'] ||
      itemData.properties['Unit Price'] ||
      itemData.properties['Finish / Material'] ||
      itemData.properties['T-Shirt Fit'] ||
      itemData.properties['Size Breakdown'] ||
      itemData.properties['Custom Options'] ||
      itemData.properties['Uploaded Artwork']
    )) ||
    (itemName.toLowerCase().includes('custom') && (itemData.properties || itemData.mappedVariantId))
  );

  if (!isCustomConfigured && priceNum < 300) {
    const lower = itemName.toLowerCase();
    if (lower.includes('hangry') || lower.includes('naruto') || lower.includes('one piece') || lower.includes('pink panther') || lower.includes('999')) priceNum = 999;
    else if (lower.includes('hoodie') || lower.includes('sweatshirt')) priceNum = 1299;
    else if (lower.includes('oversiz')) priceNum = 799;
    else if (lower.includes('graphic') || lower.includes('organic') || lower.includes('dtg')) priceNum = 499;
    else if (lower.includes('round')) priceNum = 599;
    else if (lower.includes('polo')) priceNum = 625;
    else if (lower.includes('sticker') || lower.includes('dtf')) priceNum = 150;
    else if (lower.includes('tumbler') || lower.includes('mug')) priceNum = 200;
    else if (lower.includes('cap')) priceNum = 250;
    else if (lower.includes('gift')) priceNum = 249;
    else priceNum = 799;
  }

  const itemPrice = '₹' + priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const itemImg = itemData.img || itemData.image || itemData.featured_image || '';
  let quantity = parseInt(itemData.quantity || 1, 10);
  if (isCapProduct(itemData)) {
    quantity = Math.max(2, quantity);
  }
  const properties = itemData.properties || null;

  // 1. Resolve Variant ID — priority order:
  //    a) Explicit numeric ID passed in itemData (most trusted)
  //    b) inbuiltProductVariantMap lookup by product name
  //    c) DOM form input fallback (for standard Shopify product-form add-to-cart)
  let resolvedVariantId = null;

  // a) Prefer explicit mappedVariantId or raw numeric ID first
  if (itemData.mappedVariantId && /^\d{10,}$/.test(String(itemData.mappedVariantId).trim())) {
    resolvedVariantId = String(itemData.mappedVariantId).trim();
  } else if (/^\d{10,}$/.test(String(rawId).trim()) && !String(rawId).startsWith('17')) {
    resolvedVariantId = String(rawId).trim();
  }

  // b) Name-based lookup in inbuiltProductVariantMap
  if (!resolvedVariantId && typeof inbuiltProductVariantMap !== 'undefined' && inbuiltProductVariantMap) {
    const cleanName = itemName.replace(/^Product Name:\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim();
    if (inbuiltProductVariantMap[cleanName]) {
      resolvedVariantId = inbuiltProductVariantMap[cleanName];
    } else if (inbuiltProductVariantMap[itemName]) {
      resolvedVariantId = inbuiltProductVariantMap[itemName];
    } else {
      // Try partial/normalized match
      const normLookup = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mapKeys = Object.keys(inbuiltProductVariantMap).filter(k => k.length > 5);
      for (const k of mapKeys) {
        if (normLookup.includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
          k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normLookup)) {
          resolvedVariantId = inbuiltProductVariantMap[k];
          break;
        }
      }
    }
  }

  // c) Custom T-Shirt resolution: match exact front/back print variant based on options
  const itemProps = itemData.properties || {};
  const isCustomTshirt = (itemName.toLowerCase().includes('custom') &&
    (itemName.toLowerCase().includes('polo') || itemName.toLowerCase().includes('oversiz') || itemName.toLowerCase().includes('round'))) ||
    (itemProps && (itemProps['T-Shirt Fit'] || itemProps['Back Print']));

  if (!resolvedVariantId && isCustomTshirt) {
    const hasBackPrint = (itemProps['Back Print'] === 'With Back Print') ||
      itemName.toLowerCase().includes('with back print');
    const isPolo = itemName.toLowerCase().includes('polo') || (itemProps['T-Shirt Fit'] && String(itemProps['T-Shirt Fit']).toLowerCase().includes('polo'));
    const isOversized = itemName.toLowerCase().includes('oversiz') || (itemProps['T-Shirt Fit'] && String(itemProps['T-Shirt Fit']).toLowerCase().includes('oversiz'));

    if (isPolo) {
      resolvedVariantId = hasBackPrint ? '52875687231620' : '52875687067780';
    } else if (isOversized) {
      resolvedVariantId = hasBackPrint ? '52875686379652' : '52875686215812';
    } else {
      resolvedVariantId = hasBackPrint ? '52875689590916' : '52875689427076';
    }
  }

  // d) DOM fallback: only if no ID resolved yet — read from the visible product form
  if (!resolvedVariantId) {
    const activeVariantInput = document.querySelector(
      'form[action*="/cart/add"] select[name="id"], ' +
      'form[action*="/cart/add"] input[name="id"]:checked, ' +
      'form[action*="/cart/add"] input[name="id"][type="hidden"]'
    );
    if (activeVariantInput && activeVariantInput.value && /^\d{10,}$/.test(String(activeVariantInput.value).trim())) {
      resolvedVariantId = activeVariantInput.value.trim();
      console.log('Variant ID resolved from DOM form input:', resolvedVariantId);
    }
  }

  // Fallback category variant map
  if (!resolvedVariantId) {
    const lowerName = itemName.toLowerCase();
    const categoryVariantMap = {
      polo_front: '52875687067780',
      polo_both: '52875687231620',
      oversized_front: '52875686215812',
      oversized_both: '52875686379652',
      round_front: '52875689427076',
      round_both: '52875689590916',
      cap: '67587052437636',
      gift: '67585069285508',
      sticker: '67585065189508',
      default: '52875689427076'
    };
    if (lowerName.includes('cap')) resolvedVariantId = categoryVariantMap.cap;
    else if (lowerName.includes('sticker')) resolvedVariantId = categoryVariantMap.sticker;
    else if (lowerName.includes('gift')) resolvedVariantId = categoryVariantMap.gift;
    else if (lowerName.includes('polo')) resolvedVariantId = categoryVariantMap.polo_front;
    else if (lowerName.includes('oversiz')) resolvedVariantId = categoryVariantMap.oversized_front;
    else resolvedVariantId = categoryVariantMap.round_front;
  }

  const finalVariantNum = Number(resolvedVariantId);

  // 2. Local Cart update for drawer UI
  addLocalCartItem({
    id: rawId || resolvedVariantId,
    mappedVariantId: resolvedVariantId,
    baseTitle: itemData.baseTitle || null,
    name: itemName,
    price: itemPrice,
    img: itemImg,
    quantity: quantity,
    properties: properties
  });

  // 3. Fallback & Debugging: Log variant ID and check validity
  if (!finalVariantNum || isNaN(finalVariantNum) || String(finalVariantNum).length < 10) {
    console.error('Add to Cart Failed: variantId is missing, undefined, or null:', resolvedVariantId);
    showToast(`Added "${itemName}" to cart!`);
    openCartDrawer();
    return;
  }

  console.log('Adding variant ID:', finalVariantNum);

  // 4. Send formatted request payload to /cart/add.js
  const rootPath = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/');

  const isOneRupeeSticker = ['67585065189508', '67585065058436', '67585065123972', '67686638256260', '67686441746564', '67686441779332', '67686441844868'].includes(String(resolvedVariantId)) ||
    (itemName.toLowerCase().includes('sticker') && !itemName.toLowerCase().includes('tumblr') && !itemName.toLowerCase().includes('mug'));

  let shopifyAddQty = Number(quantity) || 1;
  if (isOneRupeeSticker) {
    const calculatedRupees = Math.round(parsePriceToNumber(itemPrice) || parsePriceToNumber(properties && (properties['Total Price'] || properties['Price'])) || 1);
    shopifyAddQty = calculatedRupees > 0 ? (calculatedRupees * (Number(quantity) || 1)) : (Number(quantity) || 1);
  }

  let hasBinaryFile = false;
  if (properties && typeof properties === 'object') {
    for (const val of Object.values(properties)) {
      if (val instanceof File || val instanceof Blob) {
        hasBinaryFile = true;
        break;
      }
    }
  }

  let fetchPromise;
  if (hasBinaryFile) {
    const formData = new FormData();
    formData.append('id', Number(finalVariantNum));
    formData.append('quantity', shopifyAddQty);
    for (const [propKey, propVal] of Object.entries(properties || {})) {
      if (propVal !== undefined && propVal !== null) {
        if (propVal instanceof File || propVal instanceof Blob) {
          formData.append(`properties[${propKey}]`, propVal, propVal.name || 'artwork.png');
        } else {
          formData.append(`properties[${propKey}]`, String(propVal));
        }
      }
    }
    fetchPromise = fetch(rootPath + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });
  } else {
    fetchPromise = fetch(rootPath + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          id: Number(finalVariantNum),
          quantity: shopifyAddQty,
          properties: properties || {}
        }]
      })
    });
  }

  fetchPromise
    .then(res => {
      if (!res.ok) {
        return res.text().then(errText => {
          console.error('Shopify /cart/add.js error response:', res.status, errText);
          throw new Error(`Shopify cart error status ${res.status}: ${errText}`);
        });
      }
      return res.json();
    })
    .then(data => {
      console.log('Successfully added variant to Shopify cart:', data);
      if (data && data.properties) {
        const targetLocal = localCartItems.slice().reverse().find(i =>
          String(i.id) === String(rawId || resolvedVariantId) ||
          String(i.mappedVariantId) === String(resolvedVariantId)
        );
        if (targetLocal && targetLocal.properties) {
          for (const [pk, pv] of Object.entries(data.properties)) {
            if (typeof pv === 'string' && (pv.includes('/uploads/') || pv.startsWith('http://') || pv.startsWith('https://') || pv.startsWith('//'))) {
              targetLocal.properties[pk] = pv;
            }
          }
          saveLocalCart();
          renderCartDrawer();
        }
      }
      fetchShopifyCart();
    })
    .catch(err => {
      console.warn('Shopify cart add warning (local drawer preserved):', err);
    });

  showToast(`Added "${itemName}" to cart!`);
  openCartDrawer();
};

function handleAddToCart(itemData) {
  if (typeof window.handleAddToCart === 'function') {
    return window.handleAddToCart(itemData);
  }
}

function addLocalCartItem(item) {
  if (isCapProduct(item)) {
    item.quantity = Math.max(2, parseInt(item.quantity || 2, 10));
  }
  let formattedPrice = '';
  if (item.properties && item.properties['Unit Price']) {
    const priceNum = parsePriceToNumber(item.properties['Unit Price']);
    formattedPrice = '₹' + priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    const priceNum = parsePriceToNumber(item.price);
    formattedPrice = '₹' + priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  item.price = formattedPrice;

  if (item.properties && typeof item.properties === 'object') {
    const cleanProps = {};
    for (const [k, v] of Object.entries(item.properties)) {
      if (v instanceof File) {
        cleanProps[k] = `📎 ${v.name}`;
      } else {
        cleanProps[k] = v;
      }
    }
    item.properties = cleanProps;
  }

  const itemVariantId = (item.mappedVariantId && /^\d+$/.test(String(item.mappedVariantId).trim()))
    ? String(item.mappedVariantId).trim()
    : (/^\d+$/.test(String(item.id).trim()) ? String(item.id).trim() : null);

  const existingIdx = localCartItems.findIndex(i => {
    if (i.id === item.id) return true;
    if (item.pairId || i.pairId || item.isAddon || i.isAddon || (item.properties && item.properties['_pairId']) || (i.properties && i.properties['_pairId']) || (item.properties && item.properties['Paired Sticker']) || (item.properties && item.properties['Add-on Paired'])) {
      return false;
    }

    const itemProps = item.properties || {};
    const iProps = i.properties || {};

    if (itemProps['_cartId'] && iProps['_cartId']) {
      if (itemProps['_cartId'] === iProps['_cartId']) return true;
      return false;
    }

    const itemIsCustom = Boolean(
      itemProps['Finish / Material'] || itemProps['Uploaded Artwork'] || itemProps['Size Breakdown'] ||
      itemProps['Back Print'] || itemProps['T-Shirt Fit'] || itemProps['Front Artwork'] || itemProps['Back Artwork'] ||
      itemProps['Custom Text'] || itemProps['Customization'] || itemProps['Special Instructions'] || itemProps['Size']
    );
    const iIsCustom = Boolean(
      iProps['Finish / Material'] || iProps['Uploaded Artwork'] || iProps['Size Breakdown'] ||
      iProps['Back Print'] || iProps['T-Shirt Fit'] || iProps['Front Artwork'] || iProps['Back Artwork'] ||
      iProps['Custom Text'] || iProps['Customization'] || iProps['Special Instructions'] || iProps['Size']
    );

    if (itemIsCustom || iIsCustom) {
      if (itemVariantId) {
        const iVariantId = (i.mappedVariantId && /^\d+$/.test(String(i.mappedVariantId).trim()))
          ? String(i.mappedVariantId).trim()
          : (/^\d+$/.test(String(i.id).trim()) ? String(i.id).trim() : null);
        if (iVariantId && iVariantId === itemVariantId) {
          const sameFinish = (itemProps['Finish / Material'] || '') === (iProps['Finish / Material'] || '');
          const sameShape = (itemProps['Shape / Sheet Size'] || '') === (iProps['Shape / Sheet Size'] || '');
          const sameSize = (itemProps['Size'] || '') === (iProps['Size'] || '');
          const sameArt = (itemProps['Uploaded Artwork'] || '') === (iProps['Uploaded Artwork'] || '') &&
            (itemProps['Front Artwork'] || '') === (iProps['Front Artwork'] || '') &&
            (itemProps['Back Artwork'] || '') === (iProps['Back Artwork'] || '');
          const sameText = (itemProps['Custom Text'] || '') === (iProps['Custom Text'] || '');
          const sameBreakdown = (itemProps['Size Breakdown'] || '') === (iProps['Size Breakdown'] || '');

          if (sameFinish && sameShape && sameSize && sameArt && sameText && sameBreakdown) {
            return true;
          }
        }
      }
      return false;
    }

    if (itemVariantId) {
      const iVariantId = (i.mappedVariantId && /^\d+$/.test(String(i.mappedVariantId).trim()))
        ? String(i.mappedVariantId).trim()
        : (/^\d+$/.test(String(i.id).trim()) ? String(i.id).trim() : null);
      if (iVariantId && iVariantId === itemVariantId) {
        return true;
      }
    }
    return false;
  });

  if (existingIdx !== -1) {
    const existing = localCartItems[existingIdx];
    existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    existing.price = formattedPrice;
    if (item.mappedVariantId) existing.mappedVariantId = item.mappedVariantId;
    if (item.baseTitle) existing.baseTitle = item.baseTitle;
    if (item.properties) existing.properties = item.properties;
  } else {
    localCartItems.push(item);
  }

  deduplicateLocalCart();
  saveLocalCart();
  renderCartDrawer();
}

window.updateCartItemQty = async function (targetId, change) {
  const targetIdStr = String(targetId).trim();
  const index = localCartItems.findIndex((item, idx) =>
    String(item.id).trim() === targetIdStr || String(idx) === targetIdStr
  );

  if (index !== -1) {
    const item = localCartItems[index];
    const isCap = isCapProduct(item);

    // Prevent reducing quantity below 2 for Customized Caps
    if (isCap && change < 0 && (item.quantity || 1) <= 2) {
      if (typeof window.showToast === 'function') {
        window.showToast('Minimum order for Customized Caps is 2 pcs');
      } else if (typeof showToast === 'function') {
        showToast('Minimum order for Customized Caps is 2 pcs');
      }
      return;
    }

    const newQty = (item.quantity || 1) + change;

    if (newQty <= 0) {
      window.removeFromCart(targetId);
      return;
    }

    if (isCap && newQty < 2) {
      if (typeof window.showToast === 'function') {
        window.showToast('Minimum order for Customized Caps is 2 pcs');
      } else if (typeof showToast === 'function') {
        showToast('Minimum order for Customized Caps is 2 pcs');
      }
      return;
    }

    item.quantity = newQty;

    // For caps: sync properties and item title with updated quantity slab and unit price
    if (isCap) {
      const capUnitPrice = getItemUnitPrice(item);
      if (item.properties) {
        item.properties['Unit Price'] = `₹${capUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        item.properties['Total Price'] = `₹${(capUnitPrice * newQty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (item.name && item.name.includes('Pcs')) {
        item.name = item.name.replace(/\s*-\s*\d+\s*Pcs/i, ` - ${newQty} Pcs`);
      }
    }

    // Find paired item if exists
    const pairId = item.pairId || (item.properties && (item.properties['_pairId'] || item.properties['Pair ID']));
    let pairedItem = null;

    if (pairId) {
      pairedItem = localCartItems.find(other =>
        other !== item && (
          other.pairId === pairId ||
          (other.properties && (other.properties['_pairId'] === pairId || other.properties['Pair ID'] === pairId)) ||
          other.parentItemId === item.id ||
          other.id === item.parentItemId
        )
      );
    } else if (item.properties && item.properties['Add-on Paired']) {
      const pairedName = String(item.properties['Add-on Paired']).toLowerCase();
      pairedItem = localCartItems.find(other =>
        other !== item &&
        (other.name || '').toLowerCase().includes(pairedName) &&
        (other.properties && other.properties['Paired Sticker'])
      );
    } else if (item.properties && item.properties['Paired Sticker']) {
      const pairedStickerTitle = String(item.properties['Paired Sticker']).toLowerCase();
      pairedItem = localCartItems.find(other =>
        other !== item &&
        (other.name || other.title || other.baseTitle || '').toLowerCase().includes(pairedStickerTitle)
      );
    }

    if (pairedItem) {
      pairedItem.quantity = newQty;
    }

    saveLocalCart();
    renderCartDrawer();

    const rootPath = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/');

    const variantIdToChange = (/^\d+$/.test(String(item.id).trim()))
      ? String(item.id).trim()
      : (item.mappedVariantId || null);

    if (variantIdToChange) {
      try {
        const isOneRupee = ['67585065189508', '67585065058436', '67585065123972', '67686638256260', '67686441746564', '67686441779332', '67686441844868'].includes(String(variantIdToChange)) ||
          isStickerProduct(item);

        let shopifyChangeQty = newQty;
        if (isOneRupee) {
          const unitPriceNum = getItemUnitPrice(item);
          shopifyChangeQty = Math.round(unitPriceNum * newQty);
        }

        await fetch(rootPath + 'cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            id: String(variantIdToChange),
            quantity: shopifyChangeQty
          })
        });
      } catch (err) {
        console.warn('Shopify cart qty update error:', err);
      }
    }

    if (pairedItem) {
      const pairedVariantId = (/^\d+$/.test(String(pairedItem.id).trim()))
        ? String(pairedItem.id).trim()
        : (pairedItem.mappedVariantId || null);

      if (pairedVariantId) {
        try {
          const isPairedOneRupee = ['67585065189508', '67585065058436', '67585065123972', '67686638256260', '67686441746564', '67686441779332', '67686441844868'].includes(String(pairedVariantId)) ||
            (typeof isStickerProduct === 'function' && isStickerProduct(pairedItem));

          let pairedShopifyQty = newQty;
          if (isPairedOneRupee) {
            const pairedUnit = (typeof getItemUnitPrice === 'function') ? getItemUnitPrice(pairedItem) : 200;
            pairedShopifyQty = Math.round(pairedUnit * newQty);
          }

          await fetch(rootPath + 'cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              id: String(pairedVariantId),
              quantity: pairedShopifyQty
            })
          });
        } catch (err) {
          console.warn('Shopify paired cart qty update error:', err);
        }
      }
    }
  }
};

window.removeFromCart = async function (targetId) {
  const targetIdStr = String(targetId).trim();

  const index = localCartItems.findIndex((item, idx) =>
    String(item.id).trim() === targetIdStr || String(idx) === targetIdStr
  );

  if (index !== -1) {
    const removedItem = localCartItems[index];
    const itemsToRemove = [removedItem];

    // Check pairing relationships
    const pairId = removedItem.pairId || (removedItem.properties && (removedItem.properties['_pairId'] || removedItem.properties['Pair ID']));
    const isAddon = removedItem.isAddon || Boolean(removedItem.properties && removedItem.properties['Paired Sticker']);
    const isParent = !isAddon || removedItem.isParentItem || Boolean(removedItem.properties && removedItem.properties['Add-on Paired']);

    if (isParent) {
      // If the parent sticker is removed, ALSO remove all paired add-on vessels!
      localCartItems.forEach(other => {
        if (other === removedItem) return;
        const otherPairId = other.pairId || (other.properties && (other.properties['_pairId'] || other.properties['Pair ID']));
        const isPairedByPairId = pairId && otherPairId && (pairId === otherPairId);
        const isPairedByParentId = (other.parentItemId && other.parentItemId === removedItem.id) ||
          (other.properties && other.properties['_parentItemId'] === removedItem.id);
        const isPairedByTitle = other.properties && other.properties['Paired Sticker'] &&
          (other.properties['Paired Sticker'] === removedItem.baseTitle ||
            other.properties['Paired Sticker'] === removedItem.name ||
            (removedItem.name && removedItem.name.includes(other.properties['Paired Sticker'])));

        if (isPairedByPairId || isPairedByParentId || isPairedByTitle) {
          itemsToRemove.push(other);
        }
      });
    } else {
      // If only the add-on vessel was removed directly by the user:
      // Clear the paired status on the parent sticker so it stays as a standalone sheet
      localCartItems.forEach(other => {
        if (other === removedItem) return;
        const otherPairId = other.pairId || (other.properties && (other.properties['_pairId'] || other.properties['Pair ID']));
        const isPaired = (pairId && otherPairId && pairId === otherPairId) ||
          (removedItem.parentItemId && other.id === removedItem.parentItemId) ||
          (removedItem.properties && removedItem.properties['_parentItemId'] === other.id);
        if (isPaired) {
          other.pairId = null;
          other.isParentItem = false;
          other.pairedItemId = null;
          if (other.properties) {
            delete other.properties['Add-on Paired'];
            delete other.properties['_pairId'];
            delete other.properties['_pairedItemId'];
          }
        }
      });
    }

    // Remove all marked items from localCartItems
    localCartItems = localCartItems.filter(item => !itemsToRemove.includes(item));
    deduplicateLocalCart();
    saveLocalCart();
    renderCartDrawer();

    const rootPath = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/');

    if (localCartItems.length === 0) {
      try {
        await fetch(rootPath + 'cart/clear.js', { method: 'POST', credentials: 'same-origin' });
      } catch (err) { }
    } else {
      for (const itm of itemsToRemove) {
        const variantIdToRemove = (/^\d+$/.test(String(itm.id).trim()))
          ? String(itm.id).trim()
          : (itm.mappedVariantId || null);

        if (variantIdToRemove) {
          try {
            await fetch(rootPath + 'cart/change.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify({
                id: String(variantIdToRemove),
                quantity: 0
              })
            });
          } catch (err) {
            console.warn('Shopify cart item removal error:', err);
          }
        }
      }
    }
  }
};

function fetchShopifyCart() {
  fetch((window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/') + 'cart.js')
    .then(res => res.json())
    .then(cart => {
      if (!cart || !cart.items) return;
      if (cart.items.length === 0) return;

      if (!localCartItems || localCartItems.length === 0) {
        cart.items.forEach(shopifyItem => {
          const itemProps = shopifyItem.properties || {};
          const isOneRupee = ['67585065189508', '67585065058436', '67585065123972', '67686638256260', '67686441746564', '67686441779332', '67686441844868'].includes(String(shopifyItem.id)) ||
            (typeof isStickerProduct === 'function' && isStickerProduct(shopifyItem));

          let displayQty = shopifyItem.quantity;
          let displayPrice = `₹${(shopifyItem.final_price / 100).toFixed(2)}`;

          if (isOneRupee) {
            const tot = parsePriceToNumber(itemProps['Total Price'] || itemProps['Price']) || (shopifyItem.line_price / 100) || 1;
            displayPrice = `₹${tot.toFixed(2)}`;
            displayQty = Math.max(1, Math.round(shopifyItem.quantity / (tot || 1)));
          }

          if (isCapProduct(shopifyItem)) {
            displayQty = Math.max(2, displayQty);
          }

          const formatted = {
            id: itemProps['_cartId'] || String(shopifyItem.id),
            mappedVariantId: String(shopifyItem.id),
            name: itemProps['Product Name'] || shopifyItem.product_title || shopifyItem.title,
            price: displayPrice,
            img: shopifyItem.image || 'https://via.placeholder.com/80',
            quantity: displayQty,
            properties: itemProps
          };
          localCartItems.push(formatted);
        });
        deduplicateLocalCart();
        saveLocalCart();
        renderCartDrawer();
      } else {
        cart.items.forEach(shopifyItem => {
          const itemProps = shopifyItem.properties || {};
          const localMatch = localCartItems.find(i =>
            (itemProps['_cartId'] && i.properties && i.properties['_cartId'] === itemProps['_cartId']) ||
            String(i.mappedVariantId || i.id) === String(shopifyItem.id) ||
            String(i.id) === String(shopifyItem.id)
          );
          if (localMatch && localMatch.properties) {
            for (const [pk, pv] of Object.entries(itemProps)) {
              if (typeof pv === 'string' && (pv.includes('/uploads/') || pv.startsWith('http://') || pv.startsWith('https://') || pv.startsWith('//'))) {
                localMatch.properties[pk] = pv;
              }
            }
          }
        });
        deduplicateLocalCart();
        saveLocalCart();
        renderCartDrawer();
      }
    })
    .catch(err => console.warn('Shopify cart sync warning:', err));
}

window.initCartDrawer = function () {
  loadLocalCart();
  renderCartDrawer();
  fetchShopifyCart();

  const cartBtns = document.querySelectorAll('#header-cart-btn, [data-cart-toggle], .flo-header-cart-btn');
  cartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.toggleCartDrawer();
    });
  });
};

window.inbuiltProductVariantMap = {
  "1": "67585069285508",
  "3": "67585069351044",
  "4": "67585069416580",
  "7": "67585069449348",
  "8": "67585069514884",
  "Tumbler": "67643948925060",
  "Mug": "67643948990596",
  "67643948925060": "67643948925060",
  "67643948990596": "67643948990596",
  "67587052437636": "67587052437636",
  "Customized Cotton Cap": "67587052437636",
  "Customized Cotton Caps": "67587052437636",
  "Cotton Cap": "67587052437636",
  "Vinyl Custom Stickers": "67585065123972",
  "Transparent Custom Stickers": "67686638256260",
  "Standard Paper Custom Stickers": "67585065189508",
  "UV DTF Custom Stickers": "67585065058436",
  "67585069285508": "67585069285508",
  "67585069351044": "67585069351044",
  "67585069416580": "67585069416580",
  "67585069449348": "67585069449348",
  "67585069514884": "67585069514884",
  "2 in 1 Gift Set (Card Holder and pen comes with box)": "67585069351044",
  "2 in 1 gift set (Card Holder and pen comes with box)": "67585069351044",
  "2 in 1 gift set (Keychain and pen comes with box)": "67585069285508",
  "2 in 1 Gift Set (Keychain and pen comes with box)": "67585069285508",
  "3 in 1 Card Holder, Keychain and Pen comes with box": "67585069416580",
  "3 in 1 Card Holder, Key Chain and pen comes with box": "67585069416580",
  "4 in 1 gift set (Diary, Card holder, Keychain and pen comes with box)": "67585069449348",
  "4 in 1 gift set (Diary, Card Holder, Keychain and pen comes with box)": "67585069514884",
  "Berries UV DTF Mug Transfer Sheet": "67585068695684",
  "Berries UV DTF Mug Trasfer Sheet": "67585068695684",
  "Berries UV DTF Tumblr Transfer Sheet": "67585066336388",
  "Berries UV DTF Tumblr Trasfer Sheet": "67585066336388",
  "Birds and Bloom UV DTF Mug Transfer Sheet": "67585068040324",
  "Birds and Bloom UV DTF Mug Trasfer Sheet": "67585068040324",
  "Birds and Bloom UV DTF Tumblr Transfer Sheet": "67585065353348",
  "Birds and Bloom UV DTF Tumblr Trasfer Sheet": "67585065353348",
  "Bloom UV DTF Mug Transfer Sheet": "67585068073092",
  "Bloom UV DTF Mug Trasfer Sheet": "67585068073092",
  "Bloom UV DTF Tumblr Transfer Sheet": "67585065418884",
  "Bloom UV DTF Tumblr Trasfer Sheet": "67585065418884",
  "Blue Leaves UV DTF Mug Transfer Sheet": "67585068793988",
  "Blue Leaves UV DTF Mug Trasfer Sheet": "67585068793988",
  "Blue Leaves UV DTF Tumblr Transfer Sheet": "52941055426692",
  "Blue Leaves UV DTF Tumblr Trasfer Sheet": "52941055426692",
  "Bows with Hearts UV DTF Mug Transfer Sheet": "67585068302468",
  "Bows with Hearts UV DTF Mug Trasfer Sheet": "67585068302468",
  "Bows with Hearts UV DTF Tumblr Transfer Sheet": "67585065648260",
  "Bows with Hearts UV DTF Tumblr Trasfer Sheet": "67585065648260",
  "Cars UV DTF Mug Transfer Sheet": "67585068859524",
  "Cars UV DTF Mug Trasfer Sheet": "67585068859524",
  "Cars UV DTF Tumblr Transfer Sheet": "67585066107012",
  "Cars UV DTF Tumblr Trasfer Sheet": "67585066107012",
  "Chillies UV DTF Mug Transfer Sheet": "67585068892292",
  "Chillies UV DTF Mug Trasfer Sheet": "67585068892292",
  "Chillies UV DTF Tumblr Transfer Sheet": "67585066369156",
  "Chillies UV DTF Tumblr Trasfer Sheet": "67585066369156",
  "Christmas Theme UV DTF Mug Transfer Sheet": "67585068236932",
  "Christmas Theme UV DTF Mug Trasfer Sheet": "67585068236932",
  "Christmas Theme UV DTF Tumblr Transfer Sheet": "67585065549956",
  "Christmas Theme UV DTF Tumblr Trasfer Sheet": "67585065549956",
  "Cool Dogs Oversized Tee": "52946862735492",
  "10521324617860": "52946862735492",
  "Daisy UV DTF Mug Transfer Sheet": "67585068138628",
  "Daisy UV DTF Mug Trasfer Sheet": "67585068138628",
  "Daisy UV DTF Tumblr Transfer Sheet": "67585065484420",
  "Daisy UV DTF Tumblr Trasfer Sheet": "67585065484420",
  "Die Cuts Custom Stickers": "67585065123972",
  "Dinosaur UV DTF Mug Transfer Sheet": "67585069252740",
  "Dinosaur UV DTF Mug Trasfer Sheet": "67585069252740",
  "Dinosour Theme UV DTF Tumblr Transfer Sheet": "67585066139780",
  "Dinosour Theme UV DTF Tumblr Trasfer Sheet": "67585066139780",
  "Earth is Art Oversized Tee": "52947302350980",
  "Floral UV DTF Mug Transfer Sheet": "67585068204164",
  "Floral UV DTF Mug Trasfer Sheet": "67585068204164",
  "Floral UV DTF Tumblr Transfer Sheet": "67585065615492",
  "Floral UV DTF Tumblr Trasfer Sheet": "67585065615492",
  "Flow Oversized Tee": "67585059225732",
  "Flowers UV DTF Mug Transfer Sheet": "67585068957828",
  "Flowers UV DTF Mug Trasfer Sheet": "67585068957828",
  "Flowers UV DTF Tumblr Transfer Sheet": "67585066434692",
  "Flowers UV DTF Tumblr Trasfer Sheet": "67585066434692",
  "Hangry Oversized Tee": "67585059389572",
  "Heart Oversized Tee": "67585059520644",
  "Hot Wheels Oversized Tee": "67585059684484",
  "Kiss Cuts Custom Stickers": "67585065189508",
  "Custom Stickers": "67585065189508",
  "Lemon and Blueberries UV DTF Mug Transfer Sheet": "67585069023364",
  "Lemon and Blueberries UV DTF Mug Trasfer Sheet": "67585069023364",
  "Lemon and Blueberries UV DTF Tumblr Transfer Sheet": "67585066532996",
  "Lemon and Blueberries UV DTF Tumblr Trasfer Sheet": "67585066532996",
  "Lemon UV DTF Mug Transfer Sheet": "67585069056132",
  "Lemon UV DTF Mug Trasfer Sheet": "67585069056132",
  "Lemon UV DTF Tumblr Transfer Sheet": "67585067876484",
  "Lemon UV DTF Tumblr Trasfer Sheet": "67585067876484",
  "Majnu Bhai Painting Oversized Tee": "67585059848324",
  "Marg and Music Oversized Tee": "67585060012164",
  "Marvel Oversized Tee": "67585060176004",
  "Naruto Oversized Tee Black Color": "67585060307076",
  "Naruto Oversized Tee White Color": "67585060470916",
  "NewYork UV DTF Mug Transfer Sheet": "67585069121668",
  "NewYork UV DTF Mug Trasfer Sheet": "67585069121668",
  "NewYork UV DTF Tumblr Transfer Sheet": "67585066205316",
  "NewYork UV DTF Tumblr Trasfer Sheet": "67585066205316",
  "Not a Morning Person Oversized Tee": "67585060634756",
  "One Piece Oversized Tee": "67585060798596",
  "Peep Oversized Tee": "67585060929668",
  "Pink Bows Theme UV DTF Tumblr Transfer Sheet": "67585066270852",
  "Pink Bows Theme UV DTF Tumblr Trasfer Sheet": "67585066270852",
  "Pink Bows UV DTF Mug Transfer Sheet": "67585069187204",
  "Pink Bows UV DTF Mug Trasfer Sheet": "67585069187204",
  "Pink Panther Oversized Tee": "67585061093508",
  "Plot Oversized Tee": "67585061257348",
  "Pokemon UV DTF Mug Transfer Sheet": "67585068466308",
  "Pokemon UV DTF Mug Trasfer Sheet": "67585068466308",
  "pokemon UV DTF Tumblr Transfer Sheet": "67585065779332",
  "pokemon UV DTF Tumblr Trasfer Sheet": "67585065779332",
  "Potter head UV DTF Mug Transfer Sheet": "67585068400772",
  "Potter head UV DTF Mug Trasfer Sheet": "67585068400772",
  "Potter head UV DTF Tumblr Transfer Sheet": "67585065713796",
  "Potter head UV DTF Tumblr Trasfer Sheet": "67585065713796",
  "Sheet Cuts Custom Stickers": "67585065058436",
  "Sip And Yap Oversized Tee": "67585061421188",
  "Skateboard UV DTF Mug Transfer Sheet": "67585068597380",
  "Skateboard UV DTF Mug Trasfer Sheet": "67585068597380",
  "Skateboard UV DTF Tumblr Transfer Sheet": "67585065877636",
  "Skateboard UV DTF Tumblr Trasfer Sheet": "67585065877636",
  "Spicy Life Oversized Tee": "67585061585028",
  "Strawberries UV DTF Mug Transfer Sheet": "67585068531844",
  "Strawberries UV DTF Mug Trasfer Sheet": "67585068531844",
  "Strawberries UV DTF Tumblr Transfer Sheet": "67585065812100",
  "Strawberries UV DTF Tumblr Trasfer Sheet": "67585065812100",
  "Strawberry Patch UV DTF Mug Transfer Sheet": "67585068662916",
  "Strawberry Patch UV DTF Mug Trasfer Sheet": "67585068662916",
  "Strawberry Patch UV DTF Tumblr Transfer Sheet": "67585065943172",
  "Strawberry Patch UV DTF Tumblr Trasfer Sheet": "67585065943172",
  "Sushi Lover Oversized Tee": "67585061716100",
  "Tequila Oversized Tee": "67585061879940",
  "Too Pretty For a Job Oversized Tee": "67585062043780",
  "Yapper Oversized Tee": "67586112618628",
  "Zero Plans Oversized Tee": "67586097315972"
};

async function getStoreFallbackVariantId() {
  try {
    const rootPath = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/');
    const res = await fetch(rootPath + 'products.json?limit=5');
    const data = await res.json();
    if (data && data.products && data.products.length > 0) {
      for (const prod of data.products) {
        if (prod.variants && prod.variants.length > 0) {
          const avail = prod.variants.find(v => v.available) || prod.variants[0];
          if (avail && avail.id) return String(avail.id);
        }
      }
    }
  } catch (e) { }
  return '67585068204164';
}

window.goToCheckout = async function () {
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const originalHtml = checkoutBtn ? checkoutBtn.innerHTML : 'Checkout Now';

  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.7';
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing Checkout...';
  }

  try {
    if (!localCartItems || localCartItems.length === 0) {
      if (window.showToast) window.showToast('Your cart is empty! Add products before checking out.');
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.innerHTML = originalHtml;
      }
      return;
    }

    const rootPath = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/');

    // 1. Calculate quantity-based slab discount ONLY for customized apparel
    let totalCustomQty = 0;
    (localCartItems || []).forEach(item => {
      if (typeof isInbuiltGarment === 'function' && isInbuiltGarment(item)) {
        return; // In-built t-shirts do NOT count towards custom volume discount slab
      }
      const name = String(item.name || item.title || '').toLowerCase();
      if (name.includes('custom') || (typeof isGarmentItem === 'function' && isGarmentItem(item) && !isInbuiltGarment(item))) {
        totalCustomQty += parseInt(item.quantity || 1, 10);
      }
    });

    let discountCode = '';
    if (totalCustomQty >= 76) discountCode = 'SLAB43';
    else if (totalCustomQty >= 50) discountCode = 'SLAB40';
    else if (totalCustomQty >= 30) discountCode = 'SLAB35';
    else if (totalCustomQty >= 20) discountCode = 'SLAB32';
    else if (totalCustomQty >= 10) discountCode = 'SLAB27';
    else if (totalCustomQty >= 5) discountCode = 'SLAB24';
    else if (totalCustomQty >= 3) discountCode = 'SLAB11';

    // 2. Category variant map for custom product fallbacks
    const categoryVariantMap = {
      polo_front: '52875687067780',
      polo_both: '52875687231620',
      oversized_front: '52875686215812',
      oversized_both: '52875686379652',
      round_front: '52875689427076',
      round_both: '52875689590916',
      cap: '67587052437636',
      gift: '67585069285508',
      sticker: '67585065189508',
      default: '52875689427076'
    };

    const shopifyPayloadItems = localCartItems.map(item => {
      const itemStrId = String(item.id || '').trim();
      const isRealVariant = /^\d{14,}$/.test(itemStrId) && !itemStrId.startsWith('17');
      const cleanName = (item.name || item.title || '').replace(/^Product Name:\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim();
      const rawName = String(item.name || item.title || '').replace(/^Product Name:\s*/i, '').trim();
      const rawBaseTitle = String(item.baseTitle || '').replace(/^Product Name:\s*/i, '').trim();
      const priceStr = String(item.price || (item.properties && item.properties['Price']) || '');
      const normName = (rawName + ' ' + rawBaseTitle).toLowerCase().replace(/[^a-z0-9]/g, '');

      const itemText = (String(item.name || '') + ' ' + String(item.title || '') + ' ' + String(item.id || '')).toLowerCase();
      const isSticker = (typeof isStickerProduct === 'function') ? isStickerProduct(item) : (itemText.includes('sticker') && !itemText.includes('tumblr') && !itemText.includes('mug'));
      const isVessel = (itemText.includes('tumbler') || itemText.includes('mug')) && !itemText.includes('sheet') && !itemText.includes('trasfer') && !itemText.includes('transfer') && !itemText.includes('sticker');
      const hasBothPrints = itemText.includes('with back print') || (item.properties && item.properties['Back Print'] === 'With Back Print');
      const isCustomTshirt = (itemText.includes('custom') && (itemText.includes('polo') || itemText.includes('oversiz') || itemText.includes('round'))) ||
        (item.properties && (item.properties['T-Shirt Fit'] || item.properties['Back Print']));

      let variantId;

      let prefixMatchedId = null;
      if (typeof inbuiltProductVariantMap !== 'undefined' && inbuiltProductVariantMap) {
        const mapKeys = Object.keys(inbuiltProductVariantMap).filter(k => k.length > 3).sort((a, b) => b.length - a.length);
        for (const mapKey of mapKeys) {
          const normKey = mapKey.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normName.includes(normKey)) {
            prefixMatchedId = inbuiltProductVariantMap[mapKey];
            break;
          }
        }
      }

      if (isVessel) {
        variantId = (itemText.includes('tumbler')) ? 67643948925060 : 67643948990596;
      } else if (isCustomTshirt) {
        if (itemText.includes('polo') || (item.properties && String(item.properties['T-Shirt Fit']).toLowerCase().includes('polo'))) {
          variantId = parseInt(hasBothPrints ? categoryVariantMap.polo_both : categoryVariantMap.polo_front, 10);
        } else if (itemText.includes('oversiz') || (item.properties && String(item.properties['T-Shirt Fit']).toLowerCase().includes('oversiz'))) {
          variantId = parseInt(hasBothPrints ? categoryVariantMap.oversized_both : categoryVariantMap.oversized_front, 10);
        } else {
          variantId = parseInt(hasBothPrints ? categoryVariantMap.round_both : categoryVariantMap.round_front, 10);
        }
      } else if (item.mappedVariantId && /^\d{14,}$/.test(String(item.mappedVariantId).trim())) {
        variantId = parseInt(item.mappedVariantId, 10);
      } else if (isRealVariant) {
        variantId = parseInt(itemStrId, 10);
      } else if (normName.includes('4in1')) {
        const numPrice = (typeof parsePriceToNumber === 'function') ? parsePriceToNumber(priceStr || item.price) : 0;
        if (priceStr.includes('1099') || priceStr.includes('1,099') || numPrice >= 1000) {
          variantId = 67585069514884;
        } else {
          variantId = 67585069449348;
        }
      } else if (prefixMatchedId) {
        variantId = parseInt(prefixMatchedId, 10);
      } else if (item.baseTitle && typeof inbuiltProductVariantMap !== 'undefined' && inbuiltProductVariantMap[item.baseTitle]) {
        variantId = parseInt(inbuiltProductVariantMap[item.baseTitle], 10);
      } else if (typeof inbuiltProductVariantMap !== 'undefined' && (inbuiltProductVariantMap[cleanName] || inbuiltProductVariantMap[item.name])) {
        const directMatch = inbuiltProductVariantMap[cleanName] || inbuiltProductVariantMap[item.name];
        variantId = parseInt(directMatch, 10);
      } else {
        const isGiftItem = itemText.includes('gift') || itemText.includes('card') || itemText.includes('pen') || itemText.includes('keychain') || itemText.includes('box') || itemStrId.startsWith('gift_');

        let matchedFallback = categoryVariantMap.default;

        if (itemText.includes('cap')) {
          matchedFallback = categoryVariantMap.cap;
        } else if (isSticker) {
          if (itemText.includes('uv dtf')) {
            matchedFallback = '67585065058436';
          } else if (itemText.includes('transparent')) {
            matchedFallback = '67686638256260';
          } else if (itemText.includes('vinyl') || itemText.includes('die cut')) {
            matchedFallback = '67585065123972';
          } else {
            matchedFallback = '67585065189508';
          }
        } else if (isGiftItem) {
          matchedFallback = categoryVariantMap.gift;
        } else if (itemText.includes('polo')) {
          matchedFallback = hasBothPrints ? categoryVariantMap.polo_both : categoryVariantMap.polo_front;
        } else if (itemText.includes('oversiz')) {
          matchedFallback = hasBothPrints ? categoryVariantMap.oversized_both : categoryVariantMap.oversized_front;
        } else {
          matchedFallback = hasBothPrints ? categoryVariantMap.round_both : categoryVariantMap.round_front;
        }

        variantId = parseInt(matchedFallback, 10);
      }

      const itemProperties = Object.assign({}, item.properties || {});
      itemProperties['Product Name'] = item.name || item.title || 'Custom Product';
      if (item.price) itemProperties['Price'] = String(item.price);

      let finalQty = parseInt(item.quantity || 1, 10);
      if (isCapProduct(item)) {
        finalQty = Math.max(2, finalQty);
      }

      if (isVessel) {
        finalQty = parseInt(item.quantity || 1, 10);
      } else {
        const isOneRupeeSticker = ['67585065189508', '67585065058436', '67585065123972', '67686638256260', '67686441746564', '67686441779332', '67686441844868'].includes(String(variantId)) ||
          (isSticker && !itemText.includes('tumblr') && !itemText.includes('mug'));

        if (isOneRupeeSticker) {
          let stickerPrice = 0;
          if (itemProperties['Total Price']) {
            stickerPrice = parsePriceToNumber(itemProperties['Total Price']);
          }
          if (!stickerPrice && itemProperties['Price']) {
            stickerPrice = parsePriceToNumber(itemProperties['Price']);
          }
          if (!stickerPrice && item.price) {
            stickerPrice = parsePriceToNumber(item.price);
          }
          if (!stickerPrice) {
            stickerPrice = getItemUnitPrice(item);
          }
          if (stickerPrice >= 1) {
            finalQty = Math.round(stickerPrice * finalQty);
          }
        }
      }

      return {
        id: variantId,
        quantity: finalQty,
        properties: itemProperties
      };
    });

    // 3. Sync to Shopify cart via AJAX
    await fetch(rootPath + 'cart/clear.js', { method: 'POST', credentials: 'same-origin' }).catch(() => { });
    await fetch(rootPath + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ items: shopifyPayloadItems })
    }).catch(() => { });

    // 4. Navigate directly to Shopify Checkout
    const checkoutUrl = rootPath + 'checkout' + (discountCode ? '?discount=' + encodeURIComponent(discountCode) : '');
    window.location.href = checkoutUrl;

  } catch (e) {
    console.error('Checkout error:', e);
    window.location.href = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/') + 'checkout';
  }
};

function initWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-drawer-overlay');
  const wishlistBtn = document.getElementById('header-wishlist-btn');
  const closeBtn = document.getElementById('wishlist-drawer-close');

  window.openWishlist = function () {
    if (overlay && drawer) {
      renderWishlist();
      overlay.classList.add('active');
      drawer.classList.add('active');
    }
  };

  window.closeWishlist = function () {
    if (overlay && drawer) {
      overlay.classList.remove('active');
      drawer.classList.remove('active');
    }
  };

  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openWishlist();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', window.closeWishlist);
  if (overlay) overlay.addEventListener('click', window.closeWishlist);

  if (typeof checkPendingWishlistOnLoad === 'function') {
    checkPendingWishlistOnLoad();
  }
}

function renderWishlist() {
  const container = document.getElementById('wishlist-drawer-items');
  if (!container) return;

  if (wishlistItems.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px 0; color: #747d8c;">
      <i class="fa-regular fa-heart" style="font-size: 32px; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
      <p style="font-size: 16px; font-weight: 600;">Your wishlist is empty</p>
      <p style="font-size: 13px;">Save items you love to your wishlist!</p>
    </div>`;
    return;
  }

  container.innerHTML = wishlistItems.map((item, index) => {
    return `
      <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
        <img src="${item.img}" style="width: 60px; height: 60px; object-fit: contain; background: #f8fafc; border-radius: 8px; padding: 5px;">
        <div style="flex: 1;">
          <h5 style="font-size: 14px; font-weight: 600; color: #1e272e; margin-bottom: 4px;">${item.name}</h5>
          <span style="font-size: 14px; font-weight: 700; color: #00a8ff;">${item.price}</span>
        </div>
        <button onclick="moveWishlistItemToCart(${index})" style="background: #00a8ff; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; margin-right: 5px;" title="Add to Cart">Add to Cart</button>
        <button onclick="removeWishlistItem(${index})" style="color: #ff4757; font-weight: bold; background: none; border: none; cursor: pointer; font-size: 16px;" title="Remove from Wishlist">✕</button>
      </div>
    `;
  }).join('');
}

window.removeWishlistItem = function (index) {
  wishlistItems.splice(index, 1);
  saveWishlistToStorage();
  updateWishlistBadgeCount();
  renderWishlist();
};

window.moveWishlistItemToCart = function (index) {
  const item = wishlistItems[index];
  if (item) {
    handleAddToCart(item);
  }
};

window.addTshirtWishlist = window.addTshirtToWishlist = function () {
  const qty = tshirtState.targetQty || 1;
  const totalPrice = tshirtState.totalPrice || (tshirtState.unitPrice || 699.00);
  const itemName = `Custom T-Shirt (${tshirtState.color}, ${tshirtState.fit}, ${tshirtState.finish}) - ${qty} Pcs`;
  const imgUrl = tshirtState.artworkDataUrl || 'assets/tshirt-main-dtg.jpg';

  handleAddToWishlist({
    id: Date.now(),
    name: itemName,
    price: `₹${totalPrice.toLocaleString('en-IN')}`,
    img: imgUrl
  });
};

window.addStickerToWishlist = function () {
  if (!stickerState.finish) {
    alert('Please select a Finish / Material before adding to wishlist!');
    return;
  }
  const totalPrice = stickerState.totalPrice || 0;
  const sheets = stickerState.sheets || 1;
  const itemName = `Custom Stickers (${stickerState.finish}, ${stickerState.shape || 'Circle'}, ${sheets} Sheets)`;
  const imgUrl = stickerState.artworkDataUrl || 'assets/sticker-transparent-bottle.jpg';

  handleAddToWishlist({
    id: Date.now(),
    name: itemName,
    price: `₹${totalPrice.toLocaleString('en-IN')}`,
    img: imgUrl
  });
};

window.addGiftToWishlist = function () {
  const qty = giftState.targetQty || 1;
  const totalPrice = giftState.totalPrice || (giftState.basePrice * qty);
  const title = giftState.productTitle || '3 in 1 Gift Set';
  const itemName = `${title} - ${qty} Pc(s)`;
  const imgUrl = giftState.artworkDataUrl || giftState.productImg || 'assets/gift-product-1-main.jpg';

  handleAddToWishlist({
    id: Date.now(),
    name: itemName,
    price: `₹${totalPrice.toLocaleString('en-IN')}`,
    img: imgUrl
  });
};

/* --------------------------------------------------------------------------
   4. Quick View Modal & Toast Notifications
   -------------------------------------------------------------------------- */
function initQuickView() {
  const quickViewBtns = document.querySelectorAll('.btn-quick-view');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productCard = btn.closest('.product-card');
      const name = productCard.querySelector('.product-name').textContent;
      showToast(`Quick View for "${name}"`);
    });
  });
}

function showToast(message) {
  // Toast notifications disabled per user request
}

/* --------------------------------------------------------------------------
   5. Stickers Product Page Configurator Logic
   -------------------------------------------------------------------------- */
let stickerState = {
  finish: null,
  shape: null,
  size: '3" x 3"',
  sheets: null,
  uvSheetSize: null,
  artworkFile: null,
  artworkDataUrl: null,
  artworkScale: 100,
  artworkApproved: false,
  perSheetRate: 0,
  totalPrice: 0,
  viewMode: 'lifestyle'
};

window.toggleArtworkApproval = function (elem) {
  stickerState.artworkApproved = elem ? elem.checked : false;
  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
};

window.updateStickerAddBtnState = function () {
  const addBtn = document.getElementById('btn-add-custom-cart');
  if (!addBtn) return;

  const hasFinish = !!stickerState.finish;
  const isUvDtf = hasFinish && String(stickerState.finish).toLowerCase().includes('uv dtf');
  const hasShapeOrSheet = isUvDtf ? !!stickerState.uvSheetSize : !!stickerState.shape;
  const hasQty = !!stickerState.sheets && stickerState.sheets >= 1;
  const hasArtwork = !!(stickerState.artworkFile || stickerState.artworkDataUrl);
  const isApproved = !!stickerState.artworkApproved;

  const isEnabled = hasFinish && hasShapeOrSheet && hasQty && hasArtwork && isApproved;

  if (isEnabled) {
    addBtn.removeAttribute('disabled');
    addBtn.disabled = false;
    addBtn.style.setProperty('opacity', '1', 'important');
    addBtn.style.setProperty('cursor', 'pointer', 'important');
    addBtn.style.setProperty('pointer-events', 'auto', 'important');
    addBtn.style.setProperty('box-shadow', '0 8px 20px rgba(20, 61, 28, 0.3)', 'important');
    addBtn.style.setProperty('filter', 'none', 'important');
    addBtn.style.setProperty('background', '#143d1c', 'important');

    const sheets = stickerState.sheets || 1;
    const totalPrice = stickerState.totalPrice || 0;
    addBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add ${sheets} Sheet${sheets > 1 ? 's' : ''} to Cart — ₹${totalPrice.toLocaleString('en-IN')}`;
  } else {
    addBtn.setAttribute('disabled', 'disabled');
    addBtn.disabled = true;
    addBtn.style.setProperty('opacity', '0.45', 'important');
    addBtn.style.setProperty('cursor', 'not-allowed', 'important');
    addBtn.style.setProperty('pointer-events', 'auto', 'important');
    addBtn.style.setProperty('box-shadow', 'none', 'important');
    addBtn.style.setProperty('filter', 'grayscale(0.6)', 'important');
    addBtn.style.setProperty('background', '#94a3b8', 'important');

    if (hasFinish && hasShapeOrSheet && hasQty && hasArtwork && !isApproved) {
      addBtn.innerHTML = `<i class="fa-solid fa-square-check"></i> Please Tick Design Approval Checkbox Above`;
    } else {
      addBtn.innerHTML = `<i class="fa-solid fa-hand-pointer"></i> Please Select Options & Upload Artwork Above`;
    }
  }
};

window.switchGalleryViewMode = function (mode) {
  const canvasView = document.getElementById('sticker-canvas-view');
  const lifestyleView = document.getElementById('sticker-lifestyle-view');
  const btnCanvas = document.getElementById('view-btn-canvas');
  const btnLifestyle = document.getElementById('view-btn-lifestyle');

  stickerState.viewMode = mode;

  if (mode === 'canvas') {
    if (canvasView) canvasView.style.display = 'flex';
    if (lifestyleView) lifestyleView.style.display = 'none';
    if (btnCanvas) btnCanvas.classList.add('active');
    if (btnLifestyle) btnLifestyle.classList.remove('active');
  } else {
    if (canvasView) canvasView.style.display = 'none';
    if (lifestyleView) lifestyleView.style.display = 'block';
    if (btnCanvas) btnCanvas.classList.remove('active');
    if (btnLifestyle) btnLifestyle.classList.add('active');
  }
};

window.toggleCanvasGrid = function (btn) {
  const wrapper = document.getElementById('sticker-canvas-view');
  if (wrapper) {
    wrapper.classList.toggle('grid-bg');
    if (btn) btn.classList.toggle('active');
  }
};

window.resetCanvasTransform = function () {
  stickerState.artworkScale = 100;
  const slider = document.getElementById('artwork-scale-slider');
  if (slider) slider.value = 100;
  const percentText = document.getElementById('artwork-scale-percent');
  if (percentText) percentText.textContent = '100%';

  const artImg = document.getElementById('sticker-artwork-img');
  if (artImg) {
    artImg.style.transform = 'scale(1)';
  }

  const dieCut = document.getElementById('sticker-die-cut-object');
  if (dieCut) {
    dieCut.classList.remove('morph-pop');
    void dieCut.offsetWidth;
    dieCut.classList.add('morph-pop');
  }
};

window.selectShape = function (elem) {
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  elem.classList.add('active');
  const shapeKey = elem.dataset.shape || elem.querySelector('strong').textContent;
  stickerState.shape = shapeKey;

  const lInput = document.getElementById('sticker-length-input');
  const wInput = document.getElementById('sticker-width-input') || document.getElementById('sticker-breadth-input');
  const lockIndicator = document.getElementById('square-locked-indicator');
  const len = lInput ? parseFloat(lInput.value) || 3 : 3;
  const brd = wInput ? parseFloat(wInput.value) || 3 : 3;

  if (shapeKey === 'Square') {
    if (lInput && wInput) {
      wInput.value = lInput.value;
      wInput.readOnly = true;
      wInput.style.backgroundColor = '#f1f5f9';
      wInput.style.cursor = 'not-allowed';
      wInput.style.color = '#64748b';
      wInput.style.borderColor = '#cbd5e1';
      wInput.setAttribute('title', 'Width is automatically locked to Length for Square shape');
    }
    if (lockIndicator) {
      lockIndicator.style.display = 'inline-flex';
    }
  } else {
    if (wInput) {
      wInput.readOnly = false;
      wInput.style.backgroundColor = '';
      wInput.style.cursor = '';
      wInput.style.color = '';
      wInput.style.borderColor = '';
      wInput.removeAttribute('title');
    }
    if (lockIndicator) {
      lockIndicator.style.display = 'none';
    }
    if (shapeKey === 'Rectangle' && len === brd) {
      if (lInput && wInput) {
        lInput.value = 4;
        wInput.value = 2.5;
      }
    } else if (shapeKey === 'Oval' && len === brd) {
      if (lInput && wInput) {
        lInput.value = 3.5;
        wInput.value = 2.5;
      }
    }
  }

  const dieCut = document.getElementById('sticker-die-cut-object');
  if (dieCut) {
    dieCut.classList.remove('shape-circle', 'shape-rectangle', 'shape-square', 'shape-oval', 'shape-shapecut');
    const shapeClassMap = {
      'Circle': 'shape-circle',
      'Rectangle': 'shape-rectangle',
      'Square': 'shape-square',
      'Oval': 'shape-oval',
      'Shape Cut Sticker': 'shape-shapecut',
      'Shape Cut': 'shape-shapecut'
    };
    const sClass = shapeClassMap[shapeKey] || 'shape-circle';
    dieCut.classList.add(sClass);

    // Apply Elastic Morph Pop Animation
    dieCut.classList.remove('morph-pop');
    void dieCut.offsetWidth;
    dieCut.classList.add('morph-pop');
  }

  updateCustomSize();
  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
  showToast(`Selected Shape: ${shapeKey}`);
};

const materialGalleryMap = {
  'Standard Paper': {
    title: 'Standard Paper Stickers',
    description: 'Simple, versatile, and made for everyday use.<br>Our Standard Paper Stickers are an easy way to add your logo, message, or design to packaging, labels, gifts, and more. Upload your design, choose your size, and we\'ll turn it into stickers made just for you.<br><br><strong>Perfect for packaging, thank-you stickers, product labels, event favours, and everyday branding.</strong>',
    main: 'assets/sticker-paper-hand.jpg',
    badge: 'STANDARD PAPER',
    thumbs: [
      { src: 'assets/sticker-paper-hand.jpg', label: 'Thank You Round Sticker (Hand)' },
      { src: 'assets/sticker-paper-redbox.jpg', label: 'Thank You Label on Red Gift Box' },
      { src: 'assets/sticker-paper-cardboard.jpg', label: 'Barcode & Social Labels on Cardboard' },
      { src: 'assets/sticker-size-guide.png', label: 'Coin Size Reference Guide' }
    ]
  },
  'Vinyl': {
    title: 'Custom Vinyl Stickers',
    description: 'Made to last, wherever you stick them.<br>Our Vinyl Stickers are durable, water-resistant, and perfect when you need something stronger than a regular paper sticker. Customize them with your logo, artwork, or design and use them across a variety of smooth surfaces.<br><br><strong>Perfect for bottles, packaging, laptops, jars, products, and more.</strong>',
    main: 'assets/sticker-vinyl-hand-elementa.jpg',
    badge: 'VINYL GLOSS',
    thumbs: [
      { src: 'assets/sticker-vinyl-hand-elementa.jpg', label: 'Elementa Round Vinyl Sticker (Hand)' },
      { src: 'assets/sticker-vinyl-redbox.jpg', label: 'Vinyl Sticker on Red Gift Box' },
      { src: 'assets/sticker-vinyl-shapecut-funny.jpg', label: 'Die-Cut Shape Cut Vinyl Stickers' },
      { src: 'assets/sticker-size-guide.png', label: 'Coin Size Reference Guide' }
    ]
  },
  'Transparent': {
    title: 'Transparent Stickers',
    description: 'Clean, subtle, and designed to blend in. Our Transparent Stickers give your design a clean, seamless look while allowing the surface underneath to show through. They\'re perfect when you want your branding to stand out without a visible sticker background.<br><br><strong>Perfect for glass, jars, bottles, clear packaging, acrylic, and minimal branding.</strong>',
    main: 'assets/sticker-transparent-hand-elementa.jpg',
    badge: 'TRANSPARENT',
    thumbs: [
      { src: 'assets/sticker-transparent-hand-elementa.jpg', label: 'Elementa Clear Logo Sticker' },
      { src: 'assets/sticker-transparent-bottle.jpg', label: 'Elementa Clear Spray Bottle Label' },
      { src: 'assets/sticker-transparent-bamboo-candle.jpg', label: 'Bamboo Candle Jar Label' },
      { src: 'assets/sticker-size-guide.png', label: 'Coin Size Reference Guide' }
    ]
  },
  'UV DTF (transfer stickers)': {
    title: 'UV DTF Transfer Stickers',
    description: 'A premium look, made effortless.<br>Our UV DTF Transfer Stickers are made for designs that deserve a more elevated finish. With no visible background, your design sits seamlessly on the surface, creating a clean, high-end look that feels almost directly printed on. Durable, waterproof, and made to stand out.<br><br><strong>Perfect for glass, acrylic, bottles, jars, tumblers, packaging, and other hard surfaces.</strong>',
    main: 'assets/sticker-uvdtf-serum-bottle.jpg',
    badge: 'UV DTF 3D',
    thumbs: [
      { src: 'assets/sticker-uvdtf-serum-bottle.jpg', label: 'UV DTF Amber Serum Bottle' },
      { src: 'assets/sticker-uvdtf-glass-tumbler.jpg', label: 'UV DTF Glass Tumbler' },
      { src: 'assets/sticker-uvdtf-how-to-apply.jpg', label: 'Steps to Apply UV DTF Transfer Sticker' },
      { src: 'assets/sticker-size-guide.png', label: 'Coin Size Reference Guide' }
    ]
  },
  'Default': {
    title: 'Custom Stickers',
    description: '<strong>Custom Stickers for Every Project and Business</strong><br>Bring your ideas to life with high-quality custom stickers made for both home and commercial use. Whether you are running a business, leveling up your product packaging, organising your kitchen, or personalising your gear, we turn your designs into premium stickers. Upload your artwork, choose your material, and let us handle the rest.',
    main: 'assets/sticker-transparent-bottle.jpg',
    badge: 'CUSTOM STICKERS',
    thumbs: [
      { src: 'assets/sticker-transparent-bottle.jpg', label: 'Elementa Clear Spray Bottle' },
      { src: 'assets/sticker-transparent-hand-elementa.jpg', label: 'Elementa Clear Logo Sticker (Hand)' },
      { src: 'assets/sticker-transparent-bamboo-candle.jpg', label: 'Bamboo Candle Jar Label' },
      { src: 'assets/sticker-vinyl-shapecut-funny.jpg', label: 'Die-Cut Shape Cut Vinyl Stickers' }
    ]
  }
};

let currentMaterialThumbs = materialGalleryMap['Default'].thumbs;
let currentImageIndex = 0;
let galleryAutoplayTimer = null;

function startGalleryAutoplay() {
  stopGalleryAutoplay();
  galleryAutoplayTimer = setInterval(() => {
    if (currentMaterialThumbs && currentMaterialThumbs.length > 0) {
      currentImageIndex = (currentImageIndex + 1) % currentMaterialThumbs.length;
      changeMainImageIndex(currentImageIndex, false);
    }
  }, 4000);
}

function stopGalleryAutoplay() {
  if (galleryAutoplayTimer) {
    clearInterval(galleryAutoplayTimer);
    galleryAutoplayTimer = null;
  }
}

window.changeMainImageIndex = function (index, userClicked = true) {
  currentImageIndex = index;
  if (currentMaterialThumbs && currentMaterialThumbs[index]) {
    const mainImg = document.getElementById('main-product-img');
    if (mainImg) {
      const targetSrc = currentMaterialThumbs[index].src;
      mainImg.src = window.getShopifyAsset ? window.getShopifyAsset(targetSrc) : targetSrc;
      mainImg.style.animation = 'fadeIn 0.3s ease';
    }
    document.querySelectorAll('.sticker-gallery-thumb-btn, .gallery-dot').forEach((d, i) => {
      if (i === index) {
        d.classList.add('active');
        d.style.borderColor = '#00b894';
        d.style.boxShadow = '0 0 0 2px rgba(0, 184, 148, 0.3)';
      } else {
        d.classList.remove('active');
        d.style.borderColor = '#e2e8f0';
        d.style.boxShadow = 'none';
      }
    });
  }
  if (userClicked) {
    startGalleryAutoplay();
  }
};

window.selectFinish = function (elem) {
  document.querySelectorAll('.finish-btn').forEach(b => b.classList.remove('active'));
  elem.classList.add('active');
  const finishKey = elem.dataset.finish || elem.querySelector('strong').textContent;
  stickerState.finish = finishKey;

  const isUvDtf = finishKey.includes('UV DTF');

  const shapeLabel = document.getElementById('step-shape-label');
  const standardShapes = document.getElementById('standard-shapes-grid');
  const uvdtfSheets = document.getElementById('uvdtf-sheets-grid');

  if (isUvDtf) {
    if (shapeLabel) shapeLabel.textContent = '2. SHEET TYPE:';
    if (standardShapes) standardShapes.style.display = 'none';
    if (uvdtfSheets) uvdtfSheets.style.display = 'grid';
  } else {
    if (shapeLabel) shapeLabel.textContent = '2. SHAPE:';
    if (standardShapes) standardShapes.style.display = 'grid';
    if (uvdtfSheets) uvdtfSheets.style.display = 'none';
  }

  // Update Live Studio Canvas Finish Class & Effects
  const dieCut = document.getElementById('sticker-die-cut-object');
  if (dieCut) {
    dieCut.classList.remove('finish-paper', 'finish-vinyl', 'finish-transparent', 'finish-uvdtf');
    if (finishKey === 'Standard Paper') dieCut.classList.add('finish-paper');
    else if (finishKey === 'Transparent') dieCut.classList.add('finish-transparent');
    else if (isUvDtf) dieCut.classList.add('finish-uvdtf');
    else dieCut.classList.add('finish-vinyl');

    dieCut.classList.remove('morph-pop');
    void dieCut.offsetWidth;
    dieCut.classList.add('morph-pop');
  }

  // Trigger Particle Beam Shimmer Ray Sweep Animation
  const sweepLayer = document.getElementById('material-sweep-layer');
  if (sweepLayer) {
    sweepLayer.classList.remove('trigger-sweep');
    void sweepLayer.offsetWidth;
    sweepLayer.classList.add('trigger-sweep');
  }

  const galleryData = materialGalleryMap[finishKey];
  if (galleryData) {
    currentMaterialThumbs = galleryData.thumbs;
    currentImageIndex = 0;

    const titleElem = document.getElementById('product-title-main');
    if (titleElem && galleryData.title) {
      titleElem.textContent = galleryData.title;
    }

    const descElem = document.getElementById('product-summary-desc');
    if (descElem && galleryData.description) {
      descElem.innerHTML = galleryData.description;
    }

    const mainImg = document.getElementById('main-product-img');
    if (mainImg) {
      mainImg.src = window.getShopifyAsset ? window.getShopifyAsset(galleryData.main) : galleryData.main;
      mainImg.style.animation = 'fadeIn 0.4s ease';
    }

    const badge = document.getElementById('product-material-badge');
    if (badge) {
      badge.textContent = galleryData.badge;
    }

    const dotsContainer = document.getElementById('gallery-dots-container');
    if (dotsContainer && galleryData.thumbs) {
      dotsContainer.innerHTML = galleryData.thumbs.map((item, index) => {
        const thumbUrl = (typeof window.getShopifyAsset === 'function') ? window.getShopifyAsset(item.src) : item.src;
        return `
          <div class="sticker-gallery-thumb-btn ${index === 0 ? 'active' : ''}"
               title="${item.label}"
               onclick="changeMainImageIndex(${index})"
               style="width: 64px; height: 64px; border-radius: 12px; border: 2px solid ${index === 0 ? '#00b894' : '#e2e8f0'}; overflow: hidden; cursor: pointer; background: #ffffff; transition: all 0.2s ease; ${index === 0 ? 'box-shadow: 0 0 0 2px rgba(0, 184, 148, 0.3);' : ''}">
            <img src="${thumbUrl}" alt="${item.label}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
          </div>
        `;
      }).join('');
    }
    startGalleryAutoplay();
    updateCustomSize();
    recalculateStickerPrice();
  }

  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
  showToast(`Selected Material: ${finishKey}`);
};


window.selectUvSheet = function (sheetType, elem) {
  document.querySelectorAll('#uvdtf-sheets-grid .shape-btn').forEach(b => b.classList.remove('active'));
  if (elem) elem.classList.add('active');
  stickerState.uvSheetSize = sheetType;
  updateCustomSize();
  recalculateStickerPrice();
  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
  showToast(`Selected UV DTF Sheet: ${sheetType}`);
};

window.selectSheetQty = function (sheetCount, elem) {
  const count = parseInt(sheetCount, 10) || 1;
  stickerState.sheets = count;

  document.querySelectorAll('.sheet-qty-btn').forEach(b => b.classList.remove('active'));
  if (elem) {
    elem.classList.add('active');
  } else {
    const matchingBtn = document.querySelector(`.sheet-qty-btn[data-sheets="${count}"]`);
    if (matchingBtn) matchingBtn.classList.add('active');
  }

  const manualInput = document.getElementById('manual-sheets-input');
  if (manualInput) manualInput.value = count;

  recalculateStickerPrice();
  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
  showToast(`Selected ${count} Sheet${count > 1 ? 's' : ''}`);
};

window.updateManualSheets = function (val) {
  const count = Math.max(1, parseInt(val, 10) || 1);
  stickerState.sheets = count;

  document.querySelectorAll('.sheet-qty-btn').forEach(b => {
    const bSheets = parseInt(b.dataset.sheets || '0', 10);
    if (bSheets === count) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  recalculateStickerPrice();
  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
};

window.recalculateStickerPrice = function () {
  const sheets = stickerState.sheets || 1;
  const finish = stickerState.finish || 'Vinyl';
  const uvSheetSize = stickerState.uvSheetSize || 'A3';

  let perSheetPrice = 130;

  const finishLower = finish.toLowerCase();
  const isUvDtf = finishLower.includes('uv dtf');
  const isTransparent = finishLower.includes('transparent');
  const isStandard = finishLower.includes('standard') || finishLower.includes('paper');

  if (isUvDtf) {
    if (uvSheetSize === 'A4') {
      if (sheets >= 100) perSheetPrice = 180;
      else if (sheets >= 50) perSheetPrice = 185;
      else if (sheets >= 25) perSheetPrice = 195;
      else if (sheets >= 10) perSheetPrice = 245;
      else if (sheets >= 5) perSheetPrice = 299;
      else perSheetPrice = 399;
    } else { // A3
      if (sheets >= 100) perSheetPrice = 360;
      else if (sheets >= 50) perSheetPrice = 370;
      else if (sheets >= 25) perSheetPrice = 380;
      else if (sheets >= 10) perSheetPrice = 510;
      else if (sheets >= 5) perSheetPrice = 525;
      else perSheetPrice = 579;
    }
  } else if (isStandard) {
    if (sheets >= 100) perSheetPrice = 77;
    else if (sheets >= 50) perSheetPrice = 80;
    else if (sheets >= 25) perSheetPrice = 84;
    else if (sheets >= 10) perSheetPrice = 88;
    else if (sheets >= 5) perSheetPrice = 93;
    else perSheetPrice = 100;
  } else {
    // Transparent or Vinyl (Both follow 130, 110, 93, 92, 91, 88)
    if (sheets >= 100) perSheetPrice = 88;
    else if (sheets >= 50) perSheetPrice = 91;
    else if (sheets >= 25) perSheetPrice = 92;
    else if (sheets >= 10) perSheetPrice = 93;
    else if (sheets >= 5) perSheetPrice = 110;
    else perSheetPrice = 130;
  }

  const totalPrice = sheets * perSheetPrice;
  stickerState.perSheetRate = perSheetPrice;
  stickerState.totalPrice = totalPrice;

  // Update UI Displays
  const totalPriceElem = document.getElementById('calc-total-price');
  if (totalPriceElem) {
    totalPriceElem.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
  }

  const unitPriceElem = document.getElementById('calc-unit-price');
  if (unitPriceElem) {
    unitPriceElem.textContent = `₹${perSheetPrice}/sheet • Total: ${sheets} Sheet${sheets > 1 ? 's' : ''}`;
  }

  const addToCartBtn = document.getElementById('btn-add-custom-cart');
  if (addToCartBtn) {
    addToCartBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add ${sheets} Sheet${sheets > 1 ? 's' : ''} to Cart — ₹${totalPrice.toLocaleString('en-IN')}`;
    addToCartBtn.style.background = 'var(--primary-teal)';
  }

  // Update manual total stickers tag
  const manualTotalTag = document.getElementById('manual-sheets-total-stickers');
  const countPerSheetElem = document.getElementById('calc-stickers-per-sheet');
  if (manualTotalTag && countPerSheetElem) {
    const perSheet = parseInt(countPerSheetElem.textContent) || 17;
    const totalStickers = (sheets * perSheet).toLocaleString();
    manualTotalTag.textContent = `Total: ${totalStickers} Stickers (${sheets} Sheets)`;
  }

  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
};

window.setQuickSize = function (l, w) {
  const lInput = document.getElementById('sticker-length-input');
  const wInput = document.getElementById('sticker-width-input') || document.getElementById('sticker-breadth-input');

  if (stickerState.shape === 'Square') {
    w = l;
  }

  const isUvDtf = stickerState.finish && String(stickerState.finish).toLowerCase().includes('uv dtf');
  const isA4 = isUvDtf && stickerState.uvSheetSize === 'A4';
  const maxLen = isA4 ? 10 : 16;
  const maxWid = isA4 ? 7 : 10;

  const validL = Math.min(maxLen, Math.max(0.5, parseFloat(l) || 1));
  const validW = Math.min(maxWid, Math.max(0.5, parseFloat(w) || 1));

  if (lInput) lInput.value = validL;
  if (wInput) wInput.value = (stickerState.shape === 'Square') ? validL : validW;
  updateCustomSize();
  recalculateStickerPrice();
};

window.updateCustomSize = function () {
  const lInput = document.getElementById('sticker-length-input');
  const wInput = document.getElementById('sticker-width-input') || document.getElementById('sticker-breadth-input');
  const lockIndicator = document.getElementById('square-locked-indicator');

  const isUvDtf = stickerState.finish && String(stickerState.finish).toLowerCase().includes('uv dtf');
  const isA4 = isUvDtf && stickerState.uvSheetSize === 'A4';
  const maxLen = isA4 ? 10 : 16;
  const maxWid = isA4 ? 7 : 10;

  const isSquare = (stickerState.shape === 'Square');

  if (isSquare) {
    const squareMax = Math.min(maxLen, maxWid);
    if (lInput) {
      lInput.setAttribute('max', squareMax);
      let curLen = parseFloat(lInput.value) || 1;
      if (curLen > squareMax) {
        curLen = squareMax;
        lInput.value = squareMax;
      }
    }
    if (wInput && lInput) {
      wInput.value = lInput.value;
      wInput.readOnly = true;
      wInput.style.backgroundColor = '#f1f5f9';
      wInput.style.cursor = 'not-allowed';
      wInput.style.color = '#64748b';
      wInput.style.borderColor = '#cbd5e1';
      wInput.setAttribute('title', 'Width is automatically locked to Length for Square shape');
    }
    if (lockIndicator) {
      lockIndicator.style.display = 'inline-flex';
    }
  } else {
    if (lInput) {
      lInput.setAttribute('max', maxLen);
    }
    if (wInput) {
      wInput.setAttribute('max', maxWid);
      wInput.readOnly = false;
      wInput.style.backgroundColor = '';
      wInput.style.cursor = '';
      wInput.style.color = '';
      wInput.style.borderColor = '';
      wInput.removeAttribute('title');
    }
    if (lockIndicator) {
      lockIndicator.style.display = 'none';
    }
  }

  let len = lInput ? (parseFloat(lInput.value) || 1) : 3;
  let brd = wInput ? (parseFloat(wInput.value) || 1) : 3;

  if (isSquare) {
    brd = len;
    if (wInput) wInput.value = len;
  } else {
    if (lInput && len > maxLen) {
      len = maxLen;
      lInput.value = maxLen;
    }
    if (wInput && brd > maxWid) {
      brd = maxWid;
      wInput.value = maxWid;
    }
  }

  const sizeLabelSpan = document.getElementById('size-max-hint-span');
  if (sizeLabelSpan) {
    if (isSquare) {
      const squareMax = Math.min(maxLen, maxWid);
      sizeLabelSpan.textContent = `(Square: Max ${squareMax}" Length × ${squareMax}" Width)`;
    } else {
      sizeLabelSpan.textContent = isA4 ? '(Max 10" Length × Max 7" Width for A4)' : '(Max 16" Length × Max 10" Width)';
    }
  }

  stickerState.size = `${len}" x ${brd}"`;

  // Dynamic Live Aspect Ratio calculation for Die-Cut Object
  const dieCut = document.getElementById('sticker-die-cut-object');
  if (dieCut) {
    let ratio = len / brd;
    if (stickerState.shape === 'Square') {
      ratio = 1.0;
    } else if (stickerState.shape === 'Rectangle' && ratio === 1) {
      ratio = 1.6;
    }

    if (ratio >= 1) {
      const w = Math.min(94, Math.max(55, 75 * Math.sqrt(ratio / 1.3)));
      const h = Math.min(85, Math.max(32, w / ratio));
      dieCut.style.width = `${w.toFixed(1)}%`;
      dieCut.style.height = `${h.toFixed(1)}%`;
    } else {
      const h = Math.min(85, Math.max(55, 75 * Math.sqrt(1.3 / ratio)));
      const w = Math.min(94, Math.max(32, h * ratio));
      dieCut.style.width = `${w.toFixed(1)}%`;
      dieCut.style.height = `${h.toFixed(1)}%`;
    }
  }

  // Update Live Dimension Guides on Canvas Box
  const topLabel = document.getElementById('dimension-top-label');
  const leftLabel = document.getElementById('dimension-left-label');
  if (topLabel) {
    topLabel.textContent = `${len.toFixed(1)}"`;
    topLabel.classList.remove('pulse-scale');
    void topLabel.offsetWidth;
    topLabel.classList.add('pulse-scale');
  }
  if (leftLabel) {
    leftLabel.textContent = `${brd.toFixed(1)}"`;
    leftLabel.classList.remove('pulse-scale');
    void leftLabel.offsetWidth;
    leftLabel.classList.add('pulse-scale');
  }

  let sheetWidth = 10;
  let sheetHeight = 16;
  let sheetLabel = 'Sheet Size: 10" x 16" (160 sq in)';

  if (isUvDtf) {
    if (stickerState.uvSheetSize === 'A4') {
      sheetWidth = 7;
      sheetHeight = 10;
      sheetLabel = 'Sheet Size: A4 7" x 10" (70 sq in)';
    } else {
      sheetWidth = 10;
      sheetHeight = 16;
      sheetLabel = 'Sheet Size: A3 10" x 16" (160 sq in)';
    }
  }

  const sheetArea = sheetWidth * sheetHeight;
  const stickerArea = len * brd;
  const countPerSheet = stickerArea > 0 ? Math.floor(sheetArea / stickerArea) : 0;

  const countElem = document.getElementById('calc-stickers-per-sheet');
  if (countElem) {
    countElem.textContent = `${countPerSheet} Stickers per Sheet`;
  }

  // Update total stickers count tags in quantity sheet buttons
  document.querySelectorAll('.total-stickers-tag').forEach(tag => {
    const sCount = parseInt(tag.dataset.sheets || '1', 10);
    const totalStickers = (sCount * countPerSheet).toLocaleString();
    tag.textContent = `${totalStickers} Stickers`;
  });

  document.querySelectorAll('.size-preset-chip').forEach(chip => {
    const text = `${len}"x${brd}"`;
    if (chip.textContent.trim() === text) chip.classList.add('active');
    else chip.classList.remove('active');
  });
};

window.generatePdfPreviewDataUrl = function (fileName) {
  const raw = (fileName || 'Document.pdf').replace(/^.*[\\\/]/, '');
  const cleanName = raw.length > 20 ? (raw.substring(0, 17) + '...') : raw;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
    <rect width="320" height="320" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
    <rect x="70" y="40" width="180" height="230" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
    <path d="M200 40 L250 90 L200 90 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>
    <rect x="95" y="115" width="130" height="48" rx="8" fill="#e11d48"/>
    <text x="160" y="148" fill="#ffffff" font-size="24" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" text-anchor="middle" letter-spacing="2">PDF</text>
    <text x="160" y="200" fill="#0f172a" font-size="13" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" text-anchor="middle">${cleanName}</text>
    <text x="160" y="228" fill="#059669" font-size="11" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" text-anchor="middle">✓ PRINT READY DOCUMENT</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

window.handleFileUpload = function (input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    stickerState.artworkFile = file.name;
    stickerState.rawFile = file;

    // Trigger CDN upload in background
    if (typeof window.uploadArtworkToShopifyCDN === 'function') {
      window.uploadArtworkToShopifyCDN(file, 'sticker');
    }

    const onFileReady = function (dataUrl) {
      stickerState.artworkDataUrl = dataUrl;
      stickerState.artworkApproved = false;

      const chk = document.getElementById('chk-artwork-approval');
      if (chk) chk.checked = false;

      // Update Canvas Image
      const artImg = document.getElementById('sticker-artwork-img');
      if (artImg) {
        artImg.src = dataUrl;
        artImg.style.animation = 'none';
        void artImg.offsetWidth;
        artImg.style.animation = 'fadeIn 0.4s ease';
      }

      // Update Artwork Thumbnail Card
      const thumb = document.getElementById('artwork-thumb-preview');
      if (thumb) thumb.src = dataUrl;

      const fileNameElem = document.getElementById('artwork-file-name');
      if (fileNameElem) fileNameElem.textContent = file.name;

      const card = document.getElementById('uploaded-artwork-card');
      if (card) card.style.display = 'block';

      // Trigger Morph Pop Animation
      const dieCut = document.getElementById('sticker-die-cut-object');
      if (dieCut) {
        dieCut.classList.remove('morph-pop');
        void dieCut.offsetWidth;
        dieCut.classList.add('morph-pop');
      }

      if (typeof window.updateStickerAddBtnState === 'function') {
        window.updateStickerAddBtnState();
      }
      showToast(`Artwork "${file.name}" loaded onto live sticker!`);
    };

    if (isPdf) {
      onFileReady(window.generatePdfPreviewDataUrl(file.name));
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        onFileReady(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
};

window.updateArtworkScale = function (val) {
  const scale = parseInt(val, 10) || 100;
  stickerState.artworkScale = scale;

  const percentElem = document.getElementById('artwork-scale-percent');
  if (percentElem) percentElem.textContent = `${scale}%`;

  const artImg = document.getElementById('sticker-artwork-img');
  if (artImg) {
    artImg.style.transform = `scale(${scale / 100})`;
  }
};

window.removeUploadedArtwork = function () {
  stickerState.artworkFile = null;
  stickerState.artworkDataUrl = null;
  stickerState.artworkScale = 100;
  stickerState.artworkApproved = false;

  const chk = document.getElementById('chk-artwork-approval');
  if (chk) chk.checked = false;

  const card = document.getElementById('uploaded-artwork-card');
  if (card) card.style.display = 'none';

  const fileInput = document.getElementById('artwork-input');
  if (fileInput) fileInput.value = '';

  const artImg = document.getElementById('sticker-artwork-img');
  if (artImg) {
    artImg.src = 'assets/elementa-logo.png';
    artImg.style.transform = 'scale(1)';
  }

  if (typeof window.updateStickerAddBtnState === 'function') {
    window.updateStickerAddBtnState();
  }
  showToast('Uploaded artwork removed');
};

window.addStickerToCart = function () {
  const missingOptions = [];

  if (!stickerState.finish) {
    missingOptions.push('1. Choose Finish / Material');
  }

  const isUvDtf = stickerState.finish && String(stickerState.finish).toLowerCase().includes('uv dtf');
  if (isUvDtf) {
    if (!stickerState.uvSheetSize) missingOptions.push('2. Sheet Size (A4/A3)');
  } else {
    if (!stickerState.shape) missingOptions.push('2. Shape');
  }

  if (!stickerState.sheets || stickerState.sheets < 1) {
    missingOptions.push('4. Quantity (Sheets)');
  }

  if (!stickerState.artworkFile && !stickerState.artworkDataUrl) {
    missingOptions.push('5. Upload Your Artwork');
  } else if (!stickerState.artworkApproved) {
    missingOptions.push('Design Authorization & Approval Checkbox');
  }

  if (missingOptions.length > 0) {
    const msg = `Please select/upload the following required option${missingOptions.length > 1 ? 's' : ''}: ${missingOptions.join(', ')}`;
    if (window.showToast) window.showToast(msg, 'warning');
    else alert(msg);
    return;
  }

  const totalPrice = stickerState.totalPrice || 0;
  const sheets = stickerState.sheets || 1;
  const shapeOrSheet = isUvDtf ? stickerState.uvSheetSize : stickerState.shape;
  const itemName = `Custom Stickers (${stickerState.finish}, ${shapeOrSheet}, ${stickerState.size || '3" x 3"'}, ${sheets} Sheets)`;

  let finishImg = 'assets/sticker-transparent-main.jpg';
  const finishLower = (stickerState.finish || '').toLowerCase();
  if (finishLower.includes('transparent')) {
    finishImg = 'assets/sticker-transparent-main.jpg';
  } else if (finishLower.includes('vinyl')) {
    finishImg = 'assets/sticker-vinyl-hand-elementa.jpg';
  } else if (finishLower.includes('uv dtf')) {
    finishImg = 'assets/sticker-uvdtf-serum-bottle.jpg';
  } else if (finishLower.includes('standard') || finishLower.includes('paper')) {
    finishImg = 'assets/sticker-paper-redbox.jpg';
  }

  const imgUrl = stickerState.artworkDataUrl || (window.getShopifyAsset ? window.getShopifyAsset(finishImg) : finishImg);

  let selectedStickerVariantId = '67585065123972'; // Default: Vinyl Custom Stickers
  if (isUvDtf || finishLower.includes('uv dtf')) {
    selectedStickerVariantId = '67585065058436'; // UV DTF Custom Stickers
  } else if (finishLower.includes('transparent')) {
    selectedStickerVariantId = '67686638256260'; // Transparent Custom Stickers
  } else if (finishLower.includes('vinyl') || finishLower.includes('die cut')) {
    selectedStickerVariantId = '67585065123972'; // Vinyl Custom Stickers
  } else {
    selectedStickerVariantId = '67585065189508'; // Standard Paper Custom Stickers
  }

  const fileObj = stickerState.artworkFile || stickerState.rawFile;
  const artIdentifier = (fileObj && fileObj.name)
    ? (fileObj.name + '_' + (fileObj.size || ''))
    : (typeof fileObj === 'string' && fileObj.length < 100
      ? fileObj
      : (stickerState.artworkCdnUrl ? stickerState.artworkCdnUrl.split('/').pop().split('?')[0] : 'design'));

  const rawConfigParts = [
    stickerState.finish || '',
    shapeOrSheet || '',
    stickerState.size || '3x3',
    sheets || 1,
    artIdentifier
  ].join('_').toLowerCase().replace(/[^a-z0-9_-]/g, '_').substring(0, 80);

  const stickerConfigKey = 'stk_' + rawConfigParts;

  handleAddToCart({
    id: stickerConfigKey,
    mappedVariantId: selectedStickerVariantId,
    name: itemName,
    price: `₹${totalPrice.toLocaleString('en-IN')}`,
    img: imgUrl,
    quantity: 1,
    properties: {
      'Finish / Material': stickerState.finish,
      'Shape / Sheet Size': shapeOrSheet,
      'Size': stickerState.size || '3" x 3"',
      'Quantity': `${sheets} Sheet(s)`,
      'Unit Rate': `₹${stickerState.perSheetRate || 0}/sheet`,
      'Unit Price': `₹${totalPrice.toLocaleString('en-IN')}`,
      'Total Price': `₹${totalPrice.toLocaleString('en-IN')}`,
      'Price': `₹${totalPrice.toLocaleString('en-IN')}`,
      'Uploaded Artwork': stickerState.artworkCdnUrl || stickerState.rawFile || stickerState.artworkFile || 'Attached',
      'Design Authorization': 'Reviewed & Approved by Customer',
      '_cartId': stickerConfigKey
    }
  });
};

/* --------------------------------------------------------------------------
   6. Ultra-Attractive Animation Controllers (3D Tilt, Scroll Reveal, Sales Ticker)
   -------------------------------------------------------------------------- */

// 6.1 Scroll Reveal Observer
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  elements.forEach(el => el.classList.add('is-visible'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

// 6.2 3D Card Perspective Physics Tilt Effect
function init3DTiltEffects() {
  const tiltCards = document.querySelectorAll('.tilt-card, .product-card, .inbuilt-product-card, .spec-card-box');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   Custom T-Shirts Studio Page Logic
   ========================================================================== */

const tshirtMaterialGalleryMap = {
  'Default': {
    title: 'Custom T-Shirt',
    description: `<strong>Custom T-Shirts for Every Style, Brand, and Event</strong><br>Bring your apparel ideas to life with high-quality custom printed t-shirts made for personal wear, team uniforms, brand merch, and events. Choose your fabric, printing method, size, and color, upload your design, and let us handle the rest.`,
    main: 'assets/tshirt-main-dtg.jpg',
    badge: 'CUSTOM T-SHIRT',
    thumbs: [
      { src: 'assets/tshirt-main-dtg.jpg', label: 'DTG Print' },
      { src: 'assets/tshirt-screen-print.jpg', label: 'Screen Print' },
      { src: 'assets/tshirt-hoodie-embroidery.jpg', label: 'Embroidered Hoodie' },
      { src: 'assets/tshirt-polo-shirt.jpg', label: 'Embroidered Polo' }
    ]
  },
  'DTG': {
    title: 'Direct to Garment (DTG) T-Shirts',
    description: `High-definition photo realistic print quality directly onto 100% combed organic cotton. Unlimited color gradients with zero setup fee. Ideal for complex designs, artwork, and small batch orders.`,
    main: 'assets/tshirt-main-dtg.jpg',
    badge: 'DTG PRINTING',
    thumbs: [
      { src: 'assets/tshirt-main-dtg.jpg', label: 'DTG Full Graphic' },
      { src: 'assets/tshirt-screen-print.jpg', label: 'Vintage Black Tee' },
      { src: 'assets/tshirt-polo-shirt.jpg', label: 'White Polo' },
      { src: 'assets/tshirt-hoodie-embroidery.jpg', label: 'Navy Hoodie' }
    ]
  },
  'Screen Printing': {
    title: 'Custom Screen Printed T-Shirts',
    description: `Vibrant, long-lasting plastisol and discharge inks. Maximum durability that withstands 100+ machine washes. Best value for bulk orders, team uniforms, and merchandise lines.`,
    main: 'assets/tshirt-screen-print.jpg',
    badge: 'SCREEN PRINTING',
    thumbs: [
      { src: 'assets/tshirt-screen-print.jpg', label: 'Screen Print Graphic' },
      { src: 'assets/tshirt-main-dtg.jpg', label: 'DTG Organic Tee' },
      { src: 'assets/tshirt-polo-shirt.jpg', label: 'White Polo' },
      { src: 'assets/tshirt-hoodie-embroidery.jpg', label: 'Navy Hoodie' }
    ]
  },
  'Embroidery': {
    title: 'Custom Embroidered Hoodies & Polos',
    description: `Premium 3D stitched thread embroidery for corporate branding, logos, and premium fleece hoodies. Provides an executive, elegant feel that never fades or peels.`,
    main: 'assets/tshirt-hoodie-embroidery.jpg',
    badge: 'EMBROIDERY',
    thumbs: [
      { src: 'assets/tshirt-hoodie-embroidery.jpg', label: 'Navy Hoodie Crest' },
      { src: 'assets/tshirt-polo-shirt.jpg', label: 'White Polo Badge' },
      { src: 'assets/tshirt-main-dtg.jpg', label: 'DTG Graphic Tee' },
      { src: 'assets/tshirt-screen-print.jpg', label: 'Screen Print Tee' }
    ]
  },
  'Sublimation': {
    title: 'Full Color Sublimation Shirts',
    description: `All-over seam-to-seam dye sublimation on moisture-wicking performance polyester. Zero weight, breathable, and permanently fused colors for sportswear and jerseys.`,
    main: 'assets/tshirt-polo-shirt.jpg',
    badge: 'SUBLIMATION',
    thumbs: [
      { src: 'assets/tshirt-polo-shirt.jpg', label: 'Sublimated Polo' },
      { src: 'assets/tshirt-main-dtg.jpg', label: 'DTG Graphic Tee' },
      { src: 'assets/tshirt-screen-print.jpg', label: 'Screen Print' },
      { src: 'assets/tshirt-hoodie-embroidery.jpg', label: 'Navy Hoodie' }
    ]
  }
};

let tshirtState = {
  logoCount: 0,
  reviewCount: 0, // Initial review count is 0 -> Hide reviews star element per user requirement
  ratingScore: 4.3,
  finish: 'DTG',
  fit: 'Polo T Shirts',
  color: 'Black',
  colorHex: '#18181b',
  placement: 'Front Center',
  hasBackPrint: false,
  specialInstructions: '',
  targetQty: 2,
  sizeDistribution: {
    'S': 0,
    'M': 0,
    'L': 0,
    'XL': 0,
    'XXL': 0
  },
  artworkFile: null,
  artworkDataUrl: null,
  artworkScale: 100,
  customText: '',
  roundNeckFrontMode: '4x4',
  unitPrice: 0,
  totalPrice: 0,
  viewMode: 'lifestyle'
};

let currentTshirtThumbs = tshirtMaterialGalleryMap['Default'].thumbs;
let currentTshirtImgIndex = 0;

window.toggleTshirtBackPrint = function (enabled) {
  tshirtState.hasBackPrint = !!enabled;
  const toggleCheckbox = document.getElementById('tshirt-back-print-toggle');
  if (toggleCheckbox) toggleCheckbox.checked = tshirtState.hasBackPrint;

  if (tshirtState.hasBackPrint) {
    if (typeof window.setTshirtLogoCount === 'function') {
      window.setTshirtLogoCount(2, document.getElementById('btn-logo-count-2'));
    }
  } else {
    // If back print is turned OFF, clear back logo and force 1 logo (Front only)
    tshirtState.artworkDataUrl2 = null;
    tshirtState.artworkFile2 = null;
    const logoImg2 = document.getElementById('tshirt-canvas-logo-img-2');
    if (logoImg2) { logoImg2.style.display = 'none'; logoImg2.src = ''; }
    const row2 = document.getElementById('artwork-info-row-2');
    if (row2) row2.style.display = 'none';
    const container2 = document.getElementById('tshirt-draggable-logo-container-2');
    if (container2) container2.style.display = 'none';
    const input2 = document.getElementById('tshirt-file-input-2');
    if (input2) input2.value = '';

    if (typeof window.setTshirtLogoCount === 'function') {
      window.setTshirtLogoCount(1, document.getElementById('btn-logo-count-1'));
    }
  }

  if (typeof window.recalculateTshirtPrice === 'function') {
    window.recalculateTshirtPrice();
  }
};

window.selectDiscountTier = function (minQty, maxQty) {
  const fitClean = (tshirtState.fit || '').toLowerCase();
  const isOversized = fitClean.includes('oversiz');
  const minimumAllowed = isOversized ? 1 : 2;

  let min = Math.max(minimumAllowed, parseInt(minQty, 10) || minimumAllowed);

  tshirtState.targetQty = min;
  window.isUserModifyingSizes = false;

  // Reset size distribution so sizes remain 0 for manual user entry
  window.autoAllocateSizesForQty(min);

  // Sync Custom Quantity Input field
  const customInput = document.getElementById('elementa-custom-total-qty-input');
  if (customInput) {
    customInput.value = min;
    customInput.focus();
  }

  if (typeof window.updateSizeAllocationUI === 'function') {
    window.updateSizeAllocationUI();
  }
  if (typeof window.recalculateTshirtPrice === 'function') {
    window.recalculateTshirtPrice();
  }
  showToast(`Selected ${min} Pcs tier. You can adjust exact quantity in the Custom Order Quantity box below.`);
};

window.onCustomTotalQtyChange = function (val) {
  let qty = parseInt(val, 10);
  const fitClean = (tshirtState.fit || '').toLowerCase();
  const isOversized = fitClean.includes('oversiz');
  const minQty = isOversized ? 1 : 2;

  if (isNaN(qty) || qty < minQty) {
    qty = minQty;
  }

  tshirtState.targetQty = qty;
  window.isUserModifyingSizes = false;

  if (typeof window.updateSizeAllocationUI === 'function') {
    window.updateSizeAllocationUI();
  }
  if (typeof window.recalculateTshirtPrice === 'function') {
    window.recalculateTshirtPrice();
  }
};

window.adjustCustomTotalQuantity = function (delta) {
  const fitClean = (tshirtState.fit || '').toLowerCase();
  const isOversized = fitClean.includes('oversiz');
  const minQty = isOversized ? 1 : 2;

  let current = tshirtState.targetQty || minQty;
  let newQty = current + delta;
  if (newQty < minQty) newQty = minQty;

  const customInput = document.getElementById('elementa-custom-total-qty-input');
  if (customInput) customInput.value = newQty;

  window.onCustomTotalQtyChange(newQty);
};

window.addNudgeQuantity = function () {
  const nudgeBtn = document.getElementById('tshirt-nudge-btn');
  const delta = nudgeBtn ? (parseInt(nudgeBtn.getAttribute('data-delta'), 10) || 1) : 1;

  const fitClean = (tshirtState.fit || '').toLowerCase();
  const isOversized = fitClean.includes('oversiz');
  const minimumAllowed = isOversized ? 1 : 2;

  let current = tshirtState.targetQty || minimumAllowed;
  let newQty = current + delta;

  tshirtState.targetQty = newQty;
  window.autoAllocateSizesForQty(newQty);

  if (typeof window.updateSizeAllocationUI === 'function') {
    window.updateSizeAllocationUI();
  }
  if (typeof window.recalculateTshirtPrice === 'function') {
    window.recalculateTshirtPrice();
  }
  showToast(`Added ${delta} more piece${delta > 1 ? 's' : ''}! New total: ${newQty} Pcs`);
};

window.toggleDiscountTableModal = function () {
  const table = document.getElementById('elementa-discount-table-expand');
  if (table) {
    const isHidden = table.style.display === 'none' || table.style.display === '';
    table.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

window.autoAllocateSizesForQty = function (qty) {
  const fitClean = (tshirtState.fit || '').toLowerCase();
  const isOversized = fitClean.includes('oversiz');
  const sizes = isOversized ? ['S', 'M', 'L', 'XL'] : ['S', 'M', 'L', 'XL', 'XXL'];

  // Reset sizes to 0 so users enter sizes manually
  sizes.forEach(s => tshirtState.sizeDistribution[s] = 0);
  if (isOversized) tshirtState.sizeDistribution['XXL'] = 0;
};

window.updateSpecialInstructions = function (textVal) {
  tshirtState.specialInstructions = String(textVal || '').trim();
};

window.selectTshirtQuantityPreset = function (targetCount, elem) {
  document.querySelectorAll('#custom-mode-view .tshirt-qty-chips-flex .qty-chip-btn').forEach(b => b.classList.remove('active'));
  if (elem) elem.classList.add('active');

  tshirtState.targetQty = targetCount;
  window.autoAllocateSizesForQty(targetCount);

  updateSizeAllocationUI();
  recalculateTshirtPrice();
};

window.activateCustomQtyInput = function (chipElem) {
  document.querySelectorAll('#custom-mode-view .tshirt-qty-chips-flex .qty-chip-btn').forEach(b => b.classList.remove('active'));
  if (chipElem) chipElem.classList.add('active');

  const customBox = document.getElementById('custom-qty-input-box');
  const customInput = document.getElementById('tshirt-custom-qty-input');
  if (customBox) customBox.style.display = 'inline-flex';
  if (customInput) {
    customInput.focus();
    if (customInput.value) {
      handleCustomTshirtQtyInput(customInput.value);
    }
  }
};

window.handleCustomTshirtQtyInput = function (val) {
  let qty = parseInt(val, 10);
  const isOversized = tshirtState && (tshirtState.fit === 'Oversized T-Shirts' || tshirtState.fit === 'Oversized');
  const minQty = isOversized ? 1 : 2;

  if (isNaN(qty) || qty < minQty) {
    qty = minQty;
  }

  tshirtState.targetQty = qty;
  window.autoAllocateSizesForQty(qty);

  updateSizeAllocationUI();
  recalculateTshirtPrice();
};

window.applyTshirtSizePreset = function (targetCount) {
  selectTshirtQuantityPreset(targetCount, null);
};

window.isUserModifyingSizes = false;

window.toggleModifySizes = function (enable) {
  window.isUserModifyingSizes = !!enable;
  if (typeof window.updateSizeAllocationUI === 'function') {
    window.updateSizeAllocationUI();
  }
};

window.adjustSizeQty = function (sizeKey, delta) {
  const currentVal = tshirtState.sizeDistribution[sizeKey] || 0;
  if (delta < 0) {
    tshirtState.sizeDistribution[sizeKey] = Math.max(0, currentVal - 1);
  } else if (delta > 0) {
    tshirtState.sizeDistribution[sizeKey] = currentVal + 1;
  }

  updateSizeAllocationUI();
  recalculateTshirtPrice();
};

window.directInputSizeQty = function (sizeKey, val) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 0) num = 0;
  tshirtState.sizeDistribution[sizeKey] = num;

  updateSizeAllocationUI();
  recalculateTshirtPrice();
};

window.updateSizeAllocationUI = function () {
  const isOversized = (tshirtState.fit || '').toLowerCase().includes('oversiz');

  // Hide XXL size card if Oversized T-Shirts is active
  const xxlCard = document.getElementById('size-card-XXL');
  if (xxlCard) {
    if (isOversized) {
      xxlCard.style.display = 'none';
      if (tshirtState && tshirtState.sizeDistribution) {
        tshirtState.sizeDistribution['XXL'] = 0;
      }
    } else {
      xxlCard.style.display = 'flex';
    }
  }

  const totalAllocated = Object.keys(tshirtState.sizeDistribution).reduce((sum, key) => {
    if (isOversized && key === 'XXL') return sum;
    return sum + (tshirtState.sizeDistribution[key] || 0);
  }, 0);
  const target = tshirtState.targetQty || (isOversized ? 1 : 2);

  // 1. Sync size input fields & card active styles
  Object.keys(tshirtState.sizeDistribution).forEach(key => {
    const inputElem = document.getElementById(`size-qty-input-${key}`);
    if (inputElem) {
      if (inputElem.tagName === 'INPUT') {
        inputElem.value = tshirtState.sizeDistribution[key];
      } else {
        inputElem.textContent = tshirtState.sizeDistribution[key];
      }
      const card = document.getElementById(`size-card-${key}`);
      if (card) {
        if (tshirtState.sizeDistribution[key] > 0) card.classList.add('has-qty');
        else card.classList.remove('has-qty');
      }
    }
  });

  // 2. Fetch DOM elements for expandable size section
  const summaryBar = document.getElementById('elementa-size-summary-bar');
  const inputsBox = document.getElementById('elementa-size-inputs-box');
  const countElem = document.getElementById('allocated-size-count');
  const hintElem = document.getElementById('size-alloc-hint');
  const doneBtn = document.getElementById('btn-done-modify-sizes');
  const summaryTitle = document.getElementById('elementa-size-summary-title');
  const summaryDetails = document.getElementById('elementa-size-summary-details');

  // Build readable size allocation details (e.g., S: 1, M: 2, L: 2)
  const sizeParts = [];
  Object.keys(tshirtState.sizeDistribution).forEach(key => {
    if (isOversized && key === 'XXL') return;
    const cnt = tshirtState.sizeDistribution[key] || 0;
    if (cnt > 0) sizeParts.push(`${key}: ${cnt}`);
  });
  const detailsText = sizeParts.length > 0 ? sizeParts.join(', ') : 'None selected';

  if (summaryTitle) summaryTitle.textContent = `Sizes Allocated (${totalAllocated}/${target} Pcs)`;
  if (summaryDetails) summaryDetails.textContent = detailsText;

  // 3. Dynamic Auto-Collapse / Expand & Messaging Logic
  if (totalAllocated === target && target > 0) {
    if (!window.isUserModifyingSizes) {
      // Complete & not manually editing -> Auto-hide input cards, show compact summary bar
      if (summaryBar) summaryBar.style.display = 'flex';
      if (inputsBox) inputsBox.style.display = 'none';
    } else {
      // User clicked "Modify Sizes" -> Keep input cards open with Done button
      if (summaryBar) summaryBar.style.display = 'none';
      if (inputsBox) inputsBox.style.display = 'block';
      if (doneBtn) doneBtn.style.display = 'inline-block';
      if (countElem) {
        countElem.textContent = `${totalAllocated}/${target} Selected`;
        countElem.style.color = '#15803d';
      }
      if (hintElem) {
        hintElem.textContent = '✓ Size allocation complete! Click "Done" to finish.';
        hintElem.style.color = '#15803d';
      }
    }
  } else {
    // Allocation incomplete or exceeded -> Reset modify flag, open input cards, hide summary bar
    window.isUserModifyingSizes = false;
    if (summaryBar) summaryBar.style.display = 'none';
    if (inputsBox) inputsBox.style.display = 'block';
    if (doneBtn) doneBtn.style.display = 'none';

    if (countElem) {
      if (totalAllocated < target) {
        countElem.textContent = `${totalAllocated}/${target} Selected`;
        countElem.style.color = '#dc2626';
        if (hintElem) {
          const rem = target - totalAllocated;
          hintElem.textContent = `(Select remaining ${rem} pc${rem > 1 ? 's' : ''} across sizes below)`;
          hintElem.style.color = '#0284c7';
        }
      } else {
        // totalAllocated > target (Exceeded!)
        countElem.textContent = `${totalAllocated}/${target} Selected (Exceeded!)`;
        countElem.style.color = '#dc2626';
        if (hintElem) {
          const excess = totalAllocated - target;
          hintElem.textContent = `⚠️ Allocated sizes (${totalAllocated} pcs) exceed total quantity (${target} pcs). Please decrease sizes by ${excess} pc${excess > 1 ? 's' : ''}.`;
          hintElem.style.color = '#dc2626';
        }
      }
    }
  }

  if (typeof window.toggleTshirtAddToCartState === 'function') {
    window.toggleTshirtAddToCartState();
  }
};

window.updateTshirtReviewsDisplay = function () {
  const container = document.getElementById('tshirt-reviews-container');
  if (!container) return;
  if (tshirtState.reviewCount > 0) {
    container.style.display = 'flex';
    const numElem = document.getElementById('tshirt-review-num');
    if (numElem) numElem.textContent = tshirtState.reviewCount;
    const scoreElem = document.getElementById('tshirt-rating-score');
    if (scoreElem) scoreElem.textContent = tshirtState.ratingScore;
  } else {
    container.style.display = 'none';
  }
};

window.switchTshirtGalleryViewMode = function (mode) {
  const canvasView = document.getElementById('tshirt-canvas-view');
  const lifestyleView = document.getElementById('tshirt-lifestyle-view');
  const btnCanvas = document.getElementById('tshirt-view-btn-canvas');
  const btnLifestyle = document.getElementById('tshirt-view-btn-lifestyle');
  const thumbsContainer = document.getElementById('tshirt-gallery-thumbs-container');

  tshirtState.viewMode = mode;

  if (mode === 'canvas') {
    if (canvasView) canvasView.style.display = 'flex';
    if (lifestyleView) lifestyleView.style.display = 'none';
    if (thumbsContainer) thumbsContainer.style.display = 'none';
    if (btnCanvas) btnCanvas.classList.add('active');
    if (btnLifestyle) btnLifestyle.classList.remove('active');
    if (typeof window.markZoomMirrorDirty === 'function') window.markZoomMirrorDirty();
    if (typeof window.syncCanvasZoomMirror === 'function') window.syncCanvasZoomMirror();
  } else {
    if (canvasView) canvasView.style.display = 'none';
    if (lifestyleView) lifestyleView.style.display = 'block';
    if (thumbsContainer) thumbsContainer.style.display = 'flex';
    if (btnLifestyle) btnLifestyle.classList.add('active');
    if (btnCanvas) btnCanvas.classList.remove('active');
  }
  if (typeof window.syncProductConfigHeight === 'function') setTimeout(window.syncProductConfigHeight, 50);
};

window.switchTshirtPageMode = function (mode) {
  const btnInbuilt = document.getElementById('btn-mode-inbuilt');
  const btnCustom = document.getElementById('btn-mode-custom');
  if (!btnInbuilt && !btnCustom) return;

  const inbuiltView = document.getElementById('inbuilt-mode-view');
  const singleView = document.getElementById('single-product-mode-view');
  const customView = document.getElementById('custom-mode-view');
  const extraSections = document.querySelectorAll('.size-chart-banner-section, .order-process-banner-section, .about-brand-section, .related-products-section');

  if (!inbuiltView || !customView) return;

  const heroBanner = document.querySelector('.stickers-hero-banner');
  if (heroBanner) heroBanner.style.display = 'block';
  extraSections.forEach(sec => sec.style.display = 'block');
  if (singleView) {
    singleView.style.display = 'none';
    singleView.classList.remove('active');
  }

  if (mode === 'custom') {
    inbuiltView.classList.remove('active');
    inbuiltView.style.display = 'none';
    customView.classList.add('active');
    customView.style.display = 'block';
    if (btnInbuilt) {
      btnInbuilt.classList.remove('active');
      btnInbuilt.style.background = 'transparent';
      btnInbuilt.style.color = 'var(--dark-main)';
    }
    if (btnCustom) {
      btnCustom.classList.add('active');
      btnCustom.style.background = '#A8D4B0';
      btnCustom.style.color = '#143d1c';
    }
    window.location.hash = 'custom';
    if (typeof window.syncProductConfigHeight === 'function') {
      setTimeout(window.syncProductConfigHeight, 30);
      setTimeout(window.syncProductConfigHeight, 150);
    }
  } else {
    customView.classList.remove('active');
    customView.style.display = 'none';
    inbuiltView.classList.add('active');
    inbuiltView.style.display = 'block';
    if (btnCustom) {
      btnCustom.classList.remove('active');
      btnCustom.style.background = 'transparent';
      btnCustom.style.color = 'var(--dark-main)';
    }
    if (btnInbuilt) {
      btnInbuilt.classList.add('active');
      btnInbuilt.style.background = '#A8D4B0';
      btnInbuilt.style.color = '#143d1c';
    }
    window.location.hash = 'inbuilt';
  }
};

window.filterTshirtCatalog = function (category, btnElement) {
  document.querySelectorAll('.inbuilt-filter-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const target = (category || 'all').toLowerCase().trim();

  const cards = document.querySelectorAll('#inbuilt-tshirt-catalog-grid .inbuilt-product-card');
  cards.forEach(card => {
    const cardCat = (card.getAttribute('data-category') || '').toLowerCase();
    const cardText = (card.textContent || '').toLowerCase();

    if (target === 'all' || cardCat.includes(target) || cardText.includes(target)) {
      card.style.display = 'flex';
      card.style.animation = 'fadeIn 0.3s ease';
    } else {
      card.style.display = 'none';
    }
  });
};

window.selectInbuiltSize = function (element) {
  const container = element.closest('.inbuilt-pack-selector');
  if (container) {
    container.querySelectorAll('.inbuilt-pack-opt').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
  }
};

window.selectTshirtFinish = function (elem) {
  const finishKey = elem.getAttribute('data-finish') || 'DTG';
  document.querySelectorAll('#custom-mode-view .finish-btn').forEach(b => b.classList.remove('active'));
  elem.classList.add('active');
  tshirtState.finish = finishKey;

  const galleryData = tshirtMaterialGalleryMap[finishKey];
  if (galleryData) {
    currentTshirtThumbs = galleryData.thumbs;
    currentTshirtImgIndex = 0;

    const mainImg = document.getElementById('tshirt-main-product-img');
    if (mainImg) {
      mainImg.src = window.getShopifyAsset ? window.getShopifyAsset(galleryData.main) : galleryData.main;
      mainImg.style.animation = 'fadeIn 0.4s ease';
    }

    const badge = document.getElementById('tshirt-material-badge');
    if (badge) {
      badge.textContent = galleryData.badge;
    }
  }
  recalculateTshirtPrice();
  showToast(`Selected Method: ${finishKey}`);
};

window.selectTshirtFit = function (fitName, elem) {
  const cleanFit = (fitName || '').toString().trim().toLowerCase();

  document.querySelectorAll('.tshirt-fit-sub-btn').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = 'var(--dark-main)';
  });

  if (!elem) {
    if (cleanFit.includes('oversize') || cleanFit.includes('oversized')) {
      elem = document.querySelector('.tshirt-fit-sub-btn[onclick*="Oversized"]');
    } else if (cleanFit.includes('round') || cleanFit.includes('rounded')) {
      elem = document.querySelector('.tshirt-fit-sub-btn[onclick*="Rounded"]');
    } else {
      elem = document.querySelector('.tshirt-fit-sub-btn[onclick*="Polo"]');
    }
  }

  if (elem) {
    elem.classList.add('active');
    elem.style.background = '#A8D4B0';
    elem.style.color = '#143d1c';
  }

  tshirtState.fit = cleanFit.includes('oversize') ? 'Oversized T-Shirts' : (cleanFit.includes('round') ? 'Rounded Neck' : 'Polo T Shirts');

  // 1. Filter Inbuilt Products catalog grid if inbuilt view active
  const inbuiltView = document.getElementById('inbuilt-mode-view');
  if (inbuiltView) {
    const allBtn = document.querySelector('.inbuilt-filter-btn[onclick*="all"]') || document.querySelector('.inbuilt-filter-btn');
    if (typeof window.filterTshirtCatalog === 'function') {
      window.filterTshirtCatalog('all', allBtn);
    }
  }

  // 2. Update Product Main Title & Front Box Selector & Description
  const titleElem = document.getElementById('tshirt-product-title-main');
  if (titleElem) {
    if (cleanFit.includes('oversize')) {
      titleElem.textContent = 'CUSTOMIZED OVERSIZED TSHIRT WITH YOUR DESIGN';
    } else if (cleanFit.includes('round')) {
      titleElem.textContent = 'CUSTOMIZED ROUND NECK TSHIRT WITH YOUR DESIGN OR COMPANY LOGO';
    } else {
      titleElem.textContent = 'Customized Polo T-Shirt With Your Company Logo | Order Logo Printed Tees';
    }
  }

  // Dynamically update ALL Description Box items per fit across DOM
  document.querySelectorAll('.tshirt-specs-desc-box ul').forEach(descUl => {
    const activeFitText = (fitName || tshirtState.fit || '').toString().trim().toLowerCase();
    if (activeFitText.includes('oversize') || activeFitText.includes('oversized')) {
      descUl.innerHTML = `
        <li>✓ Premium 180 GSM Fabric</li>
        <li>✓ Lightweight &amp; Breathable</li>
        <li>✓ Relaxed Oversized Fit</li>
        <li>✓ Perfect for Everyday Wear</li>
      `;
    } else if (activeFitText.includes('round') || activeFitText.includes('rounded')) {
      descUl.innerHTML = `
        <li>✓ 180 GSM Fabric</li>
        <li>✓ 100% Cotton</li>
        <li>✓ Regular Fit</li>
        <li>✓ Lightweight &amp; Breathable</li>
      `;
    } else {
      descUl.innerHTML = `
        <li>✓ Premium 200 GSM Fabric</li>
        <li>✓ Lightweight &amp; Breathable</li>
        <li>✓ Regular fit</li>
        <li>✓ Perfect for Everyday Wear</li>
      `;
    }
  });

  // Remove any remaining 'Inclusive of All Taxes' span elements dynamically
  document.querySelectorAll('.tshirt-top-price-card span').forEach(s => {
    if ((s.textContent || '').toLowerCase().includes('inclusive of all taxes')) {
      s.remove();
    }
  });

  const boxSelector = document.getElementById('roundneck-front-box-selector');
  if (boxSelector) {
    if (cleanFit.includes('round')) {
      boxSelector.style.display = 'block';
    } else {
      boxSelector.style.display = 'none';
    }
  }

  // Handle Quantity options & Min Qty dynamically (Oversized = Min 1, Others = Min 2)
  const isOversizedFit = cleanFit.includes('oversize') || cleanFit.includes('oversized');
  const customInput = document.getElementById('tshirt-custom-qty-input');
  const qtyChip1 = document.getElementById('qty-chip-1');
  const customQtyBtn = document.getElementById('custom-qty-chip-btn');
  const customQtyBox = document.getElementById('custom-qty-input-box');

  if (isOversizedFit) {
    if (customInput) {
      customInput.min = "1";
      customInput.placeholder = "Min 1";
      if (!customInput.value || customInput.value === "2") {
        customInput.value = "1";
      }
    }
    if (qtyChip1) {
      qtyChip1.style.display = 'none';
    }
    if (!tshirtState.targetQty || tshirtState.targetQty < 1 || tshirtState.targetQty === 2) {
      tshirtState.targetQty = 1;
    }

    // Hide preset chips for Oversized T-Shirts (Custom Qty only)
    document.querySelectorAll('.tshirt-qty-chips-flex .qty-chip-btn[data-qty]').forEach(btn => {
      btn.style.display = 'none';
    });

    if (customQtyBtn) {
      customQtyBtn.style.display = 'inline-flex';
      customQtyBtn.classList.add('active');
    }
    if (customQtyBox) customQtyBox.style.display = 'inline-flex';

    const headerLabel = document.getElementById('tshirt-qty-header-label');
    if (headerLabel) headerLabel.textContent = `${tshirtState.targetQty} PCS (CUSTOM)`;

    // Remove/Hide XXL size for Oversized T-Shirts
    const xxlCard = document.getElementById('size-card-XXL');
    if (xxlCard) xxlCard.style.display = 'none';
    const xxlInput = document.getElementById('size-qty-input-XXL');
    if (xxlInput) {
      const xxlRow = xxlInput.closest('.size-counter-row, .elementa-compact-size-card');
      if (xxlRow) xxlRow.style.display = 'none';
      if (typeof tshirtState !== 'undefined' && tshirtState.sizeDistribution) {
        tshirtState.sizeDistribution['XXL'] = 0;
      }
      xxlInput.value = 0;
    }
  } else {
    if (customInput) {
      customInput.min = "2";
      customInput.placeholder = "Min 2";
      if (customInput.value === "1") {
        customInput.value = "2";
      }
    }
    if (qtyChip1) {
      qtyChip1.style.display = 'none';
    }
    document.querySelectorAll('.tshirt-qty-chips-flex .qty-chip-btn[data-qty]').forEach(btn => {
      if (btn.getAttribute('data-qty') === '1') {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'inline-block';
      }
    });

    if (customQtyBtn) customQtyBtn.style.display = 'inline-flex';

    if (!tshirtState.targetQty || tshirtState.targetQty < 2) {
      tshirtState.targetQty = 2;
      const chip2 = document.querySelector('.tshirt-qty-chips-flex .qty-chip-btn[data-qty="2"]');
      if (chip2) {
        document.querySelectorAll('#custom-mode-view .tshirt-qty-chips-flex .qty-chip-btn').forEach(b => b.classList.remove('active'));
        chip2.classList.add('active');
      }
      const headerLabel = document.getElementById('tshirt-qty-header-label');
      if (headerLabel) headerLabel.textContent = '2 PCS';
    }

    // Show XXL size for Polo & Round Neck T-Shirts
    const xxlCard = document.getElementById('size-card-XXL');
    if (xxlCard) xxlCard.style.display = 'flex';
    const xxlInput = document.getElementById('size-qty-input-XXL');
    if (xxlInput) {
      const xxlRow = xxlInput.closest('.size-counter-row, .elementa-compact-size-card');
      if (xxlRow) xxlRow.style.display = 'flex';
    }
  }

  // 3. Update Swatches for Oversized vs Round Neck vs Standard T-Shirts
  if (typeof window.updateTshirtColorSwatchesForFit === 'function') {
    window.updateTshirtColorSwatchesForFit(tshirtState.fit);
  }

  // 4. Update box position & size for current fit
  if (typeof window.updateBoxPositionForColor === 'function') {
    window.updateBoxPositionForColor(tshirtState.color || 'Black');
  }

  // 5. Recalculate price & update front/back logo box transform
  if (typeof window.recalculateTshirtPrice === 'function') {
    window.recalculateTshirtPrice();
  }
  if (typeof applyLogoTransformUI === 'function') {
    applyLogoTransformUI();
  }

  showToast(`Selected Style: ${tshirtState.fit}`);
  if (typeof window.updateSizeChartForCurrentFit === 'function') {
    window.updateSizeChartForCurrentFit();
  }
};

window.updateTshirtColorSwatchesForFit = function (fitName) {
  const container = document.getElementById('tshirt-color-grid-container');
  if (!container) return;

  let currentFit = fitName || (typeof tshirtState !== 'undefined' && tshirtState.fit) || '';
  if (!currentFit) {
    const activeSubBtn = document.querySelector('.tshirt-fit-sub-btn.active');
    if (activeSubBtn) currentFit = activeSubBtn.textContent || '';
  }

  const cleanFit = currentFit.toString().trim().toLowerCase();
  let targetTag = 'polo';
  if (cleanFit.includes('oversize') || cleanFit.includes('oversized')) {
    targetTag = 'oversized';
  } else if (cleanFit.includes('round') || cleanFit.includes('rounded')) {
    targetTag = 'round';
  }

  const allowedColorsByTag = {
    'oversized': ['white', 'black', 'red', 'navy blue'],
    'round': ['black', 'white', 'navy blue', 'red'],
    'polo': ['black', 'white', 'navy blue', 'red', 'grey']
  };

  const defaultFitsByColor = {
    'black': 'polo,oversized,round',
    'white': 'polo,oversized,round',
    'navy blue': 'polo,oversized,round',
    'red': 'polo,oversized,round',
    'grey': 'polo'
  };

  const existingButtons = container.querySelectorAll('.color-swatch-card');
  let targetSwatch = null;
  if (existingButtons && existingButtons.length > 0) {
    let firstVisible = null;
    let currentActiveVisible = null;
    existingButtons.forEach(btn => {
      const colorName = (btn.getAttribute('data-color') || btn.textContent || '').trim().toLowerCase();
      let fits = (btn.getAttribute('data-fits') || '').toLowerCase();

      if (!fits) {
        fits = defaultFitsByColor[colorName] || 'polo';
        btn.setAttribute('data-fits', fits);
      }

      const isAllowed = fits.includes(targetTag) || (allowedColorsByTag[targetTag] && allowedColorsByTag[targetTag].includes(colorName));

      if (isAllowed) {
        btn.style.setProperty('display', 'inline-flex', 'important');
        if (!firstVisible) firstVisible = btn;
        if (btn.classList.contains('active')) currentActiveVisible = btn;
      } else {
        btn.style.setProperty('display', 'none', 'important');
        btn.classList.remove('active');
      }
    });

    targetSwatch = currentActiveVisible || firstVisible;
    if (targetSwatch) {
      existingButtons.forEach(b => b.classList.remove('active'));
      targetSwatch.classList.add('active');
      const colorName = targetSwatch.getAttribute('data-color') || 'Black';
      const colorHex = targetSwatch.getAttribute('data-hex') || '#0f172a';
      if (typeof selectTshirtColor === 'function') {
        selectTshirtColor(colorName, colorHex, targetSwatch);
      }
      try {
        targetSwatch.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (e) { }
    }
  } else {
    if (targetTag === 'oversized') {
      container.innerHTML = `
        <button type="button" class="color-swatch-card active" data-color="White" data-hex="#ffffff" data-fits="polo,oversized,round" onclick="selectTshirtColor('White', '#ffffff', this)">
          <span class="swatch-circle" style="background: #ffffff; border: 1px solid #cbd5e1;"></span>
          <span class="swatch-name">White</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Black" data-hex="#0f172a" data-fits="polo,oversized,round" onclick="selectTshirtColor('Black', '#0f172a', this)">
          <span class="swatch-circle" style="background: #0f172a;"></span>
          <span class="swatch-name">Black</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Red" data-hex="#dc2626" data-fits="polo,oversized,round" onclick="selectTshirtColor('Red', '#dc2626', this)">
          <span class="swatch-circle" style="background: #dc2626;"></span>
          <span class="swatch-name">Red</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Navy Blue" data-hex="#1e3a8a" data-fits="polo,oversized,round" onclick="selectTshirtColor('Navy Blue', '#1e3a8a', this)">
          <span class="swatch-circle" style="background: #1e3a8a;"></span>
          <span class="swatch-name">Navy Blue</span>
        </button>
      `;
      targetSwatch = container.querySelector('[data-color="White"]');
      if (typeof selectTshirtColor === 'function') selectTshirtColor('White', '#ffffff', targetSwatch);
    } else if (targetTag === 'round') {
      container.innerHTML = `
        <button type="button" class="color-swatch-card active" data-color="Black" data-hex="#0f172a" data-fits="polo,oversized,round" onclick="selectTshirtColor('Black', '#0f172a', this)">
          <span class="swatch-circle" style="background: #0f172a;"></span>
          <span class="swatch-name">Black</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="White" data-hex="#ffffff" data-fits="polo,oversized,round" onclick="selectTshirtColor('White', '#ffffff', this)">
          <span class="swatch-circle" style="background: #ffffff; border: 1px solid #cbd5e1;"></span>
          <span class="swatch-name">White</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Navy Blue" data-hex="#1e3a8a" data-fits="polo,oversized,round" onclick="selectTshirtColor('Navy Blue', '#1e3a8a', this)">
          <span class="swatch-circle" style="background: #1e3a8a;"></span>
          <span class="swatch-name">Navy Blue</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Red" data-hex="#dc2626" data-fits="polo,oversized,round" onclick="selectTshirtColor('Red', '#dc2626', this)">
          <span class="swatch-circle" style="background: #dc2626;"></span>
          <span class="swatch-name">Red</span>
        </button>
      `;
      targetSwatch = container.querySelector('[data-color="Black"]');
      if (typeof selectTshirtColor === 'function') selectTshirtColor('Black', '#0f172a', targetSwatch);
    } else {
      container.innerHTML = `
        <button type="button" class="color-swatch-card active" data-color="Black" data-hex="#111827" data-fits="polo,oversized,round" onclick="selectTshirtColor('Black', '#111827', this)">
          <span class="swatch-circle" style="background: #111827;"></span>
          <span class="swatch-name">Black</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="White" data-hex="#ffffff" data-fits="polo,oversized,round" onclick="selectTshirtColor('White', '#ffffff', this)">
          <span class="swatch-circle" style="background: #ffffff; border: 1px solid #cbd5e1;"></span>
          <span class="swatch-name">White</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Navy Blue" data-hex="#1e3a8a" data-fits="polo,oversized,round" onclick="selectTshirtColor('Navy Blue', '#1e3a8a', this)">
          <span class="swatch-circle" style="background: #1e3a8a;"></span>
          <span class="swatch-name">Navy Blue</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Red" data-hex="#dc2626" data-fits="polo,oversized,round" onclick="selectTshirtColor('Red', '#dc2626', this)">
          <span class="swatch-circle" style="background: #dc2626;"></span>
          <span class="swatch-name">Red</span>
        </button>
        <button type="button" class="color-swatch-card" data-color="Grey" data-hex="#6b7280" data-fits="polo" onclick="selectTshirtColor('Grey', '#6b7280', this)">
          <span class="swatch-circle" style="background: #6b7280;"></span>
          <span class="swatch-name">Grey</span>
        </button>
      `;
      targetSwatch = container.querySelector('[data-color="Black"]');
      if (typeof selectTshirtColor === 'function') selectTshirtColor('Black', '#111827', targetSwatch);
    }
  }

  if (typeof window.renderPoloColorThumbnails === 'function') {
    window.renderPoloColorThumbnails();
  }
};

function updateImageWithFade(imgElem, newSrc) {
  if (!imgElem || !newSrc) return;
  const currentSrc = imgElem.getAttribute('src') || imgElem.src || '';
  if (currentSrc === newSrc) {
    imgElem.style.opacity = '1';
    return;
  }
  imgElem.style.transition = 'opacity 0.15s ease-in-out';
  imgElem.style.opacity = '0.35';

  const loader = new Image();
  loader.onload = function () {
    imgElem.src = newSrc;
    imgElem.style.opacity = '1';
  };
  loader.onerror = function () {
    imgElem.src = newSrc;
    imgElem.style.opacity = '1';
  };
  loader.src = newSrc;
}

let tshirtColorImageMap = {
  'Black': 'assets/polo-black.jpg',
  'White': 'assets/polo-white.jpg',
  'Navy Blue': 'assets/polo-navy.jpg',
  'Red': 'assets/polo-red.jpg',
  'Grey': 'assets/polo-grey.jpg'
};

function getTshirtColorImage(colorName) {
  let activeFit = (tshirtState && tshirtState.fit) ? tshirtState.fit : '';
  if (!activeFit) {
    const activeSubBtn = document.querySelector('.tshirt-fit-sub-btn.active');
    if (activeSubBtn) {
      activeFit = activeSubBtn.textContent || '';
    }
  }

  const fitLower = activeFit.toLowerCase();

  if (fitLower.includes('round') || fitLower.includes('rounded')) {
    const clean = (colorName || '').trim().toLowerCase();
    if (clean.includes('white')) return 'assets/roundneck-white.jpg';
    if (clean.includes('black')) return 'assets/roundneck-black.jpg';
    if (clean.includes('navy') || clean.includes('blue')) return 'assets/roundneck-navy.jpg';
    if (clean.includes('red')) return 'assets/roundneck-red.jpg';
    return 'assets/roundneck-black.jpg';
  }

  if (fitLower.includes('oversize') || fitLower.includes('oversized')) {
    const clean = (colorName || '').trim().toLowerCase();
    if (clean.includes('white')) return 'assets/oversized-white.png';
    if (clean.includes('black')) return 'assets/oversized-black.png';
    if (clean.includes('red')) return 'assets/oversized-red.png';
    if (clean.includes('navy') || clean.includes('blue')) return 'assets/oversized-navy.png';
    return 'assets/oversized-white.png';
  }

  if (!colorName) return 'assets/polo-black.jpg';
  if (tshirtColorImageMap[colorName]) return tshirtColorImageMap[colorName];

  const clean = colorName.trim().toLowerCase();
  for (const [key, val] of Object.entries(tshirtColorImageMap)) {
    if (key.toLowerCase() === clean) return val;
  }

  if (clean.includes('navy') || clean.includes('blue')) return 'assets/polo-navy.jpg';
  if (clean.includes('red')) return 'assets/polo-red.jpg';
  if (clean.includes('white')) return 'assets/polo-white.jpg';
  if (clean.includes('black')) return 'assets/polo-black.jpg';
  if (clean.includes('grey') || clean.includes('gray')) return 'assets/polo-grey.jpg';

  return 'assets/polo-black.jpg';
}

/* Color Thumbnails Slider Strip Handler (Polo, Oversized & Round Neck) */
window.renderPoloColorThumbnails = function () {
  const container = document.getElementById('tshirt-gallery-thumbs-container');
  if (!container) return;

  let currentFit = (tshirtState && tshirtState.fit) ? tshirtState.fit : '';
  if (!currentFit) {
    const activeSubBtn = document.querySelector('.tshirt-fit-sub-btn.active');
    if (activeSubBtn) {
      currentFit = activeSubBtn.textContent || '';
    }
  }
  if (!currentFit) {
    const path = (window.location.pathname || '').toLowerCase();
    const pageTitle = (document.title || '').toLowerCase();
    const shopTitle = (window.shopifyProductTitle || '').toLowerCase();
    const shopHandle = (window.shopifyProductHandle || '').toLowerCase();
    if (path.includes('oversiz') || pageTitle.includes('oversiz') || shopTitle.includes('oversiz') || shopHandle.includes('oversiz')) {
      currentFit = 'oversized';
    } else if (path.includes('round') || pageTitle.includes('round') || shopTitle.includes('round') || shopHandle.includes('round')) {
      currentFit = 'round';
    } else {
      currentFit = 'polo';
    }
  }

  const cleanFit = currentFit.toLowerCase();
  let fitColors = [];
  let fitLabelSuffix = 'T-Shirt';

  if (cleanFit.includes('oversiz')) {
    fitLabelSuffix = 'Oversized T-Shirt';
    fitColors = [
      { name: 'White', hex: '#ffffff', file: 'oversized-white.png' },
      { name: 'Black', hex: '#0f172a', file: 'oversized-black.png' },
      { name: 'Navy Blue', hex: '#1e3a8a', file: 'oversized-navy.png' },
      { name: 'Red', hex: '#dc2626', file: 'oversized-red.png' }
    ];
  } else if (cleanFit.includes('round')) {
    fitLabelSuffix = 'Round Neck T-Shirt';
    fitColors = [
      { name: 'White', hex: '#ffffff', file: 'roundneck-white.jpg' },
      { name: 'Black', hex: '#0f172a', file: 'roundneck-black.jpg' },
      { name: 'Navy Blue', hex: '#1e3a8a', file: 'roundneck-navy.jpg' },
      { name: 'Red', hex: '#dc2626', file: 'roundneck-red.jpg' }
    ];
  } else {
    fitLabelSuffix = 'Polo T-Shirt';
    fitColors = [
      { name: 'White', hex: '#ffffff', file: 'polo-white.jpg' },
      { name: 'Black', hex: '#0f172a', file: 'polo-black.jpg' },
      { name: 'Navy Blue', hex: '#1e3a8a', file: 'polo-navy.jpg' },
      { name: 'Red', hex: '#dc2626', file: 'polo-red.jpg' },
      { name: 'Grey', hex: '#6b7280', file: 'polo-grey.jpg' }
    ];
  }

  const activeColor = (tshirtState && tshirtState.color) ? tshirtState.color : fitColors[0].name;

  container.innerHTML = fitColors.map(c => {
    let imgSrc = `assets/${c.file}`;
    if (window.getShopifyAsset) {
      imgSrc = window.getShopifyAsset(c.file) || window.getShopifyAsset(`assets/${c.file}`) || imgSrc;
    }
    const isCleanMatch = (c.name.toLowerCase() === activeColor.toLowerCase() || activeColor.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(activeColor.toLowerCase()));
    const activeClass = isCleanMatch ? 'active' : '';

    return `
      <button type="button" 
              class="gallery-thumb-card color-thumb-item ${activeClass}" 
              data-color-name="${c.name}"
              data-color-hex="${c.hex}"
              onclick="selectTshirtColorFromThumb('${c.name}', '${c.hex}', this)"
              title="${c.name} ${fitLabelSuffix}">
        <img src="${imgSrc}" alt="${c.name} ${fitLabelSuffix}">
        <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.75); color: #ffffff; font-size: 9px; font-weight: 800; text-align: center; padding: 2px 0; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.3px;">${c.name}</span>
      </button>
    `;
  }).join('');
};
window.renderTshirtColorThumbnails = window.renderPoloColorThumbnails;

window.scrollTshirtThumbnails = function (direction) {
  const container = document.getElementById('tshirt-gallery-thumbs-container');
  if (!container) return;
  const scrollAmount = 200;
  container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
};

window.selectTshirtColorFromThumb = function (colorName, colorHex, thumbBtnElem) {
  // 1. Find matching color swatch card in option tab
  let targetSwatch = null;
  const swatches = document.querySelectorAll('#custom-mode-view .color-swatch-card, .tshirt-color-grid .color-swatch-card');
  swatches.forEach(swatch => {
    const sColor = swatch.getAttribute('data-color') || '';
    if (sColor.toLowerCase() === colorName.toLowerCase() || colorName.toLowerCase().includes(sColor.toLowerCase()) || sColor.toLowerCase().includes(colorName.toLowerCase())) {
      targetSwatch = swatch;
    }
  });

  // 2. Highlight active thumbnail in slider
  document.querySelectorAll('#tshirt-gallery-thumbs-container .gallery-thumb-card').forEach(card => {
    card.classList.remove('active');
  });
  if (thumbBtnElem) {
    thumbBtnElem.classList.add('active');
    thumbBtnElem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // 3. Trigger selectTshirtColor logic
  if (typeof window.selectTshirtColor === 'function') {
    window.selectTshirtColor(colorName, colorHex, targetSwatch);
  }
};

window.selectTshirtColor = function (colorName, colorHex, elem) {
  document.querySelectorAll('#custom-mode-view .color-swatch-card').forEach(b => b.classList.remove('active'));
  if (elem) {
    elem.classList.add('active');
    try {
      elem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (e) { }
  }

  tshirtState.color = colorName;
  tshirtState.colorHex = colorHex;

  const labelElem = document.getElementById('selected-tshirt-color-label');
  if (labelElem) labelElem.textContent = colorName.toUpperCase();

  const svgPath = document.getElementById('tshirt-svg-body-path');
  if (svgPath) {
    svgPath.setAttribute('fill', colorHex);
    svgPath.style.transition = 'fill 0.3s ease';
  }

  // Update both Lifestyle Photo AND Live Studio Canvas Photo Background
  let rawColorImg = null;
  if (elem && (elem.getAttribute('data-image') || elem.getAttribute('data-variant-image') || elem.getAttribute('data-src'))) {
    rawColorImg = elem.getAttribute('data-image') || elem.getAttribute('data-variant-image') || elem.getAttribute('data-src');
  } else {
    rawColorImg = getTshirtColorImage(colorName);
  }

  if (rawColorImg) {
    const colorImgSrc = (window.getShopifyAsset && !rawColorImg.startsWith('http') && !rawColorImg.startsWith('//')) ? window.getShopifyAsset(rawColorImg) : rawColorImg;

    const mainImg = document.getElementById('tshirt-main-product-img') || document.getElementById('PrimaryImage-product-template') || document.getElementById('main-product-img');
    if (mainImg) {
      updateImageWithFade(mainImg, colorImgSrc);
      const resultBox = document.getElementById('tshirt-zoom-result-box');
      if (resultBox && tshirtState.viewMode !== 'canvas') {
        resultBox.style.backgroundImage = `url('${colorImgSrc}')`;
      }
    }

    const canvasBgImg = document.getElementById('tshirt-canvas-bg-img');
    if (canvasBgImg) {
      updateImageWithFade(canvasBgImg, colorImgSrc);
    }
    if (typeof window.markZoomMirrorDirty === 'function') {
      window.markZoomMirrorDirty();
    }
  }

  // Sync active state in Polo color thumbnail slider strip
  const thumbCards = document.querySelectorAll('#tshirt-gallery-thumbs-container .color-thumb-item');
  thumbCards.forEach(card => {
    const cName = card.getAttribute('data-color-name') || '';
    if (cName.toLowerCase() === colorName.toLowerCase() || colorName.toLowerCase().includes(cName.toLowerCase()) || cName.toLowerCase().includes(colorName.toLowerCase())) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      card.classList.remove('active');
    }
  });

  // Automatically update box position & size based on selected t-shirt color
  if (typeof window.updateBoxPositionForColor === 'function') {
    window.updateBoxPositionForColor(colorName);
  }

  showToast(`Selected Color: ${colorName}`);
};

/* Front vs Back View Interactive Split Slider Handler */
let tshirtViewSliderVal = 50; // 0 = Front Only, 50 = Both, 100 = Back Only

window.updateTshirtViewSlider = function (val) {
  tshirtViewSliderVal = parseInt(val, 10);
  const sliderElem = document.getElementById('tshirt-view-split-slider');
  if (sliderElem) sliderElem.value = tshirtViewSliderVal;

  const percentElem = document.getElementById('tshirt-view-slider-val-text');
  const stageWrapper = document.getElementById('tshirt-canvas-stage-wrapper');
  if (!stageWrapper) return;

  if (tshirtViewSliderVal === 50) {
    // Center (50%): Both Front & Back visible side-by-side
    stageWrapper.style.transform = 'scale(1) translateX(0%)';
    if (percentElem) percentElem.textContent = 'Both Views (50%)';
  } else if (tshirtViewSliderVal < 50) {
    // Moving Left (0% to 49%): Focus on Front View (Left side of photo)
    let shiftX = ((50 - tshirtViewSliderVal) / 50) * 23;
    let scaleZoom = 1.0 + ((50 - tshirtViewSliderVal) / 50) * 0.35;
    stageWrapper.style.transform = `scale(${scaleZoom}) translateX(${shiftX}%)`;
    if (percentElem) percentElem.textContent = `Front Focus (${Math.round((50 - tshirtViewSliderVal) * 2)}%)`;
  } else {
    // Moving Right (51% to 100%): Focus on Back View (Right side of photo)
    let shiftX = ((tshirtViewSliderVal - 50) / 50) * -23;
    let scaleZoom = 1.0 + ((tshirtViewSliderVal - 50) / 50) * 0.35;
    stageWrapper.style.transform = `scale(${scaleZoom}) translateX(${shiftX}%)`;
    if (percentElem) percentElem.textContent = `Back Focus (${Math.round((tshirtViewSliderVal - 50) * 2)}%)`;
  }
};

/* Active Logo Editing Selector State (Logo 1 vs Logo 2) */
let activeEditLogo = 1; // 1 or 2

window.setActiveEditLogo = function (num, btnElem, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  activeEditLogo = num;

  const tab1 = document.getElementById('btn-edit-logo-1');
  const tab2 = document.getElementById('btn-edit-logo-2');
  if (tab1 && tab2) {
    tab1.classList.remove('active');
    tab2.classList.remove('active');
    if (num === 1) tab1.classList.add('active');
    else if (num === 2) tab2.classList.add('active');
  } else if (btnElem && btnElem.classList) {
    btnElem.classList.add('active');
  }

  document.querySelectorAll('.tshirt-draggable-logo-container, .tshirt-draggable-text-container').forEach(c => c.classList.remove('is-selected'));
  let targetElem = null;
  if (num === 1) targetElem = document.getElementById('tshirt-draggable-logo-container');
  else if (num === 2) targetElem = document.getElementById('tshirt-draggable-logo-container-2');
  else if (num === 'text') targetElem = document.getElementById('tshirt-draggable-text-container');

  if (targetElem) {
    targetElem.classList.add('is-selected');
  }

  applyLogoTransformUI();
  showToast(`Active Controls: Adjusting Logo ${num}`);
};

/* Dynamic Logo Count Button Label Updates */
window.updateLogoCountButtonLabels = function () {
  const btn1 = document.getElementById('btn-logo-count-1');
  const btn2 = document.getElementById('btn-logo-count-2');
  if (!btn1 && !btn2) return;

  let frontText = 'Front 4" X 4"';
  let backText = 'Back 10" X 10"';

  if (tshirtState && tshirtState.fit === 'Oversized T-Shirts') {
    frontText = 'Front 12" X 12"';
    backText = 'Back 12" X 12"';
  } else if (tshirtState && (tshirtState.fit === 'Rounded Neck' || tshirtState.fit === 'Round Neck')) {
    const mode = tshirtState.roundNeckFrontMode || '4x4';
    frontText = (mode === '4x4') ? 'Front 4" X 4"' : 'Front 10" X 10"';
    backText = 'Back 10" X 10"';
  } else {
    // Polo / Regular T-Shirt
    frontText = 'Front 4" X 4"';
    backText = 'Back 10" X 10"';
  }

  if (btn1) {
    btn1.innerHTML = `<i class="fa-solid fa-image"></i> Image (${frontText})`;
  }
  if (btn2) {
    btn2.innerHTML = `<i class="fa-solid fa-images"></i> Images (${backText})`;
  }
};

/* Number of Logos Selector (1 Logo vs 2 Logos) */
window.setTshirtLogoCount = function (count, elem) {
  if (count === 2 && !tshirtState.hasBackPrint) {
    showToast("🔒 Please turn ON 'Add Back Print (+₹100/pc)' switch above first to enable Back Print uploads!");
    const toggleCheckbox = document.getElementById('tshirt-back-print-toggle');
    if (toggleCheckbox) {
      toggleCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const parent = toggleCheckbox.closest('.elementa-toggle-switch') || toggleCheckbox.parentElement;
      if (parent) {
        parent.style.transition = 'all 0.3s ease';
        parent.style.boxShadow = '0 0 0 4px rgba(225, 29, 72, 0.4)';
        setTimeout(() => { parent.style.boxShadow = ''; }, 2000);
      }
    }
    return;
  }

  tshirtState.logoCount = count;
  document.querySelectorAll('#btn-logo-count-1, #btn-logo-count-2').forEach(b => b.classList.remove('active'));
  if (elem) {
    elem.classList.add('active');
  } else {
    const targetBtn = document.getElementById(count === 2 ? 'btn-logo-count-2' : 'btn-logo-count-1');
    if (targetBtn) targetBtn.classList.add('active');
  }

  const editTabContainer = document.getElementById('active-logo-edit-tab-container');
  const container2 = document.getElementById('tshirt-draggable-logo-container-2');
  const roundNeckBoxSelector = document.getElementById('roundneck-front-box-selector');

  if (count === 2) {
    if (editTabContainer) editTabContainer.style.display = 'block';
    if (container2) {
      container2.style.display = 'flex';
      const logoImg2 = document.getElementById('tshirt-canvas-logo-img-2');
      if (logoImg2 && tshirtState.artworkDataUrl2) {
        logoImg2.src = tshirtState.artworkDataUrl2;
        logoImg2.style.display = 'block';
      } else if (logoImg2 && tshirtState.artworkDataUrl) {
        logoImg2.src = tshirtState.artworkDataUrl;
        logoImg2.style.display = 'block';
      }
    }
    if (roundNeckBoxSelector) roundNeckBoxSelector.style.display = 'none';
    applyLogoTransformUI();
    showToast('Images (Back Logo) Selected: Upload Image 1 & Image 2');
  } else if (count === 1) {
    if (editTabContainer) editTabContainer.style.display = 'none';
    if (container2) container2.style.display = 'none';
    if (roundNeckBoxSelector && (tshirtState.fit === 'Rounded Neck' || tshirtState.fit === 'Round Neck')) {
      roundNeckBoxSelector.style.display = 'block';
    }
    activeEditLogo = 1;
    applyLogoTransformUI();
    showToast('Image (Front Logo) Selected: Upload Image 1');
  }

  if (typeof window.updateLogoUploadStepUI === 'function') {
    window.updateLogoUploadStepUI();
  }
};

window.updateLogoUploadStepUI = function () {
  const btn1 = document.getElementById('btn-logo-count-1');
  const btn2 = document.getElementById('btn-logo-count-2');
  const dropzone1 = document.getElementById('tshirt-dropzone-1');
  const dropzone2 = document.getElementById('tshirt-dropzone-2');
  const roundNeckBoxSelector = document.getElementById('roundneck-front-box-selector');

  if (btn1) btn1.style.display = 'inline-flex';
  if (btn2) {
    btn2.style.display = 'inline-flex';
    if (!tshirtState.hasBackPrint) {
      btn2.style.opacity = '0.7';
      btn2.title = "Turn ON 'Add Back Print (+₹100/pc)' switch above to enable";
      btn2.innerHTML = `<i class="fa-solid fa-lock" style="margin-right: 4px; color: #be123c;"></i> Images (Back 10" X 10")`;
    } else {
      btn2.style.opacity = '1';
      btn2.title = "";
      btn2.innerHTML = `<i class="fa-solid fa-images"></i> Images (Back 10" X 10")`;
    }
  }

  const count = (tshirtState && typeof tshirtState.logoCount === 'number') ? tshirtState.logoCount : 0;
  const isRoundNeck = !!(tshirtState && tshirtState.fit && tshirtState.fit.toLowerCase().includes('round'));

  if (count === 1) {
    if (btn1) btn1.classList.add('active');
    if (btn2) btn2.classList.remove('active');
    if (dropzone1) dropzone1.style.display = 'block';
    if (dropzone2) dropzone2.style.display = 'none';
    if (roundNeckBoxSelector) roundNeckBoxSelector.style.display = isRoundNeck ? 'block' : 'none';
  } else if (count === 2 && tshirtState.hasBackPrint) {
    if (btn1) btn1.classList.remove('active');
    if (btn2) btn2.classList.add('active');
    if (dropzone1) dropzone1.style.display = 'none';
    if (dropzone2) dropzone2.style.display = 'block';
    if (roundNeckBoxSelector) roundNeckBoxSelector.style.display = 'none';
  } else {
    // count === 0 or count === 2 without back print enabled
    if (btn1) btn1.classList.remove('active');
    if (btn2) btn2.classList.remove('active');
    if (dropzone1) dropzone1.style.display = 'none';
    if (dropzone2) dropzone2.style.display = 'none';
    if (roundNeckBoxSelector) roundNeckBoxSelector.style.display = 'none';
  }
};

/* Per-Color Print Box Positions & Box Size Configurations */
let tshirtColorBoxConfig = {
  'Black': { xPercent: 37.7, yPercent: 43.5, boxSizePx: 40 },
  'White': { xPercent: 34.9, yPercent: 38.6, boxSizePx: 41 },
  'Navy Blue': { xPercent: 35.1, yPercent: 36.9, boxSizePx: 40 },
  'Light Blue': { xPercent: 35.5, yPercent: 34.7, boxSizePx: 40 },
  'Red': { xPercent: 35, yPercent: 37.3, boxSizePx: 40 },
  'Maroon': { xPercent: 35.6, yPercent: 34.9, boxSizePx: 57 },
  'Yellow': { xPercent: 35.8, yPercent: 33.5, boxSizePx: 60 },
  'Green': { xPercent: 35.7, yPercent: 35.5, boxSizePx: 56 },
  'Dark Green': { xPercent: 36.7, yPercent: 38.3, boxSizePx: 52 },
  'Lime': { xPercent: 35.7, yPercent: 34.7, boxSizePx: 59 },
  'Orange': { xPercent: 35.4, yPercent: 34.6, boxSizePx: 59 },
  'Camel': { xPercent: 35.2, yPercent: 35, boxSizePx: 52 },
  'Pink': { xPercent: 36.7, yPercent: 36.6, boxSizePx: 57 },
  'Grey': { xPercent: 35.9, yPercent: 39.9, boxSizePx: 40 }
};

/* Per-Color Print Box Configurations for BACK Logo (12" x 12" / 10" x 10") */
let tshirtColorBoxConfigBack = {
  'Black': { xPercent: 70, yPercent: 43.2, boxSizePx: 75 },
  'White': { xPercent: 72, yPercent: 40.5, boxSizePx: 93 },
  'Navy Blue': { xPercent: 71, yPercent: 39, boxSizePx: 85 },
  'Light Blue': { xPercent: 71.5, yPercent: 36, boxSizePx: 115 },
  'Red': { xPercent: 71.5, yPercent: 38, boxSizePx: 90 },
  'Maroon': { xPercent: 71, yPercent: 36, boxSizePx: 109 },
  'Yellow': { xPercent: 71.8, yPercent: 35, boxSizePx: 120 },
  'Green': { xPercent: 71, yPercent: 37, boxSizePx: 110 },
  'Dark Green': { xPercent: 70.5, yPercent: 38.2, boxSizePx: 100 },
  'Lime': { xPercent: 72.5, yPercent: 36.7, boxSizePx: 120 },
  'Orange': { xPercent: 71.5, yPercent: 35.5, boxSizePx: 115 },
  'Camel': { xPercent: 70.5, yPercent: 36.2, boxSizePx: 110 },
  'Pink': { xPercent: 72.9, yPercent: 38.3, boxSizePx: 115 },
  'Grey': { xPercent: 71, yPercent: 40, boxSizePx: 80 }
};

/* Per-Color Print Box Configurations for OVERSIZED T-Shirt FRONT View */
let oversizedColorBoxConfigFront = {
  'White': { xPercent: 29.35, yPercent: 47.66, boxWidthPx: 105, boxHeightPx: 130 },
  'Black': { xPercent: 29.45, yPercent: 47.66, boxWidthPx: 105, boxHeightPx: 132 },
  'Red': { xPercent: 29, yPercent: 47.66, boxWidthPx: 110, boxHeightPx: 132 },
  'Navy Blue': { xPercent: 29, yPercent: 46.66, boxWidthPx: 110, boxHeightPx: 132 }
};

/* Per-Color Print Box Configurations for OVERSIZED T-Shirt BACK View */
let oversizedColorBoxConfigBack = {
  'White': { xPercent: 71.48, yPercent: 47.66, boxWidthPx: 105, boxHeightPx: 130 },
  'Black': { xPercent: 71, yPercent: 47.66, boxWidthPx: 105, boxHeightPx: 132 },
  'Red': { xPercent: 71.5, yPercent: 47.56, boxWidthPx: 110, boxHeightPx: 135 },
  'Navy Blue': { xPercent: 71.8, yPercent: 46.56, boxWidthPx: 105, boxHeightPx: 130 }
};

/* Per-Color Print Box Configurations for ROUND NECK T-Shirt FRONT View (4" x 4") */
let roundNeckColorBoxConfigFront4x4 = {
  'Black': { xPercent: 36.3, yPercent: 35, boxWidthPx: 43, boxHeightPx: 43 },
  'White': { xPercent: 36.6, yPercent: 36, boxWidthPx: 43, boxHeightPx: 43 },
  'Navy Blue': { xPercent: 36.3, yPercent: 36, boxWidthPx: 43, boxHeightPx: 42 },
  'Grey': { xPercent: 36.2, yPercent: 31, boxWidthPx: 51, boxHeightPx: 51 },
  'Red': { xPercent: 36.3, yPercent: 35.5, boxWidthPx: 41, boxHeightPx: 42 }
};

/* Per-Color Print Box Configurations for ROUND NECK T-Shirt FRONT View (10" x 10") */
let roundNeckColorBoxConfigFront10x10 = {
  'Black': { xPercent: 26, yPercent: 49.85, boxWidthPx: 111, boxHeightPx: 114 },
  'White': { xPercent: 26.25, yPercent: 51, boxWidthPx: 111, boxHeightPx: 112 },
  'Navy Blue': { xPercent: 25.8, yPercent: 50.5, boxWidthPx: 111, boxHeightPx: 112 },
  'Grey': { xPercent: 25.8, yPercent: 50.0, boxWidthPx: 149, boxHeightPx: 145 },
  'Red': { xPercent: 25.8, yPercent: 50.0, boxWidthPx: 111, boxHeightPx: 112 }
};
let roundNeckColorBoxConfigFront12x12 = roundNeckColorBoxConfigFront10x10;

/* Per-Color Print Box Configurations for ROUND NECK T-Shirt BACK View */
let roundNeckColorBoxConfigBack = {
  'Black': { xPercent: 72.75, yPercent: 45, boxWidthPx: 122, boxHeightPx: 123.5 },
  'White': { xPercent: 73.7, yPercent: 45.8, boxWidthPx: 122, boxHeightPx: 127 },
  'Navy Blue': { xPercent: 72.5, yPercent: 45, boxWidthPx: 122, boxHeightPx: 122 },
  'Grey': { xPercent: 72.35, yPercent: 43.5, boxWidthPx: 161, boxHeightPx: 165 },
  'Red': { xPercent: 72.50, yPercent: 45, boxWidthPx: 122, boxHeightPx: 122 }
};

function getColorBoxConfig(map, colorName) {
  if (!map || !colorName) return null;
  if (map[colorName]) return map[colorName];
  const clean = String(colorName).trim().toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    const k = String(key).trim().toLowerCase();
    if (k === clean || k.replace(/\s+/g, '') === clean.replace(/\s+/g, '') || clean.includes(k) || k.includes(clean)) {
      return val;
    }
  }
  return null;
}

window.setRoundNeckFrontBoxMode = function (mode, btnElem) {
  const cleanMode = (mode === '10x10' || mode === '12x12') ? '10x10' : '4x4';
  tshirtState.roundNeckFrontMode = cleanMode;

  document.querySelectorAll('#btn-rn-box-4x4, #btn-rn-box-12x12').forEach(b => b.classList.remove('active'));
  if (btnElem) {
    btnElem.classList.add('active');
  } else {
    const targetBtn = document.getElementById(cleanMode === '4x4' ? 'btn-rn-box-4x4' : 'btn-rn-box-12x12');
    if (targetBtn) targetBtn.classList.add('active');
  }

  const frontBadge = document.getElementById('tshirt-front-print-badge');
  if (frontBadge) {
    frontBadge.innerHTML = `<i class="fa-solid fa-ruler-combined"></i> ${cleanMode === '4x4' ? '4" × 4"' : '10" × 10"'} Front Print Area`;
  }

  if (typeof window.updateBoxPositionForColor === 'function') {
    window.updateBoxPositionForColor(tshirtState.color || 'Black');
  }
  if (typeof applyLogoTransformUI === 'function') {
    applyLogoTransformUI();
  }

  showToast(`Front Print Size: ${cleanMode === '4x4' ? '4" × 4" Left Chest' : '10" × 10" Center Front'}`);
};

window.updateBoxPositionForColor = function (colorName) {
  if (!colorName) return;

  const currentFit = (typeof tshirtState !== 'undefined' && tshirtState.fit) ? tshirtState.fit : 'Polo T Shirts';

  if (currentFit === 'Oversized T-Shirts') {
    // 1. Oversized FRONT Logo Box (Rectangular: 144px x 175px)
    let configFront = getColorBoxConfig(oversizedColorBoxConfigFront, colorName) || { xPercent: 29.35, yPercent: 47, boxWidthPx: 144, boxHeightPx: 175 };

    tshirtLogoPosition.xPercent = configFront.xPercent;
    tshirtLogoPosition.yPercent = configFront.yPercent;
    tshirtLogoPosition.boxWidthPx = configFront.boxWidthPx || 144;
    tshirtLogoPosition.boxHeightPx = configFront.boxHeightPx || 175;
    tshirtLogoPosition.boxSizePx = configFront.boxWidthPx || 144;

    // 2. Oversized BACK Logo Box (Rectangular: 140px x 173px)
    let configBack = getColorBoxConfig(oversizedColorBoxConfigBack, colorName) || { xPercent: 71.48, yPercent: 47, boxWidthPx: 140, boxHeightPx: 173 };

    tshirtLogoPosition2.xPercent = configBack.xPercent;
    tshirtLogoPosition2.yPercent = configBack.yPercent;
    tshirtLogoPosition2.boxWidthPx = configBack.boxWidthPx || 140;
    tshirtLogoPosition2.boxHeightPx = configBack.boxHeightPx || 173;
    tshirtLogoPosition2.boxSizePx = configBack.boxWidthPx || 140;
  } else if (currentFit === 'Rounded Neck' || currentFit === 'Round Neck') {
    const mode = (tshirtState && tshirtState.roundNeckFrontMode) || '4x4';
    const configMap = (mode === '12x12' || mode === '10x10')
      ? (roundNeckColorBoxConfigFront10x10 || roundNeckColorBoxConfigFront12x12)
      : roundNeckColorBoxConfigFront4x4;

    let configFront = getColorBoxConfig(configMap, colorName);
    if (!configFront) {
      configFront = (mode === '12x12' || mode === '10x10')
        ? { xPercent: 26, yPercent: 49.85, boxWidthPx: 151, boxHeightPx: 147.5 }
        : { xPercent: 36.3, yPercent: 30.5, boxWidthPx: 51, boxHeightPx: 51 };
    }

    tshirtLogoPosition.xPercent = configFront.xPercent;
    tshirtLogoPosition.yPercent = configFront.yPercent;
    tshirtLogoPosition.boxWidthPx = configFront.boxWidthPx || 51;
    tshirtLogoPosition.boxHeightPx = configFront.boxHeightPx || 51;
    tshirtLogoPosition.boxSizePx = configFront.boxWidthPx || 51;

    let configBack = getColorBoxConfig(roundNeckColorBoxConfigBack, colorName) || { xPercent: 72.75, yPercent: 43, boxWidthPx: 162, boxHeightPx: 163.5 };

    tshirtLogoPosition2.xPercent = configBack.xPercent;
    tshirtLogoPosition2.yPercent = configBack.yPercent;
    tshirtLogoPosition2.boxWidthPx = configBack.boxWidthPx || 162;
    tshirtLogoPosition2.boxHeightPx = configBack.boxHeightPx || 163.5;
    tshirtLogoPosition2.boxSizePx = configBack.boxWidthPx || 162;
  } else {
    // Standard Polo / Regular T-Shirt Configurations
    let config = getColorBoxConfig(tshirtColorBoxConfig, colorName) || { xPercent: 37.7, yPercent: 41.3, boxSizePx: 49 };

    tshirtLogoPosition.xPercent = config.xPercent;
    tshirtLogoPosition.yPercent = config.yPercent;
    tshirtLogoPosition.boxSizePx = config.boxSizePx || 49;
    tshirtLogoPosition.boxWidthPx = config.boxWidthPx || config.boxSizePx || 49;
    tshirtLogoPosition.boxHeightPx = config.boxHeightPx || config.boxSizePx || 49;

    let configBack = getColorBoxConfig(tshirtColorBoxConfigBack, colorName) || { xPercent: 70, yPercent: 41.5, boxSizePx: 100 };

    tshirtLogoPosition2.xPercent = configBack.xPercent;
    tshirtLogoPosition2.yPercent = configBack.yPercent;
    tshirtLogoPosition2.boxSizePx = configBack.boxSizePx || 100;
    tshirtLogoPosition2.boxWidthPx = configBack.boxWidthPx || configBack.boxSizePx || 100;
    tshirtLogoPosition2.boxHeightPx = configBack.boxHeightPx || configBack.boxSizePx || 100;
  }

  tshirtLogoOffset1.xPx = 0;
  tshirtLogoOffset1.yPx = 0;
  tshirtLogoOffset2.xPx = 0;
  tshirtLogoOffset2.yPx = 0;

  if (typeof applyLogoTransformUI === 'function') {
    applyLogoTransformUI();
  }
};

/* Draggable Logo Containers & Position State */
let tshirtLogoPosition = {
  xPercent: 37.7, // Fixed position X (37.7%)
  yPercent: 41.3, // Fixed position Y (41.3%)
  boxSizePx: 49,  // Exact 49px x 49px Print Box size
  boxWidthPx: 49,
  boxHeightPx: 49,
  scale: 80       // default 80% on UI slider
};

let tshirtLogoPosition2 = {
  xPercent: 72, // default 72% (Back View)
  yPercent: 38, // default 38%
  boxSizePx: 85, // default 85px Back Box size
  boxWidthPx: 85,
  boxHeightPx: 85,
  scale: 80    // default 80% on UI slider
};

let tshirtLogoOffset1 = { xPx: 0, yPx: 0 };
let tshirtLogoOffset2 = { xPx: 0, yPx: 0 };

window.setLogoPositionPreset = function (presetKey, btnElem) {
  if (btnElem) {
    document.querySelectorAll('#custom-mode-view .qty-chip-btn[id^="pos-preset-"]').forEach(b => b.classList.remove('active'));
    btnElem.classList.add('active');
  }

  if (activeEditLogo !== 2) {
    if (presetKey === 'left-chest') {
      tshirtLogoPosition.xPercent = 37.7;
      tshirtLogoPosition.yPercent = 41.3;
      tshirtLogoPosition.scale = 70;
    } else if (presetKey === 'center') {
      tshirtLogoPosition.xPercent = 50;
      tshirtLogoPosition.yPercent = 45;
      tshirtLogoPosition.scale = 100;
    } else if (presetKey === 'right-chest') {
      tshirtLogoPosition.xPercent = 65;
      tshirtLogoPosition.yPercent = 41.3;
      tshirtLogoPosition.scale = 70;
    }
  } else {
    if (presetKey === 'center') {
      tshirtLogoPosition2.xPercent = 72;
      tshirtLogoPosition2.yPercent = 38;
      tshirtLogoPosition2.scale = 100;
    } else if (presetKey === 'upper-back') {
      tshirtLogoPosition2.xPercent = 72;
      tshirtLogoPosition2.yPercent = 28;
      tshirtLogoPosition2.scale = 80;
    } else if (presetKey === 'lower-back') {
      tshirtLogoPosition2.xPercent = 72;
      tshirtLogoPosition2.yPercent = 60;
      tshirtLogoPosition2.scale = 80;
    }
  }

  applyLogoTransformUI();
};

window.updateTshirtArtworkScale = function (val) {
  let scale = parseInt(val, 10) || 80;
  if (scale > 100) scale = 100;
  if (scale < 20) scale = 20;
  if (activeEditLogo === 2) {
    tshirtLogoPosition2.scale = scale;
  } else {
    tshirtLogoPosition.scale = scale;
  }
  if (typeof window.markZoomMirrorDirty === 'function') {
    window.markZoomMirrorDirty();
  }
  applyLogoTransformUI();
};

window.initTshirtMouseWheelLogoZoom = function () {
  const stage = document.getElementById('tshirt-canvas-stage');
  const logo1 = document.getElementById('tshirt-canvas-logo-img');
  const logo2 = document.getElementById('tshirt-canvas-logo-img-2');
  const printBox1 = document.getElementById('tshirt-print-box-4x4');
  const printBox2 = document.getElementById('tshirt-print-box-12x12');
  const container1 = document.getElementById('tshirt-draggable-logo-container');
  const container2 = document.getElementById('tshirt-draggable-logo-container-2');

  const elementsToBind = [stage, logo1, logo2, printBox1, printBox2, container1, container2].filter(Boolean);

  elementsToBind.forEach(elem => {
    if (elem.dataset.wheelZoomInitialized === 'true') return;
    elem.dataset.wheelZoomInitialized = 'true';

    elem.addEventListener('wheel', function (e) {
      const hasLogo1 = tshirtState && tshirtState.artworkDataUrl && tshirtState.artworkDataUrl.length > 0;
      const hasLogo2 = tshirtState && tshirtState.artworkDataUrl2 && tshirtState.artworkDataUrl2.length > 0;
      if (!hasLogo1 && !hasLogo2) return;

      // Prevent page scrolling while using mouse wheel over logo or canvas
      e.preventDefault();
      e.stopPropagation();

      // Determine target logo (Logo 1 or Logo 2)
      let targetLogo = activeEditLogo || 1;
      if (elem.id === 'tshirt-canvas-logo-img-2' || elem.id === 'tshirt-draggable-logo-container-2' || elem.id === 'tshirt-print-box-12x12') {
        if (hasLogo2) {
          targetLogo = 2;
          if (typeof setActiveEditLogo === 'function') {
            const btn2 = document.getElementById('btn-edit-logo-2');
            if (btn2) setActiveEditLogo(2, btn2);
          }
        }
      } else if (elem.id === 'tshirt-canvas-logo-img' || elem.id === 'tshirt-draggable-logo-container') {
        if (hasLogo1) {
          targetLogo = 1;
          if (typeof setActiveEditLogo === 'function') {
            const btn1 = document.getElementById('btn-edit-logo-1');
            if (btn1) setActiveEditLogo(1, btn1);
          }
        }
      }

      const posObj = (targetLogo === 2) ? tshirtLogoPosition2 : tshirtLogoPosition;
      const currentScale = (posObj && posObj.scale) ? posObj.scale : 80;

      // Mouse wheel UP (deltaY < 0): Increase logo size
      // Mouse wheel DOWN (deltaY > 0): Decrease logo size
      const step = 4;
      let newScale = currentScale;

      if (e.deltaY < 0) {
        newScale = Math.min(100, currentScale + step);
      } else if (e.deltaY > 0) {
        newScale = Math.max(20, currentScale - step);
      }

      if (newScale !== currentScale) {
        activeEditLogo = targetLogo;
        window.updateTshirtArtworkScale(newScale);
      }
    }, { passive: false });
  });
};

window.updateLogoPosX = function (val) {
  const pos = parseInt(val, 10) || 50;
  if (typeof activeEditLogo !== 'undefined' && activeEditLogo === 2) {
    if (typeof tshirtLogoPosition2 !== 'undefined') tshirtLogoPosition2.xPercent = pos;
  } else {
    if (typeof tshirtLogoPosition !== 'undefined') tshirtLogoPosition.xPercent = pos;
  }
  if (typeof window.markZoomMirrorDirty === 'function') {
    window.markZoomMirrorDirty();
  }
  if (typeof applyLogoTransformUI === 'function') {
    applyLogoTransformUI();
  }
};

window.updateLogoPosY = function (val) {
  const pos = parseInt(val, 10) || 50;
  if (typeof activeEditLogo !== 'undefined' && activeEditLogo === 2) {
    if (typeof tshirtLogoPosition2 !== 'undefined') tshirtLogoPosition2.yPercent = pos;
  } else {
    if (typeof tshirtLogoPosition !== 'undefined') tshirtLogoPosition.yPercent = pos;
  }
  if (typeof window.markZoomMirrorDirty === 'function') {
    window.markZoomMirrorDirty();
  }
  if (typeof applyLogoTransformUI === 'function') {
    applyLogoTransformUI();
  }
};

function selectQtyChip(elem) {
  if (!elem) return;
  document.querySelectorAll('#custom-mode-view .qty-chip-btn').forEach(btn => btn.classList.remove('active'));
  elem.classList.add('active');
  showToast(`Qty Selected: ${elem.textContent.trim()}`);
}

function selectFinishOption(finishKey, targetElem) {
  document.querySelectorAll('#custom-mode-view .finish-option-card').forEach(c => {
    c.classList.remove('is-selected');
  });
  if (targetElem) {
    targetElem.classList.add('is-selected');
  }
}

function selectDraggableItem(targetElem) {
  document.querySelectorAll('#tshirt-draggable-logo-container, #tshirt-draggable-logo-container-2, #tshirt-draggable-text-container').forEach(el => {
    el.classList.remove('is-selected');
  });
  if (targetElem) {
    targetElem.classList.add('is-selected');
  }
}

function applyLogoTransformUI() {
  const currentFit = (typeof tshirtState !== 'undefined' && tshirtState.fit) ? tshirtState.fit : 'Polo T Shirts';

  const badgeElem = document.getElementById('tshirt-front-print-badge');
  const badgeBackElem = document.getElementById('tshirt-back-print-badge');

  if (currentFit === 'Oversized T-Shirts') {
    if (badgeElem) badgeElem.innerHTML = '<i class="fa-solid fa-ruler-combined"></i> 12" × 12" Front Print Area';
    if (badgeBackElem) badgeBackElem.innerHTML = '<i class="fa-solid fa-ruler-combined"></i> 12" × 12" Back Print Area';
    if (!tshirtLogoPosition.boxWidthPx) tshirtLogoPosition.boxWidthPx = 144;
    if (!tshirtLogoPosition.boxHeightPx) tshirtLogoPosition.boxHeightPx = 175;
    if (!tshirtLogoPosition2.boxWidthPx) tshirtLogoPosition2.boxWidthPx = 140;
    if (!tshirtLogoPosition2.boxHeightPx) tshirtLogoPosition2.boxHeightPx = 173;
  } else if (currentFit === 'Rounded Neck' || currentFit === 'Round Neck') {
    const mode = (tshirtState && tshirtState.roundNeckFrontMode) || '4x4';
    if (badgeElem) {
      badgeElem.innerHTML = `<i class="fa-solid fa-ruler-combined"></i> ${mode === '10x10' || mode === '12x12' ? '10" × 10"' : '10" × 10"'} Front Print Area`;
    }
    if (badgeBackElem) {
      badgeBackElem.innerHTML = '<i class="fa-solid fa-ruler-combined"></i> 10" × 10" Back Print Area';
    }
    if (!tshirtLogoPosition.boxWidthPx) tshirtLogoPosition.boxWidthPx = 72;
    if (!tshirtLogoPosition.boxHeightPx) tshirtLogoPosition.boxHeightPx = 72;
    if (!tshirtLogoPosition2.boxWidthPx) tshirtLogoPosition2.boxWidthPx = 210;
    if (!tshirtLogoPosition2.boxHeightPx) tshirtLogoPosition2.boxHeightPx = 210;
  } else {
    if (badgeElem) badgeElem.innerHTML = '<i class="fa-solid fa-ruler-combined"></i> 4" × 4" Front Print Area';
    if (badgeBackElem) badgeBackElem.innerHTML = '<i class="fa-solid fa-ruler-combined"></i> 10" × 10" Back Print Area';
    if (!tshirtLogoPosition.boxWidthPx) tshirtLogoPosition.boxWidthPx = 49;
    if (!tshirtLogoPosition.boxHeightPx) tshirtLogoPosition.boxHeightPx = 49;
    if (!tshirtLogoPosition2.boxWidthPx) tshirtLogoPosition2.boxWidthPx = 85;
    if (!tshirtLogoPosition2.boxHeightPx) tshirtLogoPosition2.boxHeightPx = 85;
  }

  const container = document.getElementById('tshirt-draggable-logo-container');
  if (container) {
    container.style.left = `${tshirtLogoPosition.xPercent}%`;
    container.style.top = `${tshirtLogoPosition.yPercent}%`;
  }

  const container2 = document.getElementById('tshirt-draggable-logo-container-2');
  if (container2) {
    container2.style.left = `${tshirtLogoPosition2.xPercent}%`;
    container2.style.top = `${tshirtLogoPosition2.yPercent}%`;
  }

  const containerText = document.getElementById('tshirt-draggable-text-container');
  if (containerText) {
    containerText.style.left = `${tshirtTextPosition.xPercent}%`;
    containerText.style.top = `${tshirtTextPosition.yPercent}%`;
  }

  const stage = document.getElementById('tshirt-canvas-stage-wrapper') || document.getElementById('tshirt-photo-canvas-container');
  const stageWidth = (stage && stage.offsetWidth > 50) ? stage.offsetWidth : 540;
  const stageScale = stageWidth / 540;

  const baseW1 = tshirtLogoPosition.boxWidthPx || tshirtLogoPosition.boxSizePx || 49;
  const baseH1 = tshirtLogoPosition.boxHeightPx || tshirtLogoPosition.boxSizePx || 49;
  const boxW1 = Math.max(20, Math.round(baseW1 * stageScale));
  const boxH1 = Math.max(20, Math.round(baseH1 * stageScale));

  const printBox = document.getElementById('tshirt-print-box-4x4');
  if (printBox) {
    printBox.style.setProperty('width', `${boxW1}px`, 'important');
    printBox.style.setProperty('height', `${boxH1}px`, 'important');
    printBox.style.setProperty('min-width', `${boxW1}px`, 'important');
    printBox.style.setProperty('min-height', `${boxH1}px`, 'important');
    printBox.style.setProperty('max-width', `${boxW1}px`, 'important');
    printBox.style.setProperty('max-height', `${boxH1}px`, 'important');
  }

  const baseW2 = tshirtLogoPosition2.boxWidthPx || tshirtLogoPosition2.boxSizePx || 85;
  const baseH2 = tshirtLogoPosition2.boxHeightPx || tshirtLogoPosition2.boxSizePx || 85;
  const boxW2 = Math.max(20, Math.round(baseW2 * stageScale));
  const boxH2 = Math.max(20, Math.round(baseH2 * stageScale));

  const printBox2 = document.getElementById('tshirt-print-box-12x12');
  if (printBox2) {
    printBox2.style.setProperty('width', `${boxW2}px`, 'important');
    printBox2.style.setProperty('height', `${boxH2}px`, 'important');
    printBox2.style.setProperty('min-width', `${boxW2}px`, 'important');
    printBox2.style.setProperty('min-height', `${boxH2}px`, 'important');
    printBox2.style.setProperty('max-width', `${boxW2}px`, 'important');
    printBox2.style.setProperty('max-height', `${boxH2}px`, 'important');
    printBox2.style.setProperty('overflow', 'hidden', 'important');
    printBox2.style.setProperty('box-sizing', 'border-box', 'important');
  }

  const logoImg = document.getElementById('tshirt-canvas-logo-img');
  if (logoImg) {
    const scaleFactor1 = (tshirtLogoPosition.scale / 100) * 1.60;
    const pxSize1 = Math.round(boxW1 * scaleFactor1);
    logoImg.style.width = `${pxSize1}px`;
    logoImg.style.height = `${pxSize1}px`;
    logoImg.style.minWidth = `${pxSize1}px`;
    logoImg.style.minHeight = `${pxSize1}px`;
    logoImg.style.maxWidth = 'none';
    logoImg.style.maxHeight = 'none';
    logoImg.style.transform = `translate(${tshirtLogoOffset1.xPx}px, ${tshirtLogoOffset1.yPx}px)`;
    logoImg.style.cursor = 'grab';
    logoImg.style.pointerEvents = 'auto';
  }

  const logoImg2 = document.getElementById('tshirt-canvas-logo-img-2');
  if (logoImg2) {
    const scaleFactor2 = (tshirtLogoPosition2.scale / 100) * 1.60;
    const pxSize2 = Math.round(boxW2 * scaleFactor2);
    logoImg2.style.setProperty('width', `${pxSize2}px`, 'important');
    logoImg2.style.setProperty('height', `${pxSize2}px`, 'important');
    logoImg2.style.setProperty('min-width', `${pxSize2}px`, 'important');
    logoImg2.style.setProperty('min-height', `${pxSize2}px`, 'important');
    logoImg2.style.setProperty('max-width', '100%', 'important');
    logoImg2.style.setProperty('max-height', '100%', 'important');
    logoImg2.style.setProperty('object-fit', 'contain', 'important');
    logoImg2.style.transform = `translate(${tshirtLogoOffset2.xPx}px, ${tshirtLogoOffset2.yPx}px)`;
    logoImg2.style.cursor = 'grab';
    logoImg2.style.pointerEvents = 'auto';
  }

  // Sync sliders to whichever logo is currently selected (Logo 1 = Front, Logo 2 = Back)
  const currentPos = (activeEditLogo === 2) ? tshirtLogoPosition2 : tshirtLogoPosition;

  const scaleSlider = document.getElementById('tshirt-artwork-scale-slider');
  if (scaleSlider) {
    scaleSlider.min = 20;
    scaleSlider.max = 100;
    scaleSlider.value = currentPos.scale;
  }
  const scalePercent = document.getElementById('tshirt-artwork-scale-percent');
  if (scalePercent) scalePercent.textContent = `${currentPos.scale}%`;

  const posXSlider = document.getElementById('tshirt-artwork-posx-slider');
  if (posXSlider) posXSlider.value = currentPos.xPercent;
  const posXVal = document.getElementById('tshirt-artwork-posx-val');
  if (posXVal) posXVal.textContent = `${currentPos.xPercent}%`;

  const posYSlider = document.getElementById('tshirt-artwork-posy-slider');
  if (posYSlider) posYSlider.value = currentPos.yPercent;
  const posYVal = document.getElementById('tshirt-artwork-posy-val');
  if (posYVal) posYVal.textContent = `${currentPos.yPercent}%`;

  // Directly update existing mirror clone elements if present in DOM, otherwise mark dirty
  const mirrorClone = document.getElementById('tshirt-stage-mirror-clone');
  if (mirrorClone) {
    const mirrorLogo1 = mirrorClone.querySelector('#tshirt-draggable-logo-container');
    if (mirrorLogo1) {
      mirrorLogo1.style.left = `${tshirtLogoPosition.xPercent}%`;
      mirrorLogo1.style.top = `${tshirtLogoPosition.yPercent}%`;
    }
    const mirrorBox1 = mirrorClone.querySelector('#tshirt-print-box-4x4');
    if (mirrorBox1 && printBox) {
      mirrorBox1.style.width = printBox.style.width;
      mirrorBox1.style.height = printBox.style.height;
      mirrorBox1.style.minWidth = printBox.style.minWidth;
      mirrorBox1.style.minHeight = printBox.style.minHeight;
      mirrorBox1.style.maxWidth = printBox.style.maxWidth;
      mirrorBox1.style.maxHeight = printBox.style.maxHeight;
    }
    const mirrorImg1 = mirrorClone.querySelector('#tshirt-canvas-logo-img');
    if (mirrorImg1 && logoImg) {
      mirrorImg1.style.width = logoImg.style.width;
      mirrorImg1.style.height = logoImg.style.height;
      mirrorImg1.style.minWidth = logoImg.style.minWidth;
      mirrorImg1.style.minHeight = logoImg.style.minHeight;
      mirrorImg1.style.maxWidth = logoImg.style.maxWidth;
      mirrorImg1.style.maxHeight = logoImg.style.maxHeight;
      if (logoImg.src) mirrorImg1.src = logoImg.src;
      mirrorImg1.style.display = logoImg.style.display;
      mirrorImg1.style.transform = logoImg.style.transform;
    }

    const mirrorLogo2 = mirrorClone.querySelector('#tshirt-draggable-logo-container-2');
    if (mirrorLogo2) {
      mirrorLogo2.style.left = `${tshirtLogoPosition2.xPercent}%`;
      mirrorLogo2.style.top = `${tshirtLogoPosition2.yPercent}%`;
    }
    const mirrorBox2 = mirrorClone.querySelector('#tshirt-print-box-12x12');
    if (mirrorBox2 && printBox2) {
      mirrorBox2.style.width = printBox2.style.width;
      mirrorBox2.style.height = printBox2.style.height;
      mirrorBox2.style.minWidth = printBox2.style.minWidth;
      mirrorBox2.style.minHeight = printBox2.style.minHeight;
      mirrorBox2.style.maxWidth = printBox2.style.maxWidth;
      mirrorBox2.style.maxHeight = printBox2.style.maxHeight;
    }
    const mirrorImg2 = mirrorClone.querySelector('#tshirt-canvas-logo-img-2');
    if (mirrorImg2 && logoImg2) {
      mirrorImg2.style.width = logoImg2.style.width;
      mirrorImg2.style.height = logoImg2.style.height;
      mirrorImg2.style.minWidth = logoImg2.style.minWidth;
      mirrorImg2.style.minHeight = logoImg2.style.minHeight;
      mirrorImg2.style.maxWidth = logoImg2.style.maxWidth;
      mirrorImg2.style.maxHeight = logoImg2.style.maxHeight;
      if (logoImg2.src) mirrorImg2.src = logoImg2.src;
      mirrorImg2.style.display = logoImg2.style.display;
      mirrorImg2.style.transform = logoImg2.style.transform;
    }

    const mirrorText = mirrorClone.querySelector('#tshirt-draggable-text-container');
    if (mirrorText) {
      mirrorText.style.left = `${tshirtTextPosition.xPercent}%`;
      mirrorText.style.top = `${tshirtTextPosition.yPercent}%`;
    }
  } else {
    if (typeof window.markZoomMirrorDirty === 'function') {
      window.markZoomMirrorDirty();
    }
  }

  if (typeof window.syncCanvasZoomMirror === 'function') {
    window.syncCanvasZoomMirror();
  }
  if (typeof window.initTshirtMouseWheelLogoZoom === 'function') {
    window.initTshirtMouseWheelLogoZoom();
  }
  if (typeof window.updateLogoCountButtonLabels === 'function') {
    window.updateLogoCountButtonLabels();
  }
}

// Auto-resync print box dimensions when the browser window or stage container resizes
window.addEventListener('resize', function () {
  if (typeof applyLogoTransformUI === 'function') {
    applyLogoTransformUI();
  }
});
if (window.ResizeObserver) {
  window.addEventListener('DOMContentLoaded', function () {
    const stageElem = document.getElementById('tshirt-canvas-stage-wrapper') || document.getElementById('tshirt-photo-canvas-container');
    if (stageElem) {
      new ResizeObserver(function () {
        if (typeof applyLogoTransformUI === 'function') {
          applyLogoTransformUI();
        }
      }).observe(stageElem);
    }
  });
}

function setupSingleDrag(dragElem, stateObj) {
  const stageElem = document.getElementById('tshirt-photo-canvas-container');
  if (!dragElem || !stageElem) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeftPercent = stateObj.xPercent;
  let startTopPercent = stateObj.yPercent;

  function onDragStart(e) {
    isDragging = true;
    window.isDraggingLogo = true;
    dragElem.style.cursor = 'grabbing';
    selectDraggableItem(dragElem);



    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    startLeftPercent = stateObj.xPercent;
    startTopPercent = stateObj.yPercent;

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    if (!isDragging) return;
    if (e.touches && e.cancelable) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = stageElem.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;

    let newX = Math.min(88, Math.max(12, startLeftPercent + deltaXPercent));
    let newY = Math.min(88, Math.max(12, startTopPercent + deltaYPercent));

    stateObj.xPercent = Math.round(newX);
    stateObj.yPercent = Math.round(newY);

    if (typeof window.markZoomMirrorDirty === 'function') {
      window.markZoomMirrorDirty();
    }
    applyLogoTransformUI();
  }

  function onDragEnd() {
    if (isDragging) {
      isDragging = false;
      window.isDraggingLogo = false;
      dragElem.style.cursor = 'grab';
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
    }
  }

  dragElem.addEventListener('mousedown', onDragStart);
  dragElem.addEventListener('touchstart', onDragStart, { passive: false });
}

function setupLogoInnerDrag(logoImgElem, offsetObj, logoIndex) {
  if (!logoImgElem) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;

  function onDragStart(e) {
    if (logoImgElem.style.display === 'none') return;
    e.stopPropagation();
    isDragging = true;
    window.isDraggingLogo = true;
    logoImgElem.style.cursor = 'grabbing';
    const parentContainer = (logoIndex === 2) ? document.getElementById('tshirt-draggable-logo-container-2') : document.getElementById('tshirt-draggable-logo-container');
    selectDraggableItem(parentContainer);
    if (typeof setActiveEditLogo === 'function') {
      setActiveEditLogo(logoIndex, e);
    }



    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    startOffsetX = offsetObj.xPx || 0;
    startOffsetY = offsetObj.yPx || 0;

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    if (!isDragging) return;
    if (e.touches && e.cancelable) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    offsetObj.xPx = Math.round(startOffsetX + deltaX);
    offsetObj.yPx = Math.round(startOffsetY + deltaY);

    if (typeof window.markZoomMirrorDirty === 'function') {
      window.markZoomMirrorDirty();
    }
    applyLogoTransformUI();
  }

  function onDragEnd() {
    if (isDragging) {
      isDragging = false;
      window.isDraggingLogo = false;
      logoImgElem.style.cursor = 'grab';
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
    }
  }

  logoImgElem.addEventListener('mousedown', onDragStart);
  logoImgElem.addEventListener('touchstart', onDragStart, { passive: false });
}

let tshirtTextPosition = {
  xPercent: 35,
  yPercent: 62
};

function initLogoDragAndDrop() {
  const dragElem1 = document.getElementById('tshirt-draggable-logo-container');
  const dragElem2 = document.getElementById('tshirt-draggable-logo-container-2');
  const dragElemText = document.getElementById('tshirt-draggable-text-container');

  const logoImg1 = document.getElementById('tshirt-canvas-logo-img');
  const logoImg2 = document.getElementById('tshirt-canvas-logo-img-2');

  // Print Boxes 1 (Front) & 2 (Back) locations are fixed per color (non-draggable)
  if (dragElem1) dragElem1.style.cursor = 'default';
  if (dragElem2) dragElem2.style.cursor = 'default';

  // Logo images are draggable inside their print boxes with strict overflow clipping
  if (logoImg1) setupLogoInnerDrag(logoImg1, tshirtLogoOffset1, 1);
  if (logoImg2) setupLogoInnerDrag(logoImg2, tshirtLogoOffset2, 2);

  if (dragElemText) setupSingleDrag(dragElemText, tshirtTextPosition);

  // Click outside listener to hide badges when clicking off the T-shirt!
  const stageCanvas = document.getElementById('tshirt-photo-canvas-container');
  if (stageCanvas) {
    stageCanvas.addEventListener('click', function (e) {
      if (!e.target.closest('#tshirt-draggable-logo-container, #tshirt-draggable-logo-container-2, #tshirt-draggable-text-container')) {
        selectDraggableItem(null);
      }
    });
  }
}

window.uploadArtworkToShopifyCDN = async function (file, context = 1) {
  let nameElem = null;
  if (context === 1 || context === 2) {
    nameElem = document.getElementById(`tshirt-artwork-file-name-${context}`);
  } else if (context === 'sticker') {
    nameElem = document.getElementById('artwork-file-name');
  } else if (context === 'cap') {
    nameElem = document.getElementById('cap-file-name-text');
  } else if (context === 'gift') {
    nameElem = document.getElementById('gift-artwork-file-name');
  }

  const origText = nameElem ? nameElem.textContent : '';
  if (nameElem) {
    nameElem.textContent = `${file.name} (Uploading to CDN... ⏳)`;
  }
  try {
    const uploadUrl = window.SHOPIFY_CDN_UPLOAD_ENDPOINT || '/apps/elementa-upload';
    const formData = new FormData();
    formData.append('file', file, file.name);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        if (context === 1) {
          tshirtState.artworkCdnUrl = data.url;
        } else if (context === 2) {
          tshirtState.artworkCdnUrl2 = data.url;
        } else if (context === 'sticker' && typeof stickerState !== 'undefined') {
          stickerState.artworkCdnUrl = data.url;
        } else if (context === 'cap' && typeof capState !== 'undefined') {
          capState.artworkCdnUrl = data.url;
        } else if (context === 'gift' && typeof giftState !== 'undefined') {
          giftState.artworkCdnUrl = data.url;
        }
        if (nameElem) {
          nameElem.textContent = `${file.name} (Uploaded ✓)`;
        }
        console.log(`[Shopify CDN] Uploaded file for ${context}:`, data.url);
        return data.url;
      }
    }
  } catch (err) {
    console.warn(`[Shopify CDN] Upload background notice for ${context}:`, err);
  }
  if (nameElem) {
    nameElem.textContent = origText || file.name;
  }
  return null;
};

window.handleTshirtFileUploadNum = function (num, input) {
  if (num === 2 && !tshirtState.hasBackPrint) {
    showToast("🔒 Please turn ON 'Add Back Print (+₹100/pc)' switch above first to enable Back Print uploads!");
    if (input) input.value = '';
    const toggleCheckbox = document.getElementById('tshirt-back-print-toggle');
    if (toggleCheckbox) {
      toggleCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    // Trigger CDN upload in background
    if (typeof window.uploadArtworkToShopifyCDN === 'function') {
      window.uploadArtworkToShopifyCDN(file, num);
    }

    const onFileReady = function (dataUrl) {
      if (num === 1) {
        tshirtState.artworkFile = file.name;
        tshirtState.artworkDataUrl = dataUrl;
        tshirtState.rawFile = file;

        const logoImg1 = document.getElementById('tshirt-canvas-logo-img');
        if (logoImg1) {
          logoImg1.src = dataUrl;
          logoImg1.style.display = 'block';
          logoImg1.style.animation = 'fadeIn 0.4s ease';
        }
        const thumb1 = document.getElementById('tshirt-artwork-thumb-preview-1');
        if (thumb1) thumb1.src = dataUrl;
        const nameElem1 = document.getElementById('tshirt-artwork-file-name-1');
        if (nameElem1) nameElem1.textContent = `Image 1: ${file.name}`;
        const row1 = document.getElementById('artwork-info-row-1');
        if (row1) row1.style.display = 'flex';
      } else {
        tshirtState.artworkFile2 = file.name;
        tshirtState.artworkDataUrl2 = dataUrl;
        tshirtState.rawFile2 = file;

        const logoImg2 = document.getElementById('tshirt-canvas-logo-img-2');
        if (logoImg2) {
          logoImg2.src = dataUrl;
          logoImg2.style.display = 'block';
          logoImg2.style.animation = 'fadeIn 0.4s ease';
        }
        const thumb2 = document.getElementById('tshirt-artwork-thumb-preview-2');
        if (thumb2) thumb2.src = dataUrl;
        const nameElem2 = document.getElementById('tshirt-artwork-file-name-2');
        if (nameElem2) nameElem2.textContent = `Image 2: ${file.name}`;
        const row2 = document.getElementById('artwork-info-row-2');
        if (row2) row2.style.display = 'flex';

        // Auto activate 2 Logos view
        setTshirtLogoCount(2);
      }

      const card = document.getElementById('tshirt-uploaded-artwork-card');
      if (card) card.style.display = 'block';

      switchTshirtGalleryViewMode('canvas');
      if (typeof window.markZoomMirrorDirty === 'function') window.markZoomMirrorDirty();
      applyLogoTransformUI();
      if (typeof window.updateLogoUploadStepUI === 'function') window.updateLogoUploadStepUI();
      if (typeof window.updateAuthCheckboxVisibility === 'function') window.updateAuthCheckboxVisibility();
      showToast(`Uploaded Image ${num}: "${file.name}" rendered on T-Shirt!`);
    };

    if (isPdf && typeof window.generatePdfPreviewDataUrl === 'function') {
      onFileReady(window.generatePdfPreviewDataUrl(file.name));
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        onFileReady(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
};

window.removeTshirtUploadedArtworkNum = function (num) {
  if (num === 1) {
    tshirtState.artworkFile = null;
    tshirtState.artworkDataUrl = null;
    tshirtState.artworkCdnUrl = null;
    const logoImg1 = document.getElementById('tshirt-canvas-logo-img');
    if (logoImg1) { logoImg1.style.display = 'none'; logoImg1.src = ''; }
    const row1 = document.getElementById('artwork-info-row-1');
    if (row1) row1.style.display = 'none';
    const input1 = document.getElementById('tshirt-file-input-1');
    if (input1) input1.value = '';
  } else {
    tshirtState.artworkFile2 = null;
    tshirtState.artworkDataUrl2 = null;
    tshirtState.artworkCdnUrl2 = null;
    const logoImg2 = document.getElementById('tshirt-canvas-logo-img-2');
    if (logoImg2) { logoImg2.style.display = 'none'; logoImg2.src = ''; }
    const row2 = document.getElementById('artwork-info-row-2');
    if (row2) row2.style.display = 'none';
    const input2 = document.getElementById('tshirt-file-input-2');
    if (input2) input2.value = '';
  }

  if (!tshirtState.artworkDataUrl && !tshirtState.artworkDataUrl2) {
    const card = document.getElementById('tshirt-uploaded-artwork-card');
    if (card) card.style.display = 'none';
  }

  if (typeof window.updateLogoUploadStepUI === 'function') window.updateLogoUploadStepUI();
  if (typeof window.markZoomMirrorDirty === 'function') window.markZoomMirrorDirty();
  if (typeof window.syncCanvasZoomMirror === 'function') window.syncCanvasZoomMirror();
  if (typeof window.updateAuthCheckboxVisibility === 'function') window.updateAuthCheckboxVisibility();

  showToast(`Image ${num} removed`);
};

window.updateTshirtCustomText = function (val) {
  tshirtState.customText = val || '';
  const textContainer = document.getElementById('tshirt-draggable-text-container');
  const textDisplay = document.getElementById('tshirt-canvas-text-display');

  if (textDisplay) {
    textDisplay.textContent = val;
  }
  if (textContainer) {
    if (val && val.trim().length > 0) {
      textContainer.style.display = 'flex';
      textContainer.style.animation = 'fadeIn 0.3s ease';
    } else {
      textContainer.style.display = 'none';
    }
  }

  if (typeof window.markZoomMirrorDirty === 'function') window.markZoomMirrorDirty();
  if (typeof window.syncCanvasZoomMirror === 'function') window.syncCanvasZoomMirror();
  if (typeof window.updateAuthCheckboxVisibility === 'function') window.updateAuthCheckboxVisibility();
};

window.updateTshirtCustomTextColor = function (colorHex, btnElem) {
  tshirtState.textColor = colorHex;
  const textDisplay = document.getElementById('tshirt-canvas-text-display');
  const picker = document.getElementById('tshirt-text-color-picker');

  if (textDisplay) {
    textDisplay.style.color = colorHex;
    if (colorHex.toLowerCase() === '#ffffff') {
      textDisplay.style.textShadow = '0 2px 6px rgba(0,0,0,0.95)';
    } else {
      textDisplay.style.textShadow = '0 1px 4px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.85)';
    }
  }

  if (picker) {
    picker.value = colorHex;
  }

  if (btnElem) {
    document.querySelectorAll('.text-color-swatch-btn').forEach(b => {
      b.classList.remove('active');
      b.style.outline = 'none';
    });
    btnElem.classList.add('active');
    btnElem.style.outline = '3px solid #be123c';
  }

  if (typeof window.markZoomMirrorDirty === 'function') window.markZoomMirrorDirty();
  if (typeof window.syncCanvasZoomMirror === 'function') window.syncCanvasZoomMirror();

  showToast(`Text Color changed to ${colorHex}`);
};

window.recalculateTshirtPrice = function () {
  const TSHIRT_SLABS = [
    { min: 1, max: 2, discount: 0, label: '2 pcs' },
    { min: 3, max: 4, discount: 0.11, label: '3–4 pcs' },
    { min: 5, max: 9, discount: 0.24, label: '5–9 pcs' },
    { min: 10, max: 19, discount: 0.27, label: '10–19 pcs' },
    { min: 20, max: 29, discount: 0.32, label: '20–29 pcs' },
    { min: 30, max: 49, discount: 0.35, label: '30–49 pcs' },
    { min: 50, max: 75, discount: 0.40, label: '50–75 pcs' },
    { min: 76, max: 9999, discount: 0.43, label: '76–100 pcs' }
  ];

  let baseUnitPrice = 625.00; // Polo default base unit (Without back print)
  const fitClean = (tshirtState.fit || '').toLowerCase();
  if (fitClean.includes('oversiz')) {
    baseUnitPrice = 799.00;
  } else if (fitClean.includes('round')) {
    baseUnitPrice = 599.00;
  } else {
    baseUnitPrice = 625.00;
  }

  // Add back print surcharge (+₹100/pc) ONLY if toggle is checked
  const hasBackPrint = !!tshirtState.hasBackPrint;
  tshirtState.hasBackPrint = hasBackPrint;
  if (hasBackPrint) {
    baseUnitPrice += 100.00;
  }

  const minAllowed = fitClean.includes('oversiz') ? 1 : 2;
  const qty = Math.max(minAllowed, tshirtState.targetQty || minAllowed);
  tshirtState.targetQty = qty;

  // Sync Custom Quantity Input Field
  const customInput = document.getElementById('elementa-custom-total-qty-input');
  if (customInput && document.activeElement !== customInput) {
    customInput.value = qty;
  }

  // Find active slab index
  let activeSlabIndex = 0;
  for (let i = 0; i < TSHIRT_SLABS.length; i++) {
    if (qty >= TSHIRT_SLABS[i].min && qty <= TSHIRT_SLABS[i].max) {
      activeSlabIndex = i;
      break;
    }
  }
  if (qty >= 76) activeSlabIndex = 7;

  const activeDiscount = TSHIRT_SLABS[activeSlabIndex].discount;
  const calculatedUnitPrice = Math.round(baseUnitPrice * (1 - activeDiscount));
  const totalPrice = Math.round(calculatedUnitPrice * qty);

  tshirtState.unitPrice = calculatedUnitPrice;
  tshirtState.totalPrice = totalPrice;

  // 1. Update Progress Tracker Line Fill & Milestone Node States
  const progressFill = document.getElementById('elementa-tracker-progress-fill');
  if (progressFill) {
    const pct = Math.min(100, Math.max(0, (activeSlabIndex / (TSHIRT_SLABS.length - 1)) * 100));
    progressFill.style.width = `${pct}%`;
  }

  const nodes = document.querySelectorAll('.elementa-milestones-row .elementa-milestone-node');
  nodes.forEach((node, idx) => {
    const priceSpan = node.querySelector('.node-price');
    if (priceSpan && TSHIRT_SLABS[idx]) {
      const slabUnit = Math.round(baseUnitPrice * (1 - TSHIRT_SLABS[idx].discount));
      priceSpan.textContent = `₹${slabUnit}`;
    }

    if (idx === activeSlabIndex) {
      node.classList.add('active');
      node.classList.remove('passed');
    } else if (idx < activeSlabIndex) {
      node.classList.remove('active');
      node.classList.add('passed');
    } else {
      node.classList.remove('active');
      node.classList.remove('passed');
    }
  });

  // Auto-scroll active milestone into center on mobile
  if (nodes && nodes[activeSlabIndex]) {
    try {
      nodes[activeSlabIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (e) { }
  }

  // 1b. Update Tier Grid Cards Unit Prices and Active State if present
  const tierCards = document.querySelectorAll('#tshirt-tier-grid .elementa-tier-card');
  tierCards.forEach((card, idx) => {
    if (idx < TSHIRT_SLABS.length) {
      const slab = TSHIRT_SLABS[idx];
      const slabUnit = Math.round(baseUnitPrice * (1 - slab.discount));
      const unitElem = card.querySelector('.elementa-tier-unit');
      if (unitElem) unitElem.textContent = `₹${slabUnit} / pc`;

      if (idx === activeSlabIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
  });

  // 2. Update Dynamic Price & Summary Banner
  const unitPriceElem = document.getElementById('tshirt-summary-unit-price');
  if (unitPriceElem) unitPriceElem.textContent = `₹${calculatedUnitPrice} / pc`;

  const totalPriceElem = document.getElementById('tshirt-summary-total-price');
  if (totalPriceElem) totalPriceElem.textContent = `₹${totalPrice.toLocaleString('en-IN')} Total`;

  const saveTagElem = document.getElementById('tshirt-summary-save-tag');
  if (saveTagElem) {
    const pct = Math.round(activeDiscount * 100);
    if (pct > 0) {
      saveTagElem.textContent = `SAVE ${pct}% OFF`;
      saveTagElem.style.background = '#f97316';
    } else {
      saveTagElem.textContent = `BASE PRICE`;
      saveTagElem.style.background = '#64748b';
    }
  }

  // 3. Update Dynamic Upsell Nudge Bar
  const nudgeBar = document.getElementById('tshirt-upsell-nudge-bar');
  const nudgeText = document.getElementById('tshirt-nudge-text');
  const nudgeBtn = document.getElementById('tshirt-nudge-btn');

  if (activeSlabIndex < TSHIRT_SLABS.length - 1) {
    const nextSlab = TSHIRT_SLABS[activeSlabIndex + 1];
    const deltaQty = nextSlab.min - qty;
    const nextUnitPrice = Math.round(baseUnitPrice * (1 - nextSlab.discount));
    const perPieceSavings = Math.max(1, calculatedUnitPrice - nextUnitPrice);

    if (nudgeText) {
      nudgeText.textContent = `Add ${deltaQty} more piece${deltaQty > 1 ? 's' : ''} — pay ₹${nextUnitPrice}/pc and save ₹${perPieceSavings} on every piece!`;
    }
    if (nudgeBtn) {
      nudgeBtn.textContent = `+ Add ${deltaQty} More`;
      nudgeBtn.setAttribute('data-delta', deltaQty);
      nudgeBtn.style.display = 'inline-block';
    }
    if (nudgeBar) nudgeBar.style.display = 'flex';
  } else {
    if (nudgeText) {
      nudgeText.textContent = `🎉 You've unlocked our MAXIMUM 43% OFF bulk tier rate!`;
    }
    if (nudgeBtn) nudgeBtn.style.display = 'none';
    if (nudgeBar) nudgeBar.style.display = 'flex';
  }

  // 4. Update Header Top Price Card
  const topPriceNum = document.getElementById('tshirt-top-price-num');
  if (topPriceNum) topPriceNum.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;

  const topMrpNum = document.getElementById('tshirt-top-mrp-num');
  if (topMrpNum) {
    const baseMrp = Math.round(baseUnitPrice * 1.2 * qty);
    topMrpNum.textContent = `₹${baseMrp.toLocaleString('en-IN')}`;
  }

  const saveBadge = document.getElementById('tshirt-top-save-badge');
  if (saveBadge) {
    const pct = Math.round(activeDiscount * 100);
    saveBadge.textContent = pct > 0 ? `SAVE ${pct}%` : `BASE PRICE`;
  }

  // 5. Update Allocated Size Counter
  const countElem = document.getElementById('allocated-size-count');
  const totalAllocated = Object.values(tshirtState.sizeDistribution).reduce((a, b) => a + b, 0);
  if (countElem) {
    countElem.textContent = `${totalAllocated}/${qty} Selected`;
    countElem.style.color = totalAllocated === qty ? '#15803d' : '#dc2626';
  }

  // 6. Update Add to Cart Button CTA
  const addBtn = document.getElementById('btn-add-tshirt-cart');
  if (addBtn) {
    const fitTitle = tshirtState.fit || 'Custom T-Shirt';
    addBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add ${fitTitle} to Cart • ₹${totalPrice.toLocaleString('en-IN')}`;
  }
};

window.updateAuthCheckboxVisibility = function () {
  const authBox = document.getElementById('tshirt-auth-step-box');
  if (!authBox) return;

  const hasLogo1 = tshirtState.artworkDataUrl && tshirtState.artworkDataUrl.length > 0;
  const hasLogo2 = tshirtState.artworkDataUrl2 && tshirtState.artworkDataUrl2.length > 0;
  const hasText = tshirtState.customText && tshirtState.customText.trim().length > 0;

  if (hasLogo1 || hasLogo2 || hasText) {
    authBox.style.display = 'block';
  } else {
    authBox.style.display = 'none';
    const checkbox = document.getElementById('tshirt-auth-checkbox');
    if (checkbox) checkbox.checked = false;
  }
  if (typeof window.toggleTshirtAddToCartState === 'function') {
    window.toggleTshirtAddToCartState();
  }
};

window.toggleTshirtAddToCartState = function () {
  const authBox = document.getElementById('tshirt-auth-step-box');
  const checkbox = document.getElementById('tshirt-auth-checkbox');
  const addBtn = document.getElementById('btn-add-tshirt-cart');
  if (!addBtn) return;

  const isOversized = tshirtState && (tshirtState.fit === 'Oversized T-Shirts' || tshirtState.fit === 'Oversized');
  const minQty = isOversized ? 1 : 2;

  // 1. Logo uploaded check
  const hasLogo1 = tshirtState && tshirtState.artworkDataUrl && tshirtState.artworkDataUrl.length > 0;
  const hasLogo2 = tshirtState && tshirtState.artworkDataUrl2 && tshirtState.artworkDataUrl2.length > 0;
  const hasLogo = hasLogo1 || hasLogo2;

  if (authBox) {
    if (hasLogo) {
      authBox.style.display = 'block';
    } else {
      authBox.style.display = 'none';
      if (checkbox) checkbox.checked = false;
    }
  }

  // 2. Authorization checkbox checked
  const isChecked = checkbox && checkbox.checked;

  // 3. Quantity selected check
  const targetQty = (tshirtState && tshirtState.targetQty) ? tshirtState.targetQty : 0;
  const hasValidQty = targetQty >= minQty;

  // 4. Size allocation check
  const sizeDist = (tshirtState && tshirtState.sizeDistribution) ? tshirtState.sizeDistribution : {};
  const totalAllocated = Object.values(sizeDist).reduce((a, b) => a + b, 0);

  const isSizeAllocated = totalAllocated === targetQty && totalAllocated >= minQty;

  // ALL CONDITIONS MUST BE MET TO ENABLE THE BUTTON
  const isEnabled = hasLogo && isChecked && hasValidQty && isSizeAllocated;

  if (isEnabled) {
    addBtn.removeAttribute('disabled');
    addBtn.disabled = false;
    addBtn.style.setProperty('opacity', '1', 'important');
    addBtn.style.setProperty('cursor', 'pointer', 'important');
    addBtn.style.setProperty('pointer-events', 'auto', 'important');
    addBtn.style.setProperty('box-shadow', '0 8px 20px rgba(20, 61, 28, 0.3)', 'important');
    addBtn.style.setProperty('filter', 'none', 'important');
    addBtn.style.setProperty('background', '#143d1c', 'important');
  } else {
    addBtn.setAttribute('disabled', 'disabled');
    addBtn.disabled = true;
    addBtn.style.setProperty('opacity', '0.45', 'important');
    addBtn.style.setProperty('cursor', 'not-allowed', 'important');
    addBtn.style.setProperty('pointer-events', 'none', 'important');
    addBtn.style.setProperty('box-shadow', 'none', 'important');
    addBtn.style.setProperty('filter', 'grayscale(0.6)', 'important');
    addBtn.style.setProperty('background', '#94a3b8', 'important');
  }
};

window.addTshirtToCart = function () {
  const authBox = document.getElementById('tshirt-auth-step-box');
  const isAuthBoxVisible = authBox && authBox.style.display !== 'none';
  const checkbox = document.getElementById('tshirt-auth-checkbox');
  if (isAuthBoxVisible && checkbox && !checkbox.checked) {
    showToast('Please accept the design authorization checkbox to proceed.');
    return;
  }

  const isOversized = tshirtState && (tshirtState.fit === 'Oversized T-Shirts' || tshirtState.fit === 'Oversized');
  const minQty = isOversized ? 1 : 2;
  const qty = Math.max(minQty, tshirtState.targetQty || minQty);
  const totalPrice = tshirtState.totalPrice || 1250;
  const unitPrice = tshirtState.unitPrice || Math.round(totalPrice / qty);

  const breakdownParts = [];
  Object.keys(tshirtState.sizeDistribution).forEach(sizeKey => {
    const count = tshirtState.sizeDistribution[sizeKey];
    if (count > 0) {
      breakdownParts.push(`${count}x ${sizeKey}`);
    }
  });

  const sizeSummary = breakdownParts.length > 0 ? breakdownParts.join(', ') : 'Default Size';
  const backPrintStr = (tshirtState.hasBackPrint || tshirtState.logoCount === 2) ? 'With Back Print' : 'No Back Print';
  const specialInstrStr = tshirtState.specialInstructions ? ` [Note: ${tshirtState.specialInstructions}]` : '';

  const hasBackPrint = (tshirtState.hasBackPrint || tshirtState.logoCount === 2);
  const fitLower = String(tshirtState.fit || '').toLowerCase();
  let customVariantId = '52875689427076';
  if (fitLower.includes('polo')) {
    customVariantId = hasBackPrint ? '52875687231620' : '52875687067780';
  } else if (fitLower.includes('oversiz')) {
    customVariantId = hasBackPrint ? '52875686379652' : '52875686215812';
  } else {
    customVariantId = hasBackPrint ? '52875689590916' : '52875689427076';
  }

  // Determine Front and Back Print Sizes across all 3 customized T-Shirt styles
  let frontPrintSize = '4" × 4" (Left Chest)';
  let backPrintSize = hasBackPrint ? '10" × 10" (Center Back)' : 'None';

  if (fitLower.includes('oversiz')) {
    frontPrintSize = '12" × 12" (Center Front)';
    backPrintSize = hasBackPrint ? '12" × 12" (Center Back)' : 'None';
  } else if (fitLower.includes('round')) {
    const rnMode = (tshirtState && tshirtState.roundNeckFrontMode) || '4x4';
    frontPrintSize = (rnMode === '10x10' || rnMode === '12x12') ? '10" × 10" (Center Front)' : '4" × 4" (Left Chest)';
    backPrintSize = hasBackPrint ? '10" × 10" (Center Back)' : 'None';
  } else {
    // Polo T-Shirts
    frontPrintSize = '4" × 4" (Left Chest)';
    backPrintSize = hasBackPrint ? '10" × 10" (Center Back)' : 'None';
  }

  const itemName = `Custom ${tshirtState.fit || 'T-Shirt'} (${tshirtState.color}, Front: ${frontPrintSize}, ${backPrintStr}, ${tshirtState.finish}) - ${qty} Pcs [${sizeSummary}]${specialInstrStr}`;

  const imgUrl = tshirtState.artworkDataUrl || 'assets/tshirt-main-dtg.jpg';

  const customProperties = {
    'T-Shirt Fit': tshirtState.fit,
    'Color': tshirtState.color,
    'Front Print Size': frontPrintSize,
    'Back Print': backPrintStr,
    'Size Breakdown': sizeSummary,
    'Unit Price': `₹${unitPrice.toLocaleString('en-IN')}`,
    'Total Price': `₹${totalPrice.toLocaleString('en-IN')}`,
    'Special Instructions': tshirtState.specialInstructions || 'None'
  };

  if (hasBackPrint) {
    customProperties['Back Print Size'] = backPrintSize;
  }

  if (tshirtState.artworkCdnUrl) {
    customProperties['Front Artwork'] = tshirtState.artworkCdnUrl;
  } else if (tshirtState.rawFile) {
    customProperties['Front Artwork'] = tshirtState.rawFile;
  } else if (tshirtState.artworkFile) {
    customProperties['Front Artwork'] = tshirtState.artworkFile;
  }

  if (tshirtState.artworkCdnUrl2) {
    customProperties['Back Artwork'] = tshirtState.artworkCdnUrl2;
  } else if (tshirtState.rawFile2) {
    customProperties['Back Artwork'] = tshirtState.rawFile2;
  } else if (tshirtState.artworkFile2) {
    customProperties['Back Artwork'] = tshirtState.artworkFile2;
  }

  handleAddToCart({
    id: 'custom_tshirt_' + Date.now(),
    mappedVariantId: customVariantId,
    name: itemName,
    price: `₹${unitPrice.toLocaleString('en-IN')}`,
    img: imgUrl,
    quantity: qty,
    properties: customProperties
  });
};

window.getSizeChartAsset = function (fitKey) {
  let filename = 'size-chart-roundneck.png';
  const clean = (fitKey || '').toString().toLowerCase();

  if (clean.includes('oversize')) {
    filename = 'size-chart-oversized.png';
  } else if (clean.includes('polo')) {
    filename = 'size-chart-polo.png';
  } else if (clean.includes('round') || clean.includes('rounded')) {
    filename = 'size-chart-roundneck.png';
  }

  if (typeof window.getShopifyAsset === 'function') {
    return window.getShopifyAsset(filename);
  }
  if (window.shopifyAssetMap && window.shopifyAssetMap[filename]) {
    return window.shopifyAssetMap[filename];
  }
  return 'assets/' + filename;
};

window.updateSizeChartForCurrentFit = function (customFit) {
  let fit = customFit || (typeof tshirtState !== 'undefined' && tshirtState ? tshirtState.fit : '');

  if (!fit) {
    const handle = (window.shopifyProductHandle || window.location.pathname || '').toLowerCase();
    if (handle.includes('oversize')) fit = 'Oversized T-Shirts';
    else if (handle.includes('polo')) fit = 'Polo T Shirts';
    else if (handle.includes('round')) fit = 'Rounded Neck';
  }

  const imgUrl = window.getSizeChartAsset(fit);

  // Update expandable card image
  const expandImg = document.getElementById('size-chart-expand-img') || document.getElementById('size-chart-img');
  if (expandImg) {
    expandImg.src = imgUrl;
  }

  // Update banner section image
  const bannerImg = document.getElementById('size-chart-banner-img') || document.querySelector('.size-chart-banner-section img');
  if (bannerImg) {
    bannerImg.src = imgUrl;
  }

  // Update card title
  const titleElem = document.getElementById('size-chart-card-title') || document.getElementById('size-chart-title');
  if (titleElem) {
    let fitLabel = 'Round Neck';
    const cleanFit = (fit || '').toLowerCase();
    if (cleanFit.includes('oversize')) fitLabel = 'Oversized';
    else if (cleanFit.includes('polo')) fitLabel = 'Polo';
    else if (cleanFit.includes('round')) fitLabel = 'Round Neck';

    titleElem.innerHTML = `<i class="fa-solid fa-ruler-combined" style="color: #0284c7;"></i> ${fitLabel} T-Shirt Size Chart Guide (Inches)`;
  }
};

window.toggleSizeChartCard = function () {
  window.updateSizeChartForCurrentFit();
  const box = document.getElementById('size-chart-expand-box');
  if (box) {
    box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
  }
};

const tshirtDefaultThumbs = [
  'assets/polo-black.jpg',
  'assets/tshirt-screen-print.jpg',
  'assets/tshirt-hoodie-embroidery.jpg',
  'assets/tshirt-polo-shirt.jpg'
];

window.changeTshirtImageIndex = function (idx) {
  currentTshirtImgIndex = idx;

  const mainImg = document.getElementById('tshirt-main-product-img');
  if (mainImg) {
    const thumbs = document.querySelectorAll('#tshirt-gallery-thumbs-container .gallery-thumb-card img');
    let targetSrc = '';
    if (thumbs && thumbs[idx]) {
      targetSrc = thumbs[idx].getAttribute('src');
    } else if (tshirtDefaultThumbs[idx]) {
      targetSrc = tshirtDefaultThumbs[idx];
    }

    if (targetSrc) {
      const finalSrc = window.getShopifyAsset ? window.getShopifyAsset(targetSrc) : targetSrc;
      mainImg.src = finalSrc;
      mainImg.style.animation = 'none';
      void mainImg.offsetWidth;
      mainImg.style.animation = 'fadeIn 0.4s ease';

      const resultBox = document.getElementById('tshirt-zoom-result-box');
      if (resultBox && tshirtState.viewMode !== 'canvas') {
        resultBox.style.backgroundImage = `url('${finalSrc}')`;
      }
    }
  }

  const dots = document.querySelectorAll('#tshirt-gallery-dots-container .gallery-dot');
  dots.forEach((dot, i) => {
    if (i === idx) dot.classList.add('active');
    else dot.classList.remove('active');
  });

  const thumbCards = document.querySelectorAll('#tshirt-gallery-thumbs-container .gallery-thumb-card');
  thumbCards.forEach((thumb, i) => {
    if (i === idx) thumb.classList.add('active');
    else thumb.classList.remove('active');
  });
};

window.filterTshirtCatalog = function (cat, elem) {
  document.querySelectorAll('.inbuilt-filter-btn').forEach(b => b.classList.remove('active'));
  if (elem) elem.classList.add('active');

  const target = (cat || 'all').toLowerCase().trim();

  document.querySelectorAll('#inbuilt-tshirt-catalog-grid .inbuilt-product-card').forEach(card => {
    const cardCat = (card.getAttribute('data-category') || card.dataset.category || '').toLowerCase();
    const cardText = (card.textContent || '').toLowerCase();

    if (target === 'all' || cardCat.includes(target) || cardText.includes(target)) {
      card.style.display = 'flex';
      card.style.animation = 'fadeIn 0.3s ease';
    } else {
      card.style.display = 'none';
    }
  });
};

window.switchStickerMode = function (mode) {
  const btnInbuilt = document.getElementById('tab-btn-inbuilt');
  const btnCustom = document.getElementById('tab-btn-custom');
  if (!btnInbuilt && !btnCustom) return;

  const inbuiltView = document.getElementById('inbuilt-mode-view');
  const customView = document.getElementById('custom-mode-view');
  if (!inbuiltView || !customView) return;

  if (mode === 'custom') {
    inbuiltView.classList.remove('active');
    inbuiltView.style.display = 'none';
    customView.classList.add('active');
    customView.style.display = 'block';
    if (btnInbuilt) {
      btnInbuilt.classList.remove('active');
      btnInbuilt.style.background = 'transparent';
      btnInbuilt.style.color = 'var(--dark-main)';
    }
    if (btnCustom) {
      btnCustom.classList.add('active');
      btnCustom.style.background = '#A8D4B0';
      btnCustom.style.color = '#143d1c';
    }
    window.location.hash = 'custom';
    if (typeof window.syncProductConfigHeight === 'function') {
      setTimeout(window.syncProductConfigHeight, 30);
      setTimeout(window.syncProductConfigHeight, 150);
    }
  } else {
    customView.classList.remove('active');
    customView.style.display = 'none';
    inbuiltView.classList.add('active');
    inbuiltView.style.display = 'block';
    if (btnCustom) {
      btnCustom.classList.remove('active');
      btnCustom.style.background = 'transparent';
      btnCustom.style.color = 'var(--dark-main)';
    }
    if (btnInbuilt) {
      btnInbuilt.classList.add('active');
      btnInbuilt.style.background = '#A8D4B0';
      btnInbuilt.style.color = '#143d1c';
    }
    if (typeof window.shuffleInbuiltStickers === 'function') {
      window.shuffleInbuiltStickers();
    }
    window.location.hash = 'inbuilt';
  }
};

window.switchTshirtPageMode = function (mode) {
  const btnInbuilt = document.getElementById('btn-mode-inbuilt');
  const btnCustom = document.getElementById('btn-mode-custom');
  if (!btnInbuilt && !btnCustom) return;

  const inbuiltView = document.getElementById('inbuilt-mode-view');
  const singleView = document.getElementById('single-product-mode-view');
  const customView = document.getElementById('custom-mode-view');
  const extraSections = document.querySelectorAll('.size-chart-banner-section, .order-process-banner-section, .about-brand-section, .related-products-section');

  if (!inbuiltView || !customView) return;

  const heroBanner = document.querySelector('.stickers-hero-banner');
  if (heroBanner) heroBanner.style.display = 'block';
  extraSections.forEach(sec => sec.style.display = 'block');
  if (singleView) {
    singleView.style.display = 'none';
    singleView.classList.remove('active');
  }

  if (mode === 'custom') {
    inbuiltView.classList.remove('active');
    inbuiltView.style.display = 'none';
    customView.classList.add('active');
    customView.style.display = 'block';
    if (btnInbuilt) {
      btnInbuilt.classList.remove('active');
      btnInbuilt.style.background = 'transparent';
      btnInbuilt.style.color = 'var(--dark-main)';
    }
    if (btnCustom) {
      btnCustom.classList.add('active');
      btnCustom.style.background = '#A8D4B0';
      btnCustom.style.color = '#143d1c';
    }
    window.location.hash = 'custom';
    if (typeof window.syncProductConfigHeight === 'function') {
      setTimeout(window.syncProductConfigHeight, 30);
      setTimeout(window.syncProductConfigHeight, 150);
    }
  } else {
    customView.classList.remove('active');
    customView.style.display = 'none';
    inbuiltView.classList.add('active');
    inbuiltView.style.display = 'block';
    if (btnCustom) {
      btnCustom.classList.remove('active');
      btnCustom.style.background = 'transparent';
      btnCustom.style.color = 'var(--dark-main)';
    }
    if (btnInbuilt) {
      btnInbuilt.classList.add('active');
      btnInbuilt.style.background = '#A8D4B0';
      btnInbuilt.style.color = '#143d1c';
    }
    window.location.hash = 'inbuilt';
  }
};

window.currentStickerMainCategory = 'all';
window.currentStickerSubCategory = 'all';

window.shuffleInbuiltStickers = function (force) {
  try {
    const grid = document.getElementById('inbuilt-catalog-grid');
    if (!grid) return;
    if (window.__inbuiltStickersShuffled && !force) return;
    const cards = Array.from(grid.querySelectorAll('.inbuilt-product-card'));
    if (cards.length <= 1) return;

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }

    const frag = document.createDocumentFragment();
    cards.forEach(card => frag.appendChild(card));
    grid.appendChild(frag);
    window.__inbuiltStickersShuffled = true;
  } catch (err) {
    console.warn('Inbuilt sticker shuffle error:', err);
  }
};

window.filterInbuiltMainCategory = function (category, btnElement) {
  window.currentStickerMainCategory = category;
  window.currentStickerSubCategory = 'all';

  document.querySelectorAll('.inbuilt-chip-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'transparent';
    btn.style.color = 'var(--dark-main)';
  });
  if (btnElement) {
    btnElement.classList.add('active');
    btnElement.style.background = '#A8D4B0';
    btnElement.style.color = '#143d1c';
  }

  const subCatBar = document.getElementById('uv-dtf-subcategories-bar');
  if (subCatBar) {
    subCatBar.style.display = 'none';
  }
  window.currentStickerSubCategory = 'all';

  window.applyInbuiltStickerFilter();
};

window.filterInbuiltSubCategory = function (subCategory, btnElement) {
  window.currentStickerSubCategory = subCategory;

  const subCatBar = document.getElementById('uv-dtf-subcategories-bar');
  if (subCatBar) {
    subCatBar.querySelectorAll('.inbuilt-subchip-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.background = '#ffffff';
      btn.style.color = 'var(--dark-main)';
    });
  }

  if (btnElement) {
    btnElement.classList.add('active');
    btnElement.style.background = '#00b894';
    btnElement.style.color = '#ffffff';
  }

  window.applyInbuiltStickerFilter();
};

window.filterInbuiltCategory = function (category, btnElement) {
  window.filterInbuiltMainCategory(category, btnElement);
};

window.applyInbuiltStickerFilter = function () {
  const mainCat = window.currentStickerMainCategory || 'all';
  const subCat = window.currentStickerSubCategory || 'all';
  const searchVal = (document.getElementById('inbuilt-search-input')?.value || '').toLowerCase().trim();

  const cards = document.querySelectorAll('#inbuilt-catalog-grid .inbuilt-product-card');
  cards.forEach(card => {
    const cardMain = card.dataset.category || '';
    const cardSub = card.dataset.subcategory || '';
    const title = card.querySelector('.inbuilt-card-title')?.textContent.toLowerCase() || '';
    const catText = card.querySelector('.inbuilt-card-category')?.textContent.toLowerCase() || '';

    let matchMain = (mainCat === 'all' || cardMain === mainCat);
    let matchSub = (subCat === 'all' || cardSub === subCat);
    let matchSearch = (!searchVal || title.includes(searchVal) || catText.includes(searchVal));

    if (matchMain && matchSub && matchSearch) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};

window.filterInbuiltSearch = function (query) {
  window.applyInbuiltStickerFilter();
};

window.selectInbuiltPack = function (chipElement, price) {
  const parent = chipElement.closest('.inbuilt-product-card');
  if (!parent) return;
  parent.querySelectorAll('.inbuilt-pack-opt').forEach(opt => opt.classList.remove('active'));
  chipElement.classList.add('active');
  const priceElem = parent.querySelector('.card-price-num');
  if (priceElem) priceElem.textContent = price;
};

window.selectInbuiltSize = function (element) {
  const parent = element.closest('.inbuilt-pack-selector');
  if (!parent) return;
  parent.querySelectorAll('.inbuilt-pack-opt').forEach(opt => opt.classList.remove('active'));
  element.classList.add('active');
};

window.addInbuiltCardToCart = function (btnElement) {
  const card = btnElement.closest('.inbuilt-product-card');
  if (!card) return;
  const title = card.querySelector('.inbuilt-card-title')?.textContent.trim() || 'Item';
  const packOpt = card.querySelector('.inbuilt-pack-opt.active')?.textContent.trim() || '';
  const imgUrl = card.querySelector('.inbuilt-card-media img')?.src || '';

  let priceNum = 0;
  const priceNumElem = card.querySelector('.card-price-num');
  if (priceNumElem) {
    priceNum = parseFloat(priceNumElem.textContent.replace(/,/g, '')) || 0;
  }

  if (priceNum <= 0) {
    const priceTagElem = card.querySelector('.inbuilt-price-tag');
    if (priceTagElem) {
      const clone = priceTagElem.cloneNode(true);
      clone.querySelectorAll('strike, del, s, style, script, .strike, .original-price').forEach(el => el.remove());
      const cleanText = clone.textContent.replace(/[^0-9.]/g, '');
      priceNum = parseFloat(cleanText) || 0;
    }
  }

  if (priceNum < 300) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('hangry') || lowerTitle.includes('naruto') || lowerTitle.includes('one piece') || lowerTitle.includes('pink panther') || lowerTitle.includes('999')) priceNum = 999;
    else if (lowerTitle.includes('hoodie') || lowerTitle.includes('sweatshirt')) priceNum = 1299;
    else if (lowerTitle.includes('oversiz')) priceNum = 799;
    else if (lowerTitle.includes('graphic') || lowerTitle.includes('organic') || lowerTitle.includes('dtg')) priceNum = 499;
    else if (lowerTitle.includes('round')) priceNum = 599;
    else if (lowerTitle.includes('polo')) priceNum = 625;
    else if (lowerTitle.includes('sticker') || lowerTitle.includes('dtf')) priceNum = 150;
    else if (lowerTitle.includes('cap')) priceNum = 250;
    else priceNum = 799;
  }

  handleAddToCart({
    id: `inbuilt-${Date.now()}`,
    name: packOpt ? `${title} (${packOpt})` : title,
    price: `₹${priceNum.toLocaleString('en-IN')}`,
    img: imgUrl,
    quantity: 1
  });
};

/* ==========================================================================
   In-Built Sticker Quick-View Modal Controller
   ========================================================================== */
window.currentInbuiltModalProduct = null;

window.openInbuiltStickerModal = function (cardElement) {
  if (!cardElement) return;

  let rawTitle = cardElement.querySelector('.inbuilt-card-title')?.textContent.trim() || 'Custom Sticker';
  const title = rawTitle.replace(/trasfer/gi, 'Transfer');
  const category = cardElement.querySelector('.inbuilt-card-category')?.textContent.trim() || 'Sticker';
  const reviews = cardElement.querySelector('.inbuilt-rating-stars span')?.textContent.trim() || '(24 reviews)';
  const priceText = cardElement.querySelector('.card-price-num')?.textContent.trim() || '150';
  const mainImgSrc = cardElement.querySelector('.inbuilt-card-media img')?.src || '';
  let basePriceNum = parseFloat(priceText.replace(/,/g, '')) || 0;
  if (basePriceNum < 100) basePriceNum = 150;

  window.currentInbuiltModalProduct = {
    title: title,
    category: category,
    basePrice: basePriceNum,
    mainImg: mainImgSrc,
    selectedQty: 1
  };

  // Populate Modal Fields
  const titleElem = document.getElementById('inbuilt-modal-title');
  if (titleElem) titleElem.textContent = title;

  const catElem = document.getElementById('inbuilt-modal-category');
  if (catElem) catElem.textContent = category;

  const revElem = document.getElementById('inbuilt-modal-reviews');
  if (revElem) revElem.textContent = `(4.9 ★ • ${reviews.replace(/[()]/g, '')})`;

  const priceElem = document.getElementById('inbuilt-modal-price');
  if (priceElem) priceElem.textContent = `₹${basePriceNum.toLocaleString('en-IN')}`;

  const mainImgElem = document.getElementById('inbuilt-modal-main-img');
  if (mainImgElem) {
    mainImgElem.src = mainImgSrc;
    mainImgElem.alt = title;
  }

  // Dynamic Category Description & Features List
  const catKey = (cardElement.getAttribute('data-category') || category || '').toLowerCase();
  const isMugCategory = catKey.includes('mug');
  const isTumblerCategory = catKey.includes('tumbler');
  const hasAddonOption = isMugCategory || isTumblerCategory;
  let cardVariantId = cardElement.getAttribute('data-variant-id') || null;
  if (!cardVariantId && typeof inbuiltProductVariantMap !== 'undefined' && inbuiltProductVariantMap) {
    if (inbuiltProductVariantMap[title]) {
      cardVariantId = inbuiltProductVariantMap[title];
    } else {
      const normLookup = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mapKeys = Object.keys(inbuiltProductVariantMap).filter(k => k.length > 4);
      for (const k of mapKeys) {
        const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normLookup.includes(normK) || normK.includes(normLookup)) {
          cardVariantId = inbuiltProductVariantMap[k];
          break;
        }
      }
    }
  }

  window.currentInbuiltModalProduct = {
    title: title,
    category: category,
    basePrice: basePriceNum,
    mainImg: mainImgSrc,
    variantId: cardVariantId,
    selectedQty: 1,
    isMugCategory: isMugCategory,
    isTumblerCategory: isTumblerCategory,
    includeMugAddon: false,
    applicationPreference: 'Pre-Applied'
  };

  // Toggle Mug/Tumbler Option Wrapper visibility & update labels
  const mugWrapper = document.getElementById('inbuilt-modal-mug-options-wrapper');
  const addonLabelElem = document.getElementById('inbuilt-modal-addon-label-text');
  const addonBadgeElem = document.getElementById('inbuilt-modal-addon-badge-text');
  const appWrapper = document.getElementById('inbuilt-modal-application-wrapper');
  const preDescElem = document.getElementById('inbuilt-app-preapplied-desc');
  const diyDescElem = document.getElementById('inbuilt-app-diykit-desc');

  if (mugWrapper) {
    if (hasAddonOption) {
      mugWrapper.style.display = 'block';
      const sheetRadio = document.querySelector('input[name="inbuilt_mug_option"][value="sheet_only"]');
      if (sheetRadio) sheetRadio.checked = true;

      const vesselWord = isTumblerCategory ? 'tumbler' : 'mug';

      if (isTumblerCategory) {
        if (addonLabelElem) addonLabelElem.textContent = 'Add Tumbler (+₹200)';
        if (addonBadgeElem) addonBadgeElem.textContent = 'Glass Tumbler';
      } else {
        if (addonLabelElem) addonLabelElem.textContent = 'Add Mug (+₹200)';
        if (addonBadgeElem) addonBadgeElem.textContent = 'Ceramic Mug';
      }

      // Update descriptions dynamically (strictly tumbler or mug, never both!)
      if (preDescElem) preDescElem.textContent = `Sticker applied to your ${vesselWord}.`;
      if (diyDescElem) diyDescElem.textContent = `Receive the sticker and ${vesselWord} separately; apply it yourself.`;

      // Hide sub-options initially because sheet_only is selected by default
      if (appWrapper) appWrapper.style.display = 'none';

      // Reset application radio to Pre-Applied
      const preRadio = document.querySelector('input[name="inbuilt_app_pref"][value="Pre-Applied"]');
      if (preRadio) preRadio.checked = true;

      // Reset card borders
      const lblSheet = document.getElementById('lbl-mug-opt-sheet');
      const lblMug = document.getElementById('lbl-mug-opt-withmug');
      if (lblSheet) {
        lblSheet.style.borderColor = '#00b894';
        lblSheet.style.borderWidth = '2px';
        lblSheet.style.background = '#f0fdf4';
      }
      if (lblMug) {
        lblMug.style.borderColor = '#e2e8f0';
        lblMug.style.borderWidth = '1.5px';
        lblMug.style.background = '#ffffff';
      }
      const lblPre = document.getElementById('lbl-app-preapplied');
      const lblDiy = document.getElementById('lbl-app-diykit');
      if (lblPre) {
        lblPre.style.borderColor = '#00b894';
        lblPre.style.borderWidth = '2px';
        lblPre.style.background = '#f0fdf4';
      }
      if (lblDiy) {
        lblDiy.style.borderColor = '#e2e8f0';
        lblDiy.style.borderWidth = '1.5px';
        lblDiy.style.background = '#ffffff';
      }
    } else {
      mugWrapper.style.display = 'none';
      if (appWrapper) appWrapper.style.display = 'none';
    }
  }

  let descHtml = '';
  let features = [];
  let noteHtml = '';

  if (catKey.includes('tumbler')) {
    descHtml = `
      <p style="margin: 0 0 10px 0;">Give your tumblers a personalised touch with our ready-to-apply UV DTF transfer stickers. Use the complete design as shown, or cut out individual elements from the sheet and arrange them however you like.</p>
      <p style="margin: 0 0 10px 0;">Perfect for tumblers, bottles, mugs, glassware and other smooth, hard surfaces.</p>
      <p style="margin: 0 0 10px 0; font-weight: 700; color: #0f172a;">How it works: Cut → Peel → Position → Rub → Peel</p>
    `;
    features = [
      '✓ Ready to Apply',
      '✓ No Heat or Special Equipment Required',
      '✓ Suitable for Smooth, Hard Surfaces'
    ];
    noteHtml = `<i class="fa-solid fa-circle-info" style="color: #f97316;"></i> <strong>Please note:</strong> ₹150 includes the UV DTF transfer sheet only. The tumbler shown in the preview is not included and can be added separately for ₹200.`;
  } else if (isMugCategory) {
    descHtml = `
      <p style="margin: 0 0 10px 0;">Give your mugs a personalised touch with our ready-to-apply UV DTF transfers. Apply the complete design or cut out individual elements and arrange them your way.</p>
      <p style="margin: 0 0 10px 0;">Perfect for mugs, tumblers, bottles, glassware and other smooth, hard surfaces.</p>
      <p style="margin: 0 0 10px 0; font-weight: 700; color: #0f172a;">How it works: Cut → Peel → Position → Rub → Peel</p>
    `;
    features = [
      '✓ Ready to Apply',
      '✓ No Heat or Special Equipment Required',
      '✓ Suitable for Smooth, Hard Surfaces'
    ];
    noteHtml = `<i class="fa-solid fa-circle-info" style="color: #f97316;"></i> <strong>Please note:</strong> ₹150 includes the UV DTF transfer sheet only. The mug shown in the preview is not included and can be added separately for ₹200.`;
  } else {
    descHtml = `
      <p style="margin: 0 0 8px 0;">Give your everyday items a personalised touch with our UV DTF transfer stickers. Use the complete design, or cut out individual elements from the sheet and arrange them however you like.</p>
      <p style="margin: 0 0 8px 0;">Perfect for tumblers, bottles, mugs, glassware, jars and other smooth, hard surfaces. Simply cut, peel, position, press and transfer. No heat or special equipment required.</p>
      <p style="margin: 0; font-weight: 700; color: #0f172a;">One sheet, endless ways to make it yours.</p>
    `;
    features = [
      '✓ Premium Waterproof & Scratch-Resistant UV DTF Transfer',
      '✓ Easy 3-Step Application: Peel, Stick & Rub',
      '✓ High-Gloss Finish & Vibrant Long-Lasting Colors',
      '✓ Strong Adhesive — Perfect for Tumblers, Mugs, Glassware & Water Bottles'
    ];
  }

  const descTextElem = document.getElementById('inbuilt-modal-desc-text');
  if (descTextElem) descTextElem.innerHTML = descHtml;

  const descListElem = document.getElementById('inbuilt-modal-desc-list');
  if (descListElem) {
    descListElem.innerHTML = features.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('');
  }

  const descNoteElem = document.getElementById('inbuilt-modal-desc-note');
  if (descNoteElem) {
    if (noteHtml) {
      descNoteElem.innerHTML = `<div style="padding: 10px 14px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 10px; font-size: 12px; color: #9a3412; font-weight: 600;">${noteHtml}</div>`;
      descNoteElem.style.display = 'block';
    } else {
      descNoteElem.innerHTML = '';
      descNoteElem.style.display = 'none';
    }
  }

  // Handle Thumbnails Gallery (deduplicated by filename)
  const thumbsContainer = document.getElementById('inbuilt-modal-thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    const images = [];
    const seenFilenames = new Set();

    const addImageUrl = (url) => {
      if (!url) return;
      const cleanUrl = url.trim();
      if (!cleanUrl) return;
      const filename = cleanUrl.split('?')[0].split('#')[0].split('/').pop().toLowerCase();
      if (filename && !seenFilenames.has(filename)) {
        seenFilenames.add(filename);
        images.push(cleanUrl);
      }
    };

    // 1. Add main image
    addImageUrl(mainImgSrc);

    // 2. Add data-images from card if available
    const dataImgs = cardElement.getAttribute('data-images');
    if (dataImgs) {
      dataImgs.split(',').forEach(url => addImageUrl(url));
    }

    // 3. Ensure 2nd sizing guide photo is included for all Tumbler & Mug items in pop-up modal
    const catLower = ((cardElement.getAttribute('data-category') || '') + ' ' + (category || '')).toLowerCase();
    const isTumbler = catLower.includes('tumbler');
    const isMug = catLower.includes('mug');

    if (isTumbler) {
      const guideUrl = (typeof window.getShopifyAsset === 'function') ? window.getShopifyAsset('tumbler-sizing-guide.png') : 'assets/tumbler-sizing-guide.png';
      addImageUrl(guideUrl);
    } else if (isMug) {
      const guideUrl = (typeof window.getShopifyAsset === 'function') ? window.getShopifyAsset('mug-sizing-guide.png') : 'assets/mug-sizing-guide.png';
      addImageUrl(guideUrl);
    }

    if (images.length > 1) {
      images.forEach((imgUrl, idx) => {
        const thumbBtn = document.createElement('div');
        thumbBtn.style.cssText = `width: 54px; height: 54px; border-radius: 10px; border: 2px solid ${idx === 0 ? '#00b894' : '#cbd5e1'}; overflow: hidden; cursor: pointer; background: #ffffff; transition: all 0.2s ease;`;
        thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: contain;">`;
        thumbBtn.onclick = function () {
          window.switchInbuiltModalImage(this, imgUrl);
        };
        thumbsContainer.appendChild(thumbBtn);
      });
      thumbsContainer.style.display = 'flex';
    } else {
      thumbsContainer.style.display = 'none';
    }
  }

  // Reset Quantity
  const qtyInput = document.getElementById('inbuilt-modal-qty-input');
  if (qtyInput) qtyInput.value = "1";

  // Reset chips active state
  document.querySelectorAll('.inbuilt-modal-qty-chip').forEach((chip, idx) => {
    if (idx === 0) {
      chip.classList.add('active');
      chip.style.background = '#A8D4B0';
      chip.style.color = '#143d1c';
    } else {
      chip.classList.remove('active');
      chip.style.background = '#ffffff';
      chip.style.color = '#334155';
    }
  });

  // Display Backdrop Modal
  const backdrop = document.getElementById('inbuilt-product-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
};

window.closeInbuiltStickerModal = function (e) {
  if (e && e.target && e.target.id !== 'inbuilt-product-modal-backdrop') return;
  const backdrop = document.getElementById('inbuilt-product-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    document.body.style.overflow = '';
  }
};

window.switchInbuiltModalImage = function (thumbElem, imgSrc) {
  const mainImg = document.getElementById('inbuilt-modal-main-img');
  if (mainImg) {
    mainImg.style.opacity = '0.4';
    setTimeout(() => {
      mainImg.src = imgSrc;
      mainImg.style.opacity = '1';
    }, 150);
  }

  if (thumbElem) {
    const parent = thumbElem.parentElement;
    if (parent) {
      parent.querySelectorAll('div').forEach(d => d.style.borderColor = '#cbd5e1');
      thumbElem.style.borderColor = '#00b894';
    }
  }
};

window.toggleInbuiltMugAddon = function (optVal) {
  if (!window.currentInbuiltModalProduct) return;
  const isWithMug = (optVal === 'with_mug');
  window.currentInbuiltModalProduct.includeMugAddon = isWithMug;

  const lblSheet = document.getElementById('lbl-mug-opt-sheet');
  const lblMug = document.getElementById('lbl-mug-opt-withmug');
  const appWrapper = document.getElementById('inbuilt-modal-application-wrapper');

  if (isWithMug) {
    if (lblSheet) {
      lblSheet.style.borderColor = '#e2e8f0';
      lblSheet.style.borderWidth = '1.5px';
      lblSheet.style.background = '#ffffff';
    }
    if (lblMug) {
      lblMug.style.borderColor = '#00b894';
      lblMug.style.borderWidth = '2px';
      lblMug.style.background = '#f0fdf4';
    }
    if (appWrapper) {
      appWrapper.style.display = 'block';
    }
    // Default to Pre-Applied if not set
    if (!window.currentInbuiltModalProduct.applicationPreference) {
      window.currentInbuiltModalProduct.applicationPreference = 'Pre-Applied';
    }
    const currentPref = window.currentInbuiltModalProduct.applicationPreference;
    window.toggleInbuiltAppPreference(currentPref);
  } else {
    if (lblSheet) {
      lblSheet.style.borderColor = '#00b894';
      lblSheet.style.borderWidth = '2px';
      lblSheet.style.background = '#f0fdf4';
    }
    if (lblMug) {
      lblMug.style.borderColor = '#e2e8f0';
      lblMug.style.borderWidth = '1.5px';
      lblMug.style.background = '#ffffff';
    }
    if (appWrapper) {
      appWrapper.style.display = 'none';
    }
  }

  const qty = parseInt(document.getElementById('inbuilt-modal-qty-input')?.value || '1', 10) || 1;
  window.updateInbuiltModalPrice(qty);
};

window.toggleInbuiltAppPreference = function (pref) {
  if (!window.currentInbuiltModalProduct) return;
  window.currentInbuiltModalProduct.applicationPreference = pref;

  const isPreApplied = (pref === 'Pre-Applied');
  const lblPre = document.getElementById('lbl-app-preapplied');
  const lblDiy = document.getElementById('lbl-app-diykit');
  const preRadio = document.querySelector('input[name="inbuilt_app_pref"][value="Pre-Applied"]');
  const diyRadio = document.querySelector('input[name="inbuilt_app_pref"][value="DIY Kit"]');

  if (isPreApplied) {
    if (preRadio) preRadio.checked = true;
    if (lblPre) {
      lblPre.style.borderColor = '#00b894';
      lblPre.style.borderWidth = '2px';
      lblPre.style.background = '#f0fdf4';
    }
    if (lblDiy) {
      lblDiy.style.borderColor = '#e2e8f0';
      lblDiy.style.borderWidth = '1.5px';
      lblDiy.style.background = '#ffffff';
    }
  } else {
    if (diyRadio) diyRadio.checked = true;
    if (lblPre) {
      lblPre.style.borderColor = '#e2e8f0';
      lblPre.style.borderWidth = '1.5px';
      lblPre.style.background = '#ffffff';
    }
    if (lblDiy) {
      lblDiy.style.borderColor = '#00b894';
      lblDiy.style.borderWidth = '2px';
      lblDiy.style.background = '#f0fdf4';
    }
  }
};

window.changeInbuiltModalQty = function (delta) {
  const input = document.getElementById('inbuilt-modal-qty-input');
  if (!input) return;
  let val = parseInt(input.value || '1', 10) + delta;
  if (isNaN(val) || val < 1) val = 1;
  if (val > 500) val = 500;
  input.value = val;

  window.updateInbuiltModalPrice(val);
};

window.setInbuiltModalQty = function (qty, chipElem) {
  const input = document.getElementById('inbuilt-modal-qty-input');
  if (input) input.value = qty;

  document.querySelectorAll('.inbuilt-modal-qty-chip').forEach(c => {
    c.classList.remove('active');
    c.style.background = '#ffffff';
    c.style.color = '#334155';
  });
  if (chipElem) {
    chipElem.classList.add('active');
    chipElem.style.background = '#A8D4B0';
    chipElem.style.color = '#143d1c';
  }

  window.updateInbuiltModalPrice(qty);
};

window.validateInbuiltModalQty = function (inputElem) {
  let val = parseInt(inputElem.value || '1', 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 500) val = 500;
  inputElem.value = val;
  window.updateInbuiltModalPrice(val);
};

window.updateInbuiltModalPrice = function (qty) {
  if (!window.currentInbuiltModalProduct) return;
  window.currentInbuiltModalProduct.selectedQty = qty;
  const product = window.currentInbuiltModalProduct;
  const base = product.basePrice || 150;
  const addon = product.includeMugAddon ? 200 : 0;
  const unitPrice = base + addon;
  const totalPrice = unitPrice * qty;

  const priceElem = document.getElementById('inbuilt-modal-price');
  if (priceElem) {
    if (product.includeMugAddon) {
      const addonLabel = product.isTumblerCategory ? 'Tumbler' : 'Mug';
      priceElem.innerHTML = `₹${totalPrice.toLocaleString('en-IN')} <span style="font-size: 13px; color: #64748b; font-weight: 700;">(₹150 Sheet + ₹200 ${addonLabel} x ${qty})</span>`;
    } else {
      priceElem.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }
  }
};

window.handleAddMultipleToCart = function (itemsArray, toastMessage) {
  if (!Array.isArray(itemsArray) || itemsArray.length === 0) return;

  const rootPath = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/');
  const shopifyItemsPayload = [];

  itemsArray.forEach(itemData => {
    const rawId = itemData.id || itemData.variant_id || itemData.mappedVariantId || '';
    const itemName = itemData.name || itemData.title || itemData.product_title || 'Custom Product';
    const quantity = parseInt(itemData.quantity || 1, 10);
    const properties = itemData.properties || {};

    let priceNum = parsePriceToNumber(itemData.price);
    const itemPrice = '₹' + priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const itemImg = itemData.img || itemData.image || '';

    // 1. Resolve Variant ID
    let resolvedVariantId = null;
    if (itemData.mappedVariantId && /^\d{10,}$/.test(String(itemData.mappedVariantId).trim())) {
      resolvedVariantId = String(itemData.mappedVariantId).trim();
    } else if (/^\d{10,}$/.test(String(rawId).trim()) && !String(rawId).startsWith('17')) {
      resolvedVariantId = String(rawId).trim();
    } else if (typeof inbuiltProductVariantMap !== 'undefined' && inbuiltProductVariantMap) {
      const cleanName = itemName.replace(/^Product Name:\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim();
      const baseTitle = itemData.baseTitle ? String(itemData.baseTitle).trim() : '';
      if (inbuiltProductVariantMap[baseTitle]) {
        resolvedVariantId = inbuiltProductVariantMap[baseTitle];
      } else if (inbuiltProductVariantMap[cleanName]) {
        resolvedVariantId = inbuiltProductVariantMap[cleanName];
      } else if (inbuiltProductVariantMap[itemName]) {
        resolvedVariantId = inbuiltProductVariantMap[itemName];
      } else {
        const normLookup = (cleanName + ' ' + baseTitle).toLowerCase().replace(/[^a-z0-9]/g, '');
        const mapKeys = Object.keys(inbuiltProductVariantMap).filter(k => k.length > 4).sort((a, b) => b.length - a.length);
        for (const k of mapKeys) {
          const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normLookup.includes(normK) || normK.includes(normLookup)) {
            resolvedVariantId = inbuiltProductVariantMap[k];
            break;
          }
        }
      }
    }

    const isVesselItem = (itemName.toLowerCase().includes('tumbler') || itemName.toLowerCase().includes('mug')) &&
      !itemName.toLowerCase().includes('sheet') && !itemName.toLowerCase().includes('trasfer') && !itemName.toLowerCase().includes('transfer') && !itemName.toLowerCase().includes('sticker');

    if (isVesselItem) {
      resolvedVariantId = itemName.toLowerCase().includes('tumbler') ? '67643948925060' : '67643948990596';
    } else if (!resolvedVariantId) {
      resolvedVariantId = '67585065189508';
    }

    // 2. Add to Local Cart for drawer
    addLocalCartItem({
      id: rawId || resolvedVariantId,
      mappedVariantId: resolvedVariantId,
      baseTitle: itemData.baseTitle || null,
      name: itemName,
      price: itemPrice,
      img: itemImg,
      quantity: quantity,
      properties: properties,
      pairId: itemData.pairId || (properties && properties['_pairId']) || null,
      isParentItem: Boolean(itemData.isParentItem || (properties && properties['Add-on Paired'])),
      isAddon: Boolean(itemData.isAddon || (properties && properties['Paired Sticker'])),
      parentItemId: itemData.parentItemId || (properties && properties['_parentItemId']) || null,
      pairedItemId: itemData.pairedItemId || (properties && properties['_pairedItemId']) || null
    });

    // 3. Prepare Shopify payload
    const shopifyQty = quantity;
    shopifyItemsPayload.push({
      id: Number(resolvedVariantId),
      quantity: shopifyQty,
      properties: properties
    });
  });

  // 4. Send atomic POST request to Shopify /cart/add.js
  fetch(rootPath + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ items: shopifyItemsPayload })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Successfully added bundle items to Shopify cart:', data);
      fetchShopifyCart();
    })
    .catch(err => {
      console.warn('Shopify bundle cart add warning (local drawer preserved):', err);
    });

  showToast(toastMessage || 'Added items to cart!');
  openCartDrawer();
};

window.addInbuiltModalToCart = function () {
  if (!window.currentInbuiltModalProduct) return;

  const product = window.currentInbuiltModalProduct;
  const qty = parseInt(document.getElementById('inbuilt-modal-qty-input')?.value || '1', 10) || 1;
  const stickerUnitPrice = product.basePrice || 150;

  if (product.includeMugAddon) {
    const vesselName = product.isTumblerCategory ? 'Tumbler' : 'Mug';
    const vesselVariantId = product.isTumblerCategory ? '67643948925060' : '67643948990596';
    const vesselImg = product.isTumblerCategory
      ? 'https://cdn.shopify.com/s/files/1/1021/4352/4996/files/tumbler.png?v=1791652264'
      : 'https://cdn.shopify.com/s/files/1/1021/4352/4996/files/mug.png?v=1791652268';
    const appPref = product.applicationPreference || 'Pre-Applied';
    const appDetails = appPref === 'Pre-Applied'
      ? `Sticker applied to your ${vesselName.toLowerCase()}`
      : `Receive sticker and ${vesselName.toLowerCase()} separately; apply it yourself`;

    const pairId = 'pair_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const stickerItemId = `inbuilt-sticker-${Date.now()}`;
    const vesselItemId = `inbuilt-vessel-${Date.now() + 1}`;

    const stickerItem = {
      id: stickerItemId,
      pairId: pairId,
      isParentItem: true,
      pairedItemId: vesselItemId,
      baseTitle: product.title,
      mappedVariantId: product.variantId || null,
      name: `${product.title} (${qty} Pcs)`,
      price: `₹${(stickerUnitPrice * qty).toLocaleString('en-IN')}`,
      img: product.mainImg,
      quantity: qty,
      properties: {
        'Category': product.category || 'UV DTF Sticker',
        'Add-on Paired': vesselName,
        'Application Method': appPref,
        'Application Details': appDetails,
        '_pairId': pairId,
        '_pairedItemId': vesselItemId
      }
    };

    const vesselItem = {
      id: vesselItemId,
      pairId: pairId,
      isAddon: true,
      parentItemId: stickerItemId,
      pairedItemId: stickerItemId,
      baseTitle: vesselName,
      mappedVariantId: vesselVariantId,
      name: `${vesselName} [${appPref}] (${qty} Pcs)`,
      price: `₹${(200 * qty).toLocaleString('en-IN')}`,
      img: vesselImg,
      quantity: qty,
      properties: {
        'Paired Sticker': product.title,
        'Application Method': appPref,
        'Application Details': appDetails,
        '_pairId': pairId,
        '_parentItemId': stickerItemId
      }
    };

    window.handleAddMultipleToCart([stickerItem, vesselItem], `Added "${product.title}" and "${vesselName}" to cart!`);
  } else {
    // Transfer Sheet Only
    const stickerItem = {
      id: `inbuilt-modal-${Date.now()}`,
      baseTitle: product.title,
      mappedVariantId: product.variantId || null,
      name: `${product.title} (${qty} Pcs)`,
      price: `₹${(stickerUnitPrice * qty).toLocaleString('en-IN')}`,
      img: product.mainImg,
      quantity: qty,
      properties: {
        'Category': product.category || 'UV DTF Sticker'
      }
    };
    handleAddToCart(stickerItem);
  }

  window.closeInbuiltStickerModal();
};

/* ==========================================================================
   Amazon-Style Image Zoom Magnifier Lens & Result Box Controller
   (Supports both Lifestyle Mockup View & Live Studio Canvas View with Full Logo & Text Zoom)
   ========================================================================== */
window.initTshirtImageMagnifier = function () {
  // Completely remove zoom box and lens elements from DOM per user request
  document.querySelectorAll('#tshirt-zoom-result-box, .image-zoom-result-box, .image-zoom-lens').forEach(el => el.remove());
  window.markZoomMirrorDirty = function () { };
  window.syncCanvasZoomMirror = function () { };
};

/* ==========================================================================
   Custom 2-in-1 Gift Set Studio Controller (#B2B4B3 & #A2D9F7 Theme System)
   ========================================================================== */
let giftState = {
  targetQty: 1,
  mode: 'logo', // 'logo' (Upload Design), 'text' (Write Text), 'plain' (No text/logo)
  customText: '',
  artworkFile: null,
  artworkDataUrl: null,
  basePrice: 249.00,
  baseMrp: 399.00,
  unitPrice: 249.00,
  totalPrice: 249.00,
  viewMode: 'lifestyle',
  productTitle: '3 in 1 Gift Set',
  productImg: 'assets/gift-product-1-main.jpg',
  selectedProductId: null,
  selectedFinish: null
};

window.switchGiftPageMode = function (mode) {
  const catalogView = document.getElementById('gift-catalog-view');
  const customView = document.getElementById('gift-custom-mode-view') || document.getElementById('custom-gift-view') || document.getElementById('custom-mode-view');
  const btnCatalog = document.getElementById('btn-mode-catalog');
  const btnCustom = document.getElementById('btn-mode-custom');

  if (mode === 'custom') {
    if (catalogView) catalogView.style.display = 'none';
    if (customView) customView.style.display = 'block';
    if (btnCustom) btnCustom.classList.add('active');
    if (btnCatalog) btnCatalog.classList.remove('active');
  } else {
    if (catalogView) catalogView.style.display = 'block';
    if (customView) customView.style.display = 'none';
    if (btnCatalog) btnCatalog.classList.add('active');
    if (btnCustom) btnCustom.classList.remove('active');
  }
};

let giftHeroTimer = 10;
let giftHeroInterval = null;
let giftHeroShrunk = false;

window.startGiftHeroTimer = function () {
  giftHeroShrunk = false;
  giftHeroTimer = 10;

  const heroWrapper = document.getElementById('gift-interactive-hero-wrapper');
  const timerNum = document.getElementById('gift-hero-timer-num');

  if (heroWrapper) {
    heroWrapper.classList.remove('gift-hero-split');
    heroWrapper.classList.add('gift-hero-fullscreen');
    heroWrapper.style.display = 'flex';
  }

  if (timerNum) timerNum.textContent = giftHeroTimer;

  clearInterval(giftHeroInterval);
  giftHeroInterval = setInterval(() => {
    giftHeroTimer--;
    if (timerNum) timerNum.textContent = giftHeroTimer > 0 ? giftHeroTimer : 0;
    if (giftHeroTimer <= 0) {
      clearInterval(giftHeroInterval);
      window.triggerGiftHeroShrink();
    }
  }, 1000);

  // Add scroll-to-skip listeners
  window.addEventListener('scroll', window.handleGiftScrollToSkip, { passive: true });
  window.addEventListener('wheel', window.handleGiftScrollToSkip, { passive: true });
  window.addEventListener('touchmove', window.handleGiftScrollToSkip, { passive: true });
};

window.handleGiftScrollToSkip = function (e) {
  if (!giftHeroShrunk) {
    window.triggerGiftHeroShrink();
  }
};

window.triggerGiftHeroShrink = function (manual = false) {
  if (giftHeroShrunk) return;
  giftHeroShrunk = true;
  clearInterval(giftHeroInterval);

  window.removeEventListener('scroll', window.handleGiftScrollToSkip);
  window.removeEventListener('wheel', window.handleGiftScrollToSkip);
  window.removeEventListener('touchmove', window.handleGiftScrollToSkip);

  const heroWrapper = document.getElementById('gift-interactive-hero-wrapper');
  if (heroWrapper) {
    heroWrapper.classList.remove('gift-hero-fullscreen');
    heroWrapper.classList.add('gift-hero-split');
  }

  if (manual) {
    document.getElementById('gift-studio-configurator-section')?.scrollIntoView({ behavior: 'smooth' });
  }
};

window.toggleGiftHeroMute = function () {
  const vid = document.getElementById('gift-hero-video-player');
  const icon = document.getElementById('gift-hero-mute-icon');
  if (vid) {
    vid.muted = !vid.muted;
    if (icon) {
      icon.className = vid.muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    }
  }
};



window.openGiftProductStudio = function (id, title, price, mrp, mainImg, detailImg, videoUrl, videoPoster) {
  giftState.selectedProductId = id;
  let parsedGiftPrice = parseFloat(price) || 0;
  if (parsedGiftPrice < 100) {
    const lower = String(title || '').toLowerCase();
    if (lower.includes('card holder') && (lower.includes('399') || lower.includes('685'))) parsedGiftPrice = 399;
    else if (lower.includes('3 in 1') || lower.includes('525')) parsedGiftPrice = 525;
    else if (lower.includes('799') || lower.includes('595')) parsedGiftPrice = 799;
    else if (lower.includes('1099') || lower.includes('1,099')) parsedGiftPrice = 1099;
    else parsedGiftPrice = 249;
  }
  giftState.basePrice = parsedGiftPrice;
  giftState.baseMrp = Math.max(parsedGiftPrice * 1.5, parseFloat(mrp) || 399.00);
  giftState.productTitle = title;
  giftState.productImg = mainImg;
  giftState.specialInstructions = '';
  const instrInput = document.getElementById('gift-special-instructions');
  if (instrInput) instrInput.value = '';
  giftState.customFeatures = { logo: true, text: false };
  window.toggleGiftCustomFeature('init');

  const titleElem = document.getElementById('gift-product-title');
  if (titleElem) titleElem.textContent = title;

  if (document.getElementById('gift-hero-active-title')) {
    document.getElementById('gift-hero-active-title').textContent = title;
    document.getElementById('gift-hero-active-price').textContent = '₹' + (parseFloat(price) || 249.00).toFixed(2);
  }

  const mainImgElem = document.getElementById('gift-main-product-img');
  if (mainImgElem) mainImgElem.src = mainImg;

  const bgImgElem = document.getElementById('gift-canvas-bg-img');
  if (bgImgElem) bgImgElem.src = detailImg || mainImg;

  // Set Hero Video Source & Poster
  const heroVidPlayer = document.getElementById('gift-hero-video-player');
  const heroVidSrc = document.getElementById('gift-hero-video-src');

  const defaultVideoMap = {
    '1': 'gift-product-1-video.mp4',
    '3': 'gift-product-3-video.mp4',
    '4': 'gift-product-4-video.mp4',
    '7': 'gift-product-7-video.mp4',
    '8': 'gift-product-8-video.mp4'
  };

  let actualVideoSrc = videoUrl;
  if (!actualVideoSrc || typeof actualVideoSrc !== 'string' || !actualVideoSrc.includes('.mp4')) {
    const mapped = defaultVideoMap[String(id)] || 'gift-product-1-video.mp4';
    actualVideoSrc = 'assets/' + mapped;
  }

  const actualPoster = videoPoster || mainImg;

  if (heroVidPlayer && heroVidSrc) {
    if (actualPoster) heroVidPlayer.poster = actualPoster;
    heroVidSrc.src = actualVideoSrc;
    heroVidPlayer.load();
    heroVidPlayer.play().catch(e => console.log('Autoplay prevented:', e));
  }

  // Build gallery thumbnails dynamically
  const thumbsWrapper = document.getElementById('gift-gallery-thumbs-wrapper');
  if (thumbsWrapper) {
    thumbsWrapper.innerHTML = '';
    const images = [];
    if (mainImg) images.push(mainImg);
    if (detailImg && detailImg !== mainImg) images.push(detailImg);

    if (images.length > 1) {
      images.forEach((imgUrl, idx) => {
        const thumbBtn = document.createElement('div');
        thumbBtn.className = `gift-thumb-btn ${idx === 0 ? 'active' : ''}`;
        thumbBtn.style.cssText = `width: 64px; height: 64px; border-radius: 12px; border: 2px solid ${idx === 0 ? '#0c4a6e' : '#cbd5e1'}; overflow: hidden; cursor: pointer; background: #ffffff; transition: all 0.2s ease;`;
        thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Thumbnail ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;">`;
        thumbBtn.onclick = function () {
          document.querySelectorAll('.gift-thumb-btn').forEach(b => {
            b.style.borderColor = '#cbd5e1';
            b.classList.remove('active');
          });
          this.style.borderColor = '#0c4a6e';
          this.classList.add('active');
          if (mainImgElem) mainImgElem.src = imgUrl;
        };
        thumbsWrapper.appendChild(thumbBtn);
      });
      thumbsWrapper.style.display = 'flex';
    } else {
      thumbsWrapper.style.display = 'none';
    }
  }

  // Finish option selector visibility for Product 9 (Visiting Card Holder)
  const finishBox = document.getElementById('gift-finish-option-box');
  if (finishBox) {
    if (id === '9') {
      finishBox.style.display = 'block';
      giftState.selectedFinish = 'Stainless steel with black top';
    } else {
      finishBox.style.display = 'none';
      giftState.selectedFinish = null;
    }
  }

  // Reset dropdown to 1 pc
  const dropdown = document.getElementById('gift-qty-dropdown');
  if (dropdown) dropdown.value = "1";
  giftState.targetQty = 1;

  recalculateGiftPrice();
  switchGiftPageMode('custom');

  window.startGiftHeroTimer();
  showToast(`Opened Studio for "${title.slice(0, 35)}..."`);
};

window.switchGiftFinishOption = function (finishKey, imgUrl, btnElem) {
  giftState.selectedFinish = finishKey === 'black' ? 'Stainless steel with black top' : 'Stainless steel with brown top';
  giftState.productImg = imgUrl;

  const mainImgElem = document.getElementById('gift-main-product-img');
  if (mainImgElem) mainImgElem.src = imgUrl;

  const bgImgElem = document.getElementById('gift-canvas-bg-img');
  if (bgImgElem) bgImgElem.src = imgUrl;

  const thumbElem = document.getElementById('gift-card-9-thumb-img');
  if (thumbElem) thumbElem.src = imgUrl;

  const allBtns = document.querySelectorAll('.gift-finish-chip-btn');
  allBtns.forEach(b => {
    b.classList.remove('active');
    b.style.borderColor = '#e2e8f0';
    b.style.background = '#ffffff';
  });

  if (btnElem) {
    btnElem.classList.add('active');
    btnElem.style.borderColor = '#0284c7';
    btnElem.style.background = '#f0f9ff';
  }

  showToast(`Selected Finish: ${giftState.selectedFinish}`);
};

window.selectGiftQuantity = function (qtyVal, selectElem) {
  let qty = parseInt(qtyVal, 10);
  if (isNaN(qty) || qty <= 0) qty = 1;

  giftState.targetQty = qty;

  const customBox = document.getElementById('gift-custom-qty-box');
  if (customBox) {
    if (qtyVal === 'custom') {
      customBox.style.display = 'block';
      const customInput = document.getElementById('gift-custom-qty-input');
      if (customInput) customInput.focus();
      return;
    } else {
      customBox.style.display = 'none';
    }
  }

  recalculateGiftPrice();
};

window.handleGiftCustomQtyInput = function (val) {
  let qty = parseInt(val, 10);
  if (isNaN(qty) || qty <= 0) qty = 1;
  giftState.targetQty = qty;
  recalculateGiftPrice();
};

window.updateGiftAddBtnState = function () {
  const addBtn = document.getElementById('btn-add-gift-cart');
  const hintElem = document.getElementById('gift-add-hint-text');
  if (!addBtn) return { isValid: false, reasonMsg: '' };

  if (!giftState.customFeatures) {
    giftState.customFeatures = { logo: true, text: false };
  }

  const isLogoOn = !!giftState.customFeatures.logo;
  const isTextOn = !!giftState.customFeatures.text;
  const isPlainOn = (!isLogoOn && !isTextOn);

  const authBox = document.getElementById('gift-auth-step-box');
  const authCheckbox = document.getElementById('gift-auth-checkbox');

  const hasArtwork = !!(giftState.artworkFile || giftState.artworkDataUrl);
  const isArtworkApproved = authCheckbox ? !!authCheckbox.checked : false;

  // Sync auth step box visibility
  if (authBox) {
    if (isLogoOn && hasArtwork) {
      authBox.style.display = 'block';
    } else {
      authBox.style.display = 'none';
      if (!hasArtwork && authCheckbox) {
        authCheckbox.checked = false;
      }
    }
  }

  const customTextVal = (giftState.customText || '').trim();
  const hasValidText = customTextVal.length > 0;

  let isValid = false;
  let reasonMsg = '';

  if (isPlainOn) {
    // "Don't want to add any text or logo" -> directly clickable
    isValid = true;
  } else if (isLogoOn && isTextOn) {
    // Both logo AND text selected
    if (!hasArtwork) {
      reasonMsg = 'Please upload your design/logo image to enable Add to Cart';
    } else if (!isArtworkApproved) {
      reasonMsg = 'Please tick the design authorization box to proceed';
    } else if (!hasValidText) {
      reasonMsg = 'Please enter your custom text to enable Add to Cart';
    } else {
      isValid = true;
    }
  } else if (isLogoOn) {
    // Only Logo selected
    if (!hasArtwork) {
      reasonMsg = 'Please upload your design/logo image to enable Add to Cart';
    } else if (!isArtworkApproved) {
      reasonMsg = 'Please tick the design authorization box to proceed';
    } else {
      isValid = true;
    }
  } else if (isTextOn) {
    // Only Text selected
    if (!hasValidText) {
      reasonMsg = 'Please enter your custom text to enable Add to Cart';
    } else {
      isValid = true;
    }
  }

  // Update button visual & clickable state
  if (isValid) {
    addBtn.removeAttribute('disabled');
    addBtn.disabled = false;
    addBtn.style.setProperty('opacity', '1', 'important');
    addBtn.style.setProperty('cursor', 'pointer', 'important');
    addBtn.style.setProperty('pointer-events', 'auto', 'important');
    addBtn.style.setProperty('box-shadow', '0 10px 25px rgba(162,217,247,0.5)', 'important');
    addBtn.style.setProperty('filter', 'none', 'important');
    addBtn.style.setProperty('background', '#A2D9F7', 'important');
    addBtn.style.setProperty('color', '#0c4a6e', 'important');
    if (hintElem) {
      hintElem.style.display = 'none';
      hintElem.textContent = '';
    }
  } else {
    addBtn.setAttribute('disabled', 'disabled');
    addBtn.disabled = true;
    addBtn.style.setProperty('opacity', '0.45', 'important');
    addBtn.style.setProperty('cursor', 'not-allowed', 'important');
    addBtn.style.setProperty('pointer-events', 'none', 'important');
    addBtn.style.setProperty('box-shadow', 'none', 'important');
    addBtn.style.setProperty('filter', 'grayscale(0.6)', 'important');
    addBtn.style.setProperty('background', '#94a3b8', 'important');
    addBtn.style.setProperty('color', '#ffffff', 'important');
    if (hintElem) {
      hintElem.style.display = 'block';
      hintElem.textContent = reasonMsg;
    }
  }

  return { isValid, reasonMsg };
};

window.toggleGiftCustomFeature = function (featureKey) {
  if (!giftState.customFeatures) {
    giftState.customFeatures = { logo: true, text: false };
  }

  if (featureKey === 'plain') {
    giftState.customFeatures.logo = false;
    giftState.customFeatures.text = false;
  } else if (featureKey === 'logo') {
    giftState.customFeatures.logo = !giftState.customFeatures.logo;
  } else if (featureKey === 'text') {
    giftState.customFeatures.text = !giftState.customFeatures.text;
  } else if (featureKey === 'init') {
    // retain current state
  }

  const isLogoOn = giftState.customFeatures.logo;
  const isTextOn = giftState.customFeatures.text;
  const isPlainOn = (!isLogoOn && !isTextOn);

  // Update chip active states
  const chipLogo = document.getElementById('gift-chip-logo');
  const chipText = document.getElementById('gift-chip-text');
  const chipPlain = document.getElementById('gift-chip-plain');

  if (chipLogo) chipLogo.classList.toggle('active', isLogoOn);
  if (chipText) chipText.classList.toggle('active', isTextOn);
  if (chipPlain) chipPlain.classList.toggle('active', isPlainOn);

  // Update input box visibilities
  const uploadBox = document.getElementById('gift-upload-option-box');
  const textBox = document.getElementById('gift-text-option-box');
  const plainBox = document.getElementById('gift-plain-option-box');

  if (uploadBox) uploadBox.style.display = isLogoOn ? 'block' : 'none';
  if (textBox) textBox.style.display = isTextOn ? 'block' : 'none';
  if (plainBox) plainBox.style.display = isPlainOn ? 'block' : 'none';

  // Update live stage elements
  const canvasLogoContainer = document.getElementById('gift-canvas-logo-container');
  const canvasTextContainer = document.getElementById('gift-canvas-text-container');

  if (canvasLogoContainer) {
    canvasLogoContainer.style.display = (isLogoOn && giftState.artworkDataUrl) ? 'flex' : 'none';
  }
  if (canvasTextContainer) {
    canvasTextContainer.style.display = (isTextOn && giftState.customText) ? 'flex' : 'none';
  }

  // Keep giftState.mode synced for cart description
  if (isLogoOn && isTextOn) giftState.mode = 'both';
  else if (isLogoOn) giftState.mode = 'logo';
  else if (isTextOn) giftState.mode = 'text';
  else giftState.mode = 'plain';

  if (typeof window.markGiftZoomMirrorDirty === 'function') window.markGiftZoomMirrorDirty();
  if (typeof window.syncGiftZoomMirror === 'function') window.syncGiftZoomMirror();
  if (typeof window.updateGiftAddBtnState === 'function') window.updateGiftAddBtnState();
};


window.switchGiftCustomMode = function (modeKey, btnElem) {
  if (modeKey === 'logo') window.toggleGiftCustomFeature('logo');
  else if (modeKey === 'text') window.toggleGiftCustomFeature('text');
  else if (modeKey === 'both') {
    giftState.customFeatures = { logo: true, text: true };
    window.toggleGiftCustomFeature('init');
  } else {
    window.toggleGiftCustomFeature('plain');
  }
};

window.handleGiftFileUpload = function (input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    giftState.artworkFile = file.name;
    giftState.rawFile = file;

    // Trigger CDN upload in background
    if (typeof window.uploadArtworkToShopifyCDN === 'function') {
      window.uploadArtworkToShopifyCDN(file, 'gift');
    }

    const onFileReady = function (dataUrl) {
      giftState.artworkDataUrl = dataUrl;

      const logoImg = document.getElementById('gift-canvas-logo-img');
      const logoContainer = document.getElementById('gift-canvas-logo-container');

      if (logoImg) logoImg.src = dataUrl;
      if (logoContainer) logoContainer.style.display = 'flex';

      const fileNameElem = document.getElementById('gift-artwork-file-name');
      if (fileNameElem) fileNameElem.textContent = `File: ${file.name}`;

      const infoRow = document.getElementById('gift-artwork-info-row');
      if (infoRow) infoRow.style.display = 'flex';

      // Photo gallery mode is active for custom gifts
      if (typeof window.markGiftZoomMirrorDirty === 'function') window.markGiftZoomMirrorDirty();
      if (typeof window.syncGiftZoomMirror === 'function') window.syncGiftZoomMirror();
      if (typeof window.updateGiftAddBtnState === 'function') window.updateGiftAddBtnState();

      showToast(`Uploaded Design: "${file.name}" rendered on Gift Set!`);
    };

    if (isPdf && typeof window.generatePdfPreviewDataUrl === 'function') {
      onFileReady(window.generatePdfPreviewDataUrl(file.name));
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        onFileReady(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
};

window.removeGiftUploadedArtwork = function () {
  giftState.artworkFile = null;
  giftState.artworkDataUrl = null;
  giftState.rawFile = null;

  const authCheckbox = document.getElementById('gift-auth-checkbox');
  if (authCheckbox) authCheckbox.checked = false;
  const authBox = document.getElementById('gift-auth-step-box');
  if (authBox) authBox.style.display = 'none';

  const logoImg = document.getElementById('gift-canvas-logo-img');
  const logoContainer = document.getElementById('gift-canvas-logo-container');
  if (logoImg) logoImg.src = '';
  if (logoContainer) logoContainer.style.display = 'none';

  const infoRow = document.getElementById('gift-artwork-info-row');
  if (infoRow) infoRow.style.display = 'none';

  const fileInput = document.getElementById('gift-file-input');
  if (fileInput) fileInput.value = '';

  if (typeof window.markGiftZoomMirrorDirty === 'function') window.markGiftZoomMirrorDirty();
  if (typeof window.syncGiftZoomMirror === 'function') window.syncGiftZoomMirror();
  if (typeof window.updateGiftAddBtnState === 'function') window.updateGiftAddBtnState();

  showToast('Uploaded design removed');
};

window.updateGiftCustomText = function (val) {
  giftState.customText = val || '';
  const textDisplay = document.getElementById('gift-canvas-text-display');
  const textContainer = document.getElementById('gift-canvas-text-container');

  if (textDisplay) textDisplay.textContent = val;
  if (textContainer) {
    if (val && val.trim().length > 0 && giftState.mode === 'text') {
      textContainer.style.display = 'flex';
    } else {
      textContainer.style.display = 'none';
    }
  }

  if (typeof window.markGiftZoomMirrorDirty === 'function') window.markGiftZoomMirrorDirty();
  if (typeof window.syncGiftZoomMirror === 'function') window.syncGiftZoomMirror();
  if (typeof window.updateGiftAddBtnState === 'function') window.updateGiftAddBtnState();
};


window.changeGiftInputQty = function (delta) {
  const input = document.getElementById('gift-qty-input-field');
  if (!input) return;
  let currentVal = parseInt(input.value) || 1;
  currentVal += delta;
  if (currentVal < 1) currentVal = 1;
  input.value = currentVal;
  window.onGiftQtyInput(currentVal);
};

window.setGiftQtyFromTier = function (qty) {
  const input = document.getElementById('gift-qty-input-field');
  if (input) input.value = qty;
  window.onGiftQtyInput(qty);
};

window.onGiftQtyInput = function (val) {
  let qty = parseInt(val) || 1;
  if (qty < 1) qty = 1;
  giftState.targetQty = qty;
  window.recalculateGiftPrice();
};

window.recalculateGiftPrice = function () {
  const qty = giftState.targetQty || 1;
  const baseUnitPrice = giftState.basePrice || 249.00;

  // Exact Discount Tiers requested by user:
  // 1-3 pcs: MRP (0%)
  // 4-10 pcs: 5% OFF
  // 11-25 pcs: 10% OFF
  // 26-50 pcs: 20% OFF
  // 51-100+ pcs: 32% OFF
  let discountPercent = 0;
  let activeTierId = 'gift-tier-1';
  let badgeText = 'Base Price (0% OFF)';
  let badgeBg = '#f0fdf4';
  let badgeColor = '#16a34a';

  if (qty >= 51) {
    discountPercent = 32;
    activeTierId = 'gift-tier-5';
    badgeText = '⚡ 32% OFF Applied!';
    badgeBg = '#fef2f2';
    badgeColor = '#dc2626';
  } else if (qty >= 26) {
    discountPercent = 20;
    activeTierId = 'gift-tier-4';
    badgeText = '⚡ 20% OFF Applied!';
    badgeBg = '#f3e8ff';
    badgeColor = '#7c3aed';
  } else if (qty >= 11) {
    discountPercent = 10;
    activeTierId = 'gift-tier-3';
    badgeText = '⚡ 10% OFF Applied!';
    badgeBg = '#e0f2fe';
    badgeColor = '#0284c7';
  } else if (qty >= 4) {
    discountPercent = 5;
    activeTierId = 'gift-tier-2';
    badgeText = '⚡ 5% OFF Applied!';
    badgeBg = '#e0f2fe';
    badgeColor = '#0284c7';
  }

  const discountMult = (100 - discountPercent) / 100;
  const unitPrice = Math.round(baseUnitPrice * discountMult);
  const totalPrice = Math.round(qty * unitPrice);

  giftState.unitPrice = unitPrice;
  giftState.totalPrice = totalPrice;

  const formattedTotal = totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedUnit = unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const topPriceNum = document.getElementById('gift-top-price-num');
  if (topPriceNum) topPriceNum.textContent = `₹${formattedTotal}`;

  const liveUnitElem = document.getElementById('gift-live-unit-price');
  if (liveUnitElem) liveUnitElem.textContent = `₹${formattedUnit} / pc`;

  const addBtn = document.getElementById('btn-add-gift-cart');
  if (addBtn) {
    addBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add Custom Gift Set to Cart • ₹${formattedTotal}`;
  }

  // Update Tier rows active styles dynamically
  for (let i = 1; i <= 5; i++) {
    const row = document.getElementById(`gift-tier-${i}`);
    if (row) {
      row.style.background = '#ffffff';
      row.style.borderLeftColor = 'transparent';
      row.classList.remove('active');
    }
  }

  const activeRow = document.getElementById(activeTierId);
  if (activeRow) {
    activeRow.style.background = '#f0fdf4';
    activeRow.style.borderLeftColor = badgeColor;
    activeRow.classList.add('active');
  }

  const activeBadge = document.getElementById('gift-discount-active-badge');
  if (activeBadge) {
    activeBadge.textContent = badgeText;
    activeBadge.style.background = badgeBg;
    activeBadge.style.color = badgeColor;
  }

  if (typeof window.updateGiftAddBtnState === 'function') {
    window.updateGiftAddBtnState();
  }
};


window.addGiftToCart = function () {
  if (typeof window.updateGiftAddBtnState === 'function') {
    const check = window.updateGiftAddBtnState();
    if (!check.isValid) {
      if (typeof showToast === 'function') showToast(check.reasonMsg || 'Please complete required custom options first.');
      return;
    }
  }

  const qty = giftState.targetQty || 1;
  const totalPrice = giftState.totalPrice || (giftState.basePrice * qty);

  let modeDesc = 'Plain Set (No Customization)';
  if (giftState.mode === 'both') {
    modeDesc = `Custom Logo (${giftState.artworkFile || 'Uploaded Logo'}) & Text ("${giftState.customText || 'Custom Text'}")`;
  } else if (giftState.mode === 'logo') {
    modeDesc = `Custom Logo (${giftState.artworkFile || 'Uploaded Design'})`;
  } else if (giftState.mode === 'text') {
    modeDesc = `Custom Text ("${giftState.customText || 'Custom Name'}")`;
  }

  if (giftState.selectedFinish) {
    modeDesc += ` • ${giftState.selectedFinish}`;
  }

  if (giftState.specialInstructions && giftState.specialInstructions.trim()) {
    modeDesc += ` • Note: ${giftState.specialInstructions.trim()}`;
  }

  const title = giftState.productTitle || '2 in 1 gift set (Keychain and pen comes with box)';
  const itemName = `${title} (${modeDesc}) - ${qty} Pc(s)`;
  const imgUrl = giftState.artworkDataUrl || giftState.productImg || 'assets/gift-product-1-main.jpg';

  let mappedVar = '67585069285508';
  if (giftState.selectedProductId === '8' || (title && (title.includes('1099') || totalPrice >= 1000))) {
    mappedVar = '67585069514884'; // 4 in 1 gift set (1099.00, set6.png)
  } else if (giftState.selectedProductId === '7' || (title && (title.includes('799') || title.includes('595')))) {
    mappedVar = '67585069449348'; // 4 in 1 gift set (799.00, set_5_2.png)
  } else if (typeof inbuiltProductVariantMap !== 'undefined' && (inbuiltProductVariantMap[title] || inbuiltProductVariantMap[giftState.selectedProductId])) {
    mappedVar = inbuiltProductVariantMap[title] || inbuiltProductVariantMap[giftState.selectedProductId];
  }

  const giftProperties = {
    'Product Name': itemName,
    'Price': `₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'Customization': modeDesc
  };

  if (giftState.artworkCdnUrl) {
    giftProperties['Uploaded Artwork'] = giftState.artworkCdnUrl;
  } else if (giftState.rawFile) {
    giftProperties['Uploaded Artwork'] = giftState.rawFile;
  } else if (giftState.artworkFile) {
    giftProperties['Uploaded Artwork'] = giftState.artworkFile;
  }
  if (giftState.customText) {
    giftProperties['Custom Text'] = giftState.customText;
  }
  if (giftState.specialInstructions && giftState.specialInstructions.trim()) {
    giftProperties['Special Instructions'] = giftState.specialInstructions.trim();
  }

  handleAddToCart({
    id: 'gift_' + Date.now(),
    mappedVariantId: mappedVar,
    baseTitle: title,
    name: itemName,
    price: `₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    img: imgUrl,
    quantity: qty,
    properties: giftProperties
  });
};

window.updateGiftSpecialInstructions = function (val) {
  giftState.specialInstructions = val || '';
};

window.quickAddGiftToCart = function (title, price, img) {
  const mappedVar = (typeof inbuiltProductVariantMap !== 'undefined' && inbuiltProductVariantMap[title]) || '67585069285508';
  handleAddToCart({
    id: 'gift_' + Date.now(),
    mappedVariantId: mappedVar,
    baseTitle: title,
    name: title,
    price: `₹${price}`,
    img: img,
    quantity: 1,
    properties: {
      'Product Name': title
    }
  });
};

window.switchGiftGalleryViewMode = function (mode) {
  const canvasView = document.getElementById('gift-canvas-view');
  const lifestyleView = document.getElementById('gift-lifestyle-view');
  const btnCanvas = document.getElementById('gift-view-btn-canvas');
  const btnLifestyle = document.getElementById('gift-view-btn-lifestyle');

  giftState.viewMode = mode;

  if (mode === 'canvas') {
    if (canvasView) canvasView.style.display = 'flex';
    if (lifestyleView) lifestyleView.style.display = 'none';
    if (btnCanvas) btnCanvas.classList.add('active');
    if (btnLifestyle) btnLifestyle.classList.remove('active');
    if (typeof window.markGiftZoomMirrorDirty === 'function') window.markGiftZoomMirrorDirty();
    if (typeof window.syncGiftZoomMirror === 'function') window.syncGiftZoomMirror();
  } else {
    if (canvasView) canvasView.style.display = 'none';
    if (lifestyleView) lifestyleView.style.display = 'block';
    if (btnLifestyle) btnLifestyle.classList.add('active');
    if (btnCanvas) btnCanvas.classList.remove('active');
  }
};

window.initGiftImageMagnifier = function () {
  const parentCol = document.querySelector('.product-gallery-col');
  if (!parentCol) return;

  let resultBox = parentCol.querySelector('#tshirt-zoom-result-box');
  if (!resultBox) {
    resultBox = document.createElement('div');
    resultBox.id = 'tshirt-zoom-result-box';
    resultBox.className = 'image-zoom-result-box';
    parentCol.appendChild(resultBox);
  }

  let mirror = resultBox.querySelector('#gift-zoom-canvas-mirror');
  if (!mirror) {
    mirror = document.createElement('div');
    mirror.id = 'gift-zoom-canvas-mirror';
    mirror.style.cssText = 'position: absolute; top: 0; left: 0; transform-origin: 0 0; pointer-events: none; display: none;';
    resultBox.appendChild(mirror);
  }

  const stageWrapper = document.getElementById('gift-canvas-stage-wrapper');
  if (stageWrapper) {
    let lens = stageWrapper.querySelector('.image-zoom-lens');
    if (!lens) {
      lens = document.createElement('div');
      lens.className = 'image-zoom-lens';
      stageWrapper.appendChild(lens);
    }

    let giftZoomDirty = true;
    window.markGiftZoomMirrorDirty = function () { giftZoomDirty = true; };

    window.syncGiftZoomMirror = function (mouseEvent) {
      const stageRect = stageWrapper.getBoundingClientRect();
      if (stageRect.width === 0 || stageRect.height === 0) return;

      resultBox.style.backgroundImage = 'none';

      if (giftZoomDirty || !mirror.firstElementChild) {
        const clone = stageWrapper.cloneNode(true);
        clone.id = 'gift-stage-mirror-clone';
        clone.style.cssText = `position: absolute; top: 0; left: 0; width: ${stageRect.width}px; height: ${stageRect.height}px; pointer-events: none; transform: none !important;`;
        clone.querySelectorAll('.image-zoom-lens').forEach(b => b.remove());
        mirror.style.width = `${stageRect.width}px`;
        mirror.style.height = `${stageRect.height}px`;
        mirror.innerHTML = '';
        mirror.appendChild(clone);
        giftZoomDirty = false;
      }

      const lensWidth = lens.offsetWidth || 150;
      const lensHeight = lens.offsetHeight || 150;
      let posX = 0; let posY = 0;

      if (mouseEvent && typeof mouseEvent.clientX === 'number') {
        let x = mouseEvent.clientX - stageRect.left;
        let y = mouseEvent.clientY - stageRect.top;
        posX = x - lensWidth / 2;
        posY = y - lensHeight / 2;
      } else {
        posX = parseFloat(lens.style.left) || 0;
        posY = parseFloat(lens.style.top) || 0;
      }

      if (posX < 0) posX = 0;
      if (posY < 0) posY = 0;
      if (posX > stageRect.width - lensWidth) posX = stageRect.width - lensWidth;
      if (posY > stageRect.height - lensHeight) posY = stageRect.height - lensHeight;

      lens.style.left = `${posX}px`;
      lens.style.top = `${posY}px`;

      const ratioX = (resultBox.offsetWidth || 540) / lensWidth;
      mirror.style.transformOrigin = '0 0';
      mirror.style.transform = `scale(${ratioX}) translate(${-posX}px, ${-posY}px)`;
    };

    stageWrapper.addEventListener('mouseenter', function (e) {
      if (window.innerWidth >= 1024) {
        window.syncGiftZoomMirror(e);
        mirror.style.display = 'block';
        lens.style.display = 'block';
        resultBox.style.display = 'block';
      }
    });

    stageWrapper.addEventListener('mouseleave', function () {
      lens.style.display = 'none';
      resultBox.style.display = 'none';
      mirror.style.display = 'none';
    });

    stageWrapper.addEventListener('mousemove', function (e) {
      if (window.innerWidth >= 1024) {
        window.syncGiftZoomMirror(e);
        mirror.style.display = 'block';
        lens.style.display = 'block';
        resultBox.style.display = 'block';
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  if (typeof window.renderPoloColorThumbnails === 'function') window.renderPoloColorThumbnails();
  if (typeof window.updateLogoUploadStepUI === 'function') window.updateLogoUploadStepUI();
  initLogoDragAndDrop();
  initTshirtImageMagnifier();
  initGiftImageMagnifier();

  const currentPath = (window.location.pathname || '').toLowerCase();
  const currentHash = (window.location.hash || '').toLowerCase();
  const pageTitle = (document.title || '').toLowerCase();
  const shopTitle = (window.shopifyProductTitle || '').toLowerCase();
  const shopHandle = (window.shopifyProductHandle || '').toLowerCase();

  const activeDOMFitBtn = document.querySelector('.tshirt-fit-sub-btn.active');
  let activeDOMFitName = activeDOMFitBtn ? (activeDOMFitBtn.textContent || '').toLowerCase() : '';

  // 1. Determine target fit for current product / page
  let targetFit = 'Polo T Shirts';
  let targetBtn = document.querySelector('.tshirt-fit-sub-btn[onclick*="Polo"]') || activeDOMFitBtn;

  if (currentHash.includes('oversiz') || currentPath.includes('oversiz') || pageTitle.includes('oversiz') || shopTitle.includes('oversiz') || shopHandle.includes('oversiz') || activeDOMFitName.includes('oversiz')) {
    targetFit = 'Oversized T-Shirts';
    targetBtn = document.querySelector('.tshirt-fit-sub-btn[onclick*="Oversized"]') || activeDOMFitBtn;
  } else if (currentHash.includes('round') || currentPath.includes('round') || pageTitle.includes('round') || shopTitle.includes('round') || shopHandle.includes('round') || activeDOMFitName.includes('round')) {
    targetFit = 'Rounded Neck';
    targetBtn = document.querySelector('.tshirt-fit-sub-btn[onclick*="Rounded"]') || activeDOMFitBtn;
  }

  tshirtState.fit = targetFit;

  // 2. Always apply fit selection and update description on load
  if (typeof window.selectTshirtFit === 'function') {
    window.selectTshirtFit(targetFit, targetBtn);
  } else {
    if (typeof window.updateBoxPositionForColor === 'function') window.updateBoxPositionForColor(tshirtState.color || 'Black');
    if (typeof applyLogoTransformUI === 'function') applyLogoTransformUI();
  }

  // 3. Handle Custom Mode vs Inbuilt Mode display based on URL query, hash, path, or active button state
  const currentSearch = (window.location.search || '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const modeParam = (searchParams.get('mode') || searchParams.get('tab') || '').toLowerCase().trim();

  const isCustomRequested = modeParam === 'custom' || currentSearch.includes('mode=custom') || currentSearch.includes('tab=custom') || currentHash.includes('custom') || currentPath.includes('/products/custom');
  const isInbuiltRequested = modeParam === 'inbuilt' || currentSearch.includes('mode=inbuilt') || currentSearch.includes('tab=inbuilt') || currentHash.includes('inbuilt') || searchParams.has('cat') || searchParams.has('product') || searchParams.has('open_product');

  if (isCustomRequested) {
    if (document.getElementById('tab-btn-custom') && typeof window.switchStickerMode === 'function') {
      window.switchStickerMode('custom');
    }
    if (document.getElementById('btn-mode-custom') && typeof window.switchTshirtPageMode === 'function') {
      window.switchTshirtPageMode('custom');
    }
  } else if (isInbuiltRequested) {
    if (document.getElementById('tab-btn-inbuilt') && typeof window.switchStickerMode === 'function') {
      window.switchStickerMode('inbuilt');
    }
    if (document.getElementById('btn-mode-inbuilt') && typeof window.switchTshirtPageMode === 'function') {
      window.switchTshirtPageMode('inbuilt');
    }
  }

  // Smooth scroll to customer-reviews anchor if present in URL
  if (currentHash.includes('customer-reviews')) {
    setTimeout(function () {
      var revElem = document.getElementById('customer-reviews');
      if (revElem) revElem.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  }
});
window.syncProductConfigHeight = function () {
  if (window.innerWidth >= 992) {
    const visibleCustomView = document.querySelector('#custom-mode-view:not([style*="display: none"]), .product-page-section');
    const galleryCol = visibleCustomView ? visibleCustomView.querySelector('.product-gallery-col') : document.querySelector('.product-gallery-col');
    const infoCols = document.querySelectorAll('.product-info-col, .product-config-col');

    if (galleryCol && infoCols.length > 0) {
      let galleryHeight = galleryCol.offsetHeight;
      const mainImg = galleryCol.querySelector('#main-product-img, #tshirt-main-product-img, img');
      if (mainImg && mainImg.offsetHeight > 200) {
        galleryHeight = Math.max(galleryHeight, mainImg.offsetHeight);
      }
      if (galleryHeight < 540) {
        galleryHeight = 580;
      }

      infoCols.forEach(function (col) {
        col.style.height = galleryHeight + 'px';
        col.style.maxHeight = galleryHeight + 'px';
        col.style.overflowY = 'auto';
        col.style.boxSizing = 'border-box';
      });
    }
  } else {
    const infoCols = document.querySelectorAll('.product-info-col, .product-config-col');
    infoCols.forEach(function (col) {
      col.style.maxHeight = 'none';
      col.style.height = 'auto';
      col.style.overflowY = 'visible';
      col.style.overflow = 'visible';
    });
  }
};

window.addEventListener('resize', window.syncProductConfigHeight);
window.addEventListener('DOMContentLoaded', function () {
  if (typeof window.updateAuthCheckboxVisibility === 'function') {
    window.updateAuthCheckboxVisibility();
  }
  if (typeof window.updateGiftAddBtnState === 'function') {
    window.updateGiftAddBtnState();
  }
  if (typeof window.updateCapAddBtnState === 'function') {
    window.updateCapAddBtnState();
  }
  window.syncProductConfigHeight();
  document.querySelectorAll('#main-product-img, #tshirt-main-product-img, .product-gallery-col img').forEach(function (img) {
    if (img.complete) {
      window.syncProductConfigHeight();
    } else {
      img.addEventListener('load', window.syncProductConfigHeight);
    }
  });
  if (window.ResizeObserver) {
    document.querySelectorAll('.product-gallery-col').forEach(function (col) {
      new ResizeObserver(function () {
        window.syncProductConfigHeight();
      }).observe(col);
    });
  }
});
window.addEventListener('load', function () {
  window.syncProductConfigHeight();
  if (typeof window.updateGiftAddBtnState === 'function') window.updateGiftAddBtnState();
  if (typeof window.updateCapAddBtnState === 'function') window.updateCapAddBtnState();
});
setTimeout(window.syncProductConfigHeight, 50);
setTimeout(window.syncProductConfigHeight, 200);
setTimeout(window.syncProductConfigHeight, 600);
setTimeout(window.syncProductConfigHeight, 1200);

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (typeof window.renderPoloColorThumbnails === 'function') window.renderPoloColorThumbnails();
  initLogoDragAndDrop();
  initTshirtImageMagnifier();
  initGiftImageMagnifier();
  if (typeof window.updateAuthCheckboxVisibility === 'function') {
    window.updateAuthCheckboxVisibility();
  }
  if (typeof window.updateGiftAddBtnState === 'function') {
    window.updateGiftAddBtnState();
  }
  if (typeof window.updateCapAddBtnState === 'function') {
    window.updateCapAddBtnState();
  }
  window.syncProductConfigHeight();
}




window.openTshirtProductStudio = function (cardElem) {
  try {
    if (!cardElem) return;
    const card = cardElem.closest ? (cardElem.closest('.inbuilt-product-card') || cardElem) : cardElem;
    const title = card.querySelector('.inbuilt-card-title')?.textContent.trim() || 'Custom T-Shirt';
    const price = card.querySelector('.inbuilt-price-tag')?.textContent.trim() || '₹799.00';
    const category = card.querySelector('.inbuilt-card-category')?.textContent.trim() || 'Oversized T-Shirt';
    const imgSrc = card.querySelector('.inbuilt-card-media img')?.src || card.querySelector('img')?.src || '';

    window.currentSingleProductData = { title, price, category, imgSrc };

    const titleEl = document.getElementById('tshirt-single-title');
    const breadTitleEl = document.getElementById('tshirt-single-breadcrumb-title');
    const priceEl = document.getElementById('tshirt-single-price');
    const catEl = document.getElementById('tshirt-single-category');
    const imgEl = document.getElementById('tshirt-single-main-img');
    const qtyEl = document.getElementById('single-tshirt-qty-input');
    const thumbsContainer = document.getElementById('tshirt-single-thumbs-container');

    if (titleEl) titleEl.textContent = title;
    if (breadTitleEl) breadTitleEl.textContent = title;
    if (priceEl) priceEl.textContent = price;
    if (catEl) catEl.textContent = category;
    if (imgEl) imgEl.src = imgSrc;
    if (qtyEl) qtyEl.value = 1;

    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      let imagesList = [];

      const dataImages = card.getAttribute('data-images');
      if (dataImages && dataImages.trim()) {
        imagesList = dataImages.split('|').map(s => s.trim()).filter(Boolean);
      }

      if (imagesList.length === 0 && imgSrc) {
        imagesList.push(imgSrc);
      }

      const catLower = category.toLowerCase();
      let sizeChartAsset = '';
      if (catLower.includes('round')) {
        sizeChartAsset = window.shopifyAssetMap?.['size-chart-roundneck.png'] || '';
      } else if (catLower.includes('polo')) {
        sizeChartAsset = window.shopifyAssetMap?.['size-chart-polo.png'] || '';
      } else {
        sizeChartAsset = window.shopifyAssetMap?.['size-chart-oversized.png'] || '';
      }

      if (sizeChartAsset && !imagesList.includes(sizeChartAsset)) {
        imagesList.push(sizeChartAsset);
      }

      if (imagesList.length > 0) {
        imagesList.forEach((url, idx) => {
          const thumbBtn = document.createElement('button');
          thumbBtn.type = 'button';
          thumbBtn.style.cssText = `
            width: 72px;
            height: 72px;
            border-radius: 12px;
            border: ${idx === 0 ? '2.5px solid #A8D4B0' : '2px solid #e2e8f0'};
            background: #ffffff;
            padding: 4px;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.2s ease;
            box-shadow: ${idx === 0 ? '0 4px 12px rgba(168,212,176,0.4)' : 'none'};
          `;

          const thumbImg = document.createElement('img');
          thumbImg.src = url;
          thumbImg.alt = `${title} view ${idx + 1}`;
          thumbImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 8px;';

          thumbBtn.appendChild(thumbImg);

          thumbBtn.onclick = function () {
            if (imgEl) {
              imgEl.style.opacity = '0.3';
              setTimeout(() => {
                imgEl.src = url;
                imgEl.style.opacity = '1';
              }, 100);
            }
            thumbsContainer.querySelectorAll('button').forEach(b => {
              b.style.border = '2px solid #e2e8f0';
              b.style.boxShadow = 'none';
            });
            thumbBtn.style.border = '2.5px solid #A8D4B0';
            thumbBtn.style.boxShadow = '0 4px 12px rgba(168,212,176,0.4)';
          };

          thumbsContainer.appendChild(thumbBtn);
        });
      }
    }

    const heroBanner = document.querySelector('.stickers-hero-banner');
    const viewInbuilt = document.getElementById('inbuilt-mode-view');
    const viewCustom = document.getElementById('custom-mode-view');
    const viewSingle = document.getElementById('single-product-mode-view');

    if (heroBanner) heroBanner.style.display = 'none';
    if (viewInbuilt) {
      viewInbuilt.style.display = 'none';
      viewInbuilt.classList.remove('active');
    }
    if (viewCustom) {
      viewCustom.style.display = 'none';
      viewCustom.classList.remove('active');
    }
    if (viewSingle) {
      viewSingle.style.display = 'block';
      viewSingle.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error("openTshirtProductStudio error:", e);
  }
};

window.backToTshirtCatalog = function () {
  const heroBanner = document.querySelector('.stickers-hero-banner');
  const viewInbuilt = document.getElementById('inbuilt-mode-view');
  const viewCustom = document.getElementById('custom-mode-view');
  const viewSingle = document.getElementById('single-product-mode-view');
  const extraSections = document.querySelectorAll('.size-chart-banner-section, .order-process-banner-section, .about-brand-section, .related-products-section');

  if (heroBanner) heroBanner.style.display = 'block';
  if (viewSingle) {
    viewSingle.style.display = 'none';
    viewSingle.classList.remove('active');
  }
  if (viewCustom) {
    viewCustom.style.display = 'none';
    viewCustom.classList.remove('active');
  }
  extraSections.forEach(sec => sec.style.display = 'block');

  if (viewInbuilt) {
    viewInbuilt.style.display = 'block';
    viewInbuilt.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.selectSingleSize = function (size, btnElem) {
  window.currentSingleTshirtSize = size;
  document.querySelectorAll('.single-tshirt-size-chip').forEach(b => {
    b.style.background = '#ffffff';
    b.style.color = '#334155';
    b.style.borderColor = '#cbd5e1';
  });
  if (btnElem) {
    btnElem.style.background = '#A8D4B0';
    btnElem.style.color = '#143d1c';
    btnElem.style.borderColor = '#A8D4B0';
  }
};

window.changeSingleTshirtQty = function (delta) {
  const input = document.getElementById('single-tshirt-qty-input');
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
};

window.addSingleTshirtToCart = function () {
  if (!window.currentSingleProductData) return;
  const qty = parseInt(document.getElementById('single-tshirt-qty-input').value) || 1;
  const p = window.currentSingleProductData;
  const size = window.currentSingleTshirtSize || 'M';

  if (typeof handleAddToCart === 'function') {
    handleAddToCart({
      id: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + size,
      name: `${p.title} (${size})`,
      price: p.price,
      img: p.imgSrc,
      quantity: qty
    });
  }
};

/* ==========================================================================
   CUSTOMIZED COTTON CAPS PRODUCT PAGE MODULE (ELEMENTA DESIGN SYSTEM)
   ========================================================================== */

window.capState = {
  color: 'Black',
  colorHex: '#18181b',
  customMethod: 'upload', // 'upload' vs 'text'
  artworkFile: null,
  artworkDataUrl: null,
  artworkScale: 80,
  customText: '',
  textColor: '#ffffff',
  specialInstructions: '',
  targetQty: 2,
  unitPrice: 250,
  totalPrice: 500
};

const CAP_SLABS = [
  { min: 2, max: 4, unitPrice: 250, discountPct: 0, label: '2–4 pcs' },
  { min: 5, max: 9, unitPrice: 220, discountPct: 0.12, label: '5–9 pcs' },
  { min: 10, max: 24, unitPrice: 205, discountPct: 0.18, label: '10–24 pcs' },
  { min: 25, max: 49, unitPrice: 188, discountPct: 0.25, label: '25–49 pcs' },
  { min: 50, max: 99, unitPrice: 170, discountPct: 0.32, label: '50–99 pcs' },
  { min: 100, max: 149, unitPrice: 148, discountPct: 0.41, label: '100–149 pcs' },
  { min: 150, max: 9999, unitPrice: 138, discountPct: 0.45, label: '150–200 pcs' }
];

window.selectCapColor = function (colorName, colorHex, btnElem) {
  capState.color = colorName;
  capState.colorHex = colorHex;

  const labelElem = document.getElementById('selected-cap-color-name');
  if (labelElem) labelElem.textContent = colorName.toUpperCase();

  document.querySelectorAll('.cap-color-swatch-btn').forEach(b => {
    b.classList.remove('active');
    b.style.border = '1.5px solid #cbd5e1';
  });
  if (btnElem) {
    btnElem.classList.add('active');
    btnElem.style.border = '2px solid #0284c7';
  }

  showToast(`Selected Cap Color: ${colorName}`);
};

window.switchCapSimplePhoto = function (imgSrc, elem) {
  document.querySelectorAll('.cap-thumb-photo-card').forEach(card => {
    card.classList.remove('active');
    card.style.border = '1.5px solid #e2e8f0';
  });
  if (elem) {
    elem.classList.add('active');
    elem.style.border = '2.5px solid #0284c7';
  }

  const videoWrapper = document.getElementById('cap-video-wrapper');
  const stageVideo = document.getElementById('cap-photo-stage-video');
  if (stageVideo) stageVideo.pause();
  if (videoWrapper) videoWrapper.style.display = 'none';

  const stageImg = document.getElementById('cap-photo-stage-img');
  if (stageImg) {
    stageImg.style.display = 'block';
    stageImg.src = imgSrc;
  }
};

window.switchCapToVideo = function (elem) {
  document.querySelectorAll('.cap-thumb-photo-card').forEach(card => {
    card.classList.remove('active');
    card.style.border = '1.5px solid #e2e8f0';
  });
  if (elem) {
    elem.classList.add('active');
    elem.style.border = '2.5px solid #00b894';
  }

  const stageImg = document.getElementById('cap-photo-stage-img');
  if (stageImg) stageImg.style.display = 'none';

  const videoWrapper = document.getElementById('cap-video-wrapper');
  const stageVideo = document.getElementById('cap-photo-stage-video');
  if (videoWrapper) videoWrapper.style.display = 'flex';
  if (stageVideo) {
    stageVideo.currentTime = 0;
    const playPromise = stageVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        stageVideo.muted = true;
        stageVideo.play();
      });
    }
  }
};

window.switchCapGalleryPhoto = function (photoKey, elem) {
  document.querySelectorAll('.cap-thumb-photo-card').forEach(card => {
    card.classList.remove('active');
    card.style.border = '1px solid #e2e8f0';
  });
  if (elem) {
    elem.classList.add('active');
    elem.style.border = '2px solid #0284c7';
  }

  const stageImg = document.getElementById('cap-photo-stage-img');
  const boundaryBox = document.getElementById('cap-print-boundary-box');
  const logoBox = document.getElementById('cap-draggable-logo-container');
  const textBox = document.getElementById('cap-draggable-text-container');

  const fileMap = {
    'hero': 'cap-hero-cluster.jpg',
    'black': 'cap-black-front.jpg',
    'white': 'cap-white-front.jpg',
    'navy': 'cap-navy-front.jpg',
    'red': 'cap-red-front.jpg',
    'side': 'cap-navy-side.jpg',
    'back': 'cap-navy-back.jpg',
    'fabric': 'cap-navy-fabric.jpg',
    'top': 'cap-navy-top.jpg',
    '3q': 'cap-navy-3q.jpg'
  };

  const fileName = fileMap[photoKey] || 'cap-hero-cluster.jpg';
  if (stageImg) {
    if (window.elementaCapAssets && window.elementaCapAssets[fileName]) {
      stageImg.src = window.elementaCapAssets[fileName];
    } else if (elem && elem.querySelector('img')) {
      stageImg.src = elem.querySelector('img').src;
    }
  }

  const frontKeys = ['black', 'white', 'navy', 'red'];
  if (frontKeys.includes(photoKey)) {
    if (boundaryBox) boundaryBox.style.display = 'flex';
    if (logoBox && capState.artworkDataUrl && capState.customMethod === 'upload') logoBox.style.display = 'flex';
    if (textBox && capState.customText && capState.customMethod === 'text') textBox.style.display = 'block';

    // Also sync color swatch in customizer form
    const colorNameMap = { 'black': 'Black', 'white': 'White', 'navy': 'Navy Blue', 'red': 'Red' };
    const colorHexMap = { 'black': '#18181b', 'white': '#ffffff', 'navy': '#1e3a8a', 'red': '#dc2626' };
    const targetName = colorNameMap[photoKey];
    if (targetName) {
      capState.color = targetName;
      capState.colorHex = colorHexMap[photoKey];
      const labelElem = document.getElementById('selected-cap-color-name');
      if (labelElem) labelElem.textContent = targetName.toUpperCase();

      document.querySelectorAll('.cap-color-swatch-btn').forEach(b => {
        b.classList.remove('active');
        b.style.border = '1.5px solid #cbd5e1';
        if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${targetName}'`)) {
          b.classList.add('active');
          b.style.border = '2px solid #0284c7';
        }
      });
    }
  } else {
    if (boundaryBox) boundaryBox.style.display = 'none';
    if (logoBox) logoBox.style.display = 'none';
    if (textBox) textBox.style.display = 'none';
  }
};

window.updateCapAddBtnState = function () {
  const addBtn = document.getElementById('btn-add-cap-cart');
  const hintElem = document.getElementById('cap-add-hint-text');

  if (!addBtn) return { isValid: false, reasonMsg: '' };

  const currentMethod = capState.customMethod || 'upload'; // 'upload' or 'text'
  const authBox = document.getElementById('cap-auth-step-box');
  const authCheckbox = document.getElementById('cap-auth-checkbox');

  const hasArtwork = !!(capState.rawFile || capState.artworkFile || capState.artworkDataUrl);
  const isArtworkApproved = authCheckbox ? !!authCheckbox.checked : false;

  // Sync auth checkbox step box visibility
  if (authBox) {
    if (currentMethod === 'upload' && hasArtwork) {
      authBox.style.display = 'block';
    } else {
      authBox.style.display = 'none';
      if (!hasArtwork && authCheckbox) {
        authCheckbox.checked = false;
      }
    }
  }

  const customTextVal = (capState.customText || '').trim();
  const hasValidText = customTextVal.length > 0;

  let isValid = false;
  let reasonMsg = '';

  if (currentMethod === 'upload') {
    if (!hasArtwork) {
      reasonMsg = 'Please upload your design/logo image to enable Add to Cart';
    } else if (!isArtworkApproved) {
      reasonMsg = 'Please tick the design authorization box to proceed';
    } else {
      isValid = true;
    }
  } else if (currentMethod === 'text') {
    if (!hasValidText) {
      reasonMsg = 'Please enter your custom text to enable Add to Cart';
    } else {
      isValid = true;
    }
  }

  // Update Add to Cart button state & aesthetics
  if (addBtn) {
    if (isValid) {
      addBtn.removeAttribute('disabled');
      addBtn.disabled = false;
      addBtn.style.setProperty('opacity', '1', 'important');
      addBtn.style.setProperty('cursor', 'pointer', 'important');
      addBtn.style.setProperty('pointer-events', 'auto', 'important');
      addBtn.style.setProperty('filter', 'none', 'important');
      addBtn.style.setProperty('background', '#143d1c', 'important');
      addBtn.style.setProperty('color', '#ffffff', 'important');
      addBtn.style.setProperty('box-shadow', '0 4px 14px rgba(20,61,28,0.25)', 'important');
    } else {
      addBtn.setAttribute('disabled', 'disabled');
      addBtn.disabled = true;
      addBtn.style.setProperty('opacity', '0.45', 'important');
      addBtn.style.setProperty('cursor', 'not-allowed', 'important');
      addBtn.style.setProperty('pointer-events', 'none', 'important');
      addBtn.style.setProperty('filter', 'grayscale(0.6)', 'important');
      addBtn.style.setProperty('background', '#94a3b8', 'important');
      addBtn.style.setProperty('color', '#ffffff', 'important');
      addBtn.style.setProperty('box-shadow', 'none', 'important');
    }
  }

  // Update hint text element
  if (hintElem) {
    if (isValid) {
      hintElem.style.display = 'none';
      hintElem.textContent = '';
    } else {
      hintElem.style.display = 'block';
      hintElem.textContent = reasonMsg;
    }
  }

  return { isValid, reasonMsg };
};

window.switchCapCustomMethod = function (method, btnElem) {
  capState.customMethod = method;

  document.querySelectorAll('.cap-method-tab').forEach(b => {
    b.classList.remove('active');
    b.style.background = '#ffffff';
    b.style.color = '#475569';
    b.style.border = '1.5px solid #cbd5e1';
  });

  if (btnElem) {
    btnElem.classList.add('active');
    btnElem.style.background = '#e0f2fe';
    btnElem.style.color = '#0284c7';
    btnElem.style.border = '2px solid #0284c7';
  }

  const uploadBox = document.getElementById('cap-upload-method-box');
  const textBox = document.getElementById('cap-text-method-box');

  const canvasLogoBox = document.getElementById('cap-draggable-logo-container');
  const canvasTextBox = document.getElementById('cap-draggable-text-container');

  if (method === 'upload') {
    if (uploadBox) uploadBox.style.display = 'block';
    if (textBox) textBox.style.display = 'none';
  } else {
    if (uploadBox) uploadBox.style.display = 'none';
    if (textBox) textBox.style.display = 'block';
  }

  // Preserve both live mockups on crown if both have been provided
  if (canvasLogoBox) {
    canvasLogoBox.style.display = (capState.artworkDataUrl) ? 'flex' : 'none';
  }
  if (canvasTextBox) {
    canvasTextBox.style.display = (capState.customText && capState.customText.length > 0) ? 'block' : 'none';
  }

  if (typeof window.updateCapAddBtnState === 'function') window.updateCapAddBtnState();
};

window.handleCapFileUpload = function (input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    capState.rawFile = file;

    // Trigger CDN upload in background
    if (typeof window.uploadArtworkToShopifyCDN === 'function') {
      window.uploadArtworkToShopifyCDN(file, 'cap');
    }

    const onFileReady = function (dataUrl) {
      capState.artworkFile = file.name;
      capState.artworkDataUrl = dataUrl;

      const thumbImg = document.getElementById('cap-thumb-preview');
      if (thumbImg) thumbImg.src = dataUrl;

      const fileNameElem = document.getElementById('cap-file-name-text');
      if (fileNameElem) fileNameElem.textContent = file.name;

      const card = document.getElementById('cap-uploaded-file-card');
      if (card) card.style.display = 'block';

      const logoImg = document.getElementById('cap-canvas-logo-img');
      const logoBox = document.getElementById('cap-draggable-logo-container');

      if (logoImg) logoImg.src = dataUrl;
      if (logoBox) logoBox.style.display = 'flex';

      // Update mutual text notice
      const textNotice = document.getElementById('cap-text-file-notice');
      const textNoticeName = document.getElementById('cap-text-file-notice-name');
      if (textNotice && textNoticeName) {
        textNoticeName.textContent = file.name;
        textNotice.style.display = 'block';
      }

      if (typeof window.updateCapAddBtnState === 'function') window.updateCapAddBtnState();

      showToast(`Uploaded Cap Logo: "${file.name}" attached & rendered live on crown!`);
    };

    if (isPdf && typeof window.generatePdfPreviewDataUrl === 'function') {
      onFileReady(window.generatePdfPreviewDataUrl(file.name));
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        onFileReady(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
};

window.removeCapUploadedFile = function () {
  capState.artworkFile = null;
  capState.artworkDataUrl = null;
  capState.rawFile = null;

  const authCheckbox = document.getElementById('cap-auth-checkbox');
  if (authCheckbox) authCheckbox.checked = false;
  const authBox = document.getElementById('cap-auth-step-box');
  if (authBox) authBox.style.display = 'none';

  const card = document.getElementById('cap-uploaded-file-card');
  if (card) card.style.display = 'none';

  const logoBox = document.getElementById('cap-draggable-logo-container');
  if (logoBox) logoBox.style.display = 'none';

  const fileInput = document.getElementById('cap-file-input');
  if (fileInput) fileInput.value = '';

  const textNotice = document.getElementById('cap-text-file-notice');
  if (textNotice) textNotice.style.display = 'none';

  if (typeof window.updateCapAddBtnState === 'function') window.updateCapAddBtnState();

  showToast('Cap Logo Removed');
};

window.updateCapLogoScale = function (val) {
  const scalePct = parseInt(val, 10) || 80;
  capState.artworkScale = scalePct;

  const scaleText = document.getElementById('cap-logo-scale-text');
  if (scaleText) scaleText.textContent = `${scalePct}%`;

  const logoImg = document.getElementById('cap-canvas-logo-img');
  if (logoImg) {
    logoImg.style.transform = `scale(${scalePct / 100})`;
  }
};

window.updateCapCustomText = function (val) {
  capState.customText = String(val || '').trim();
  const textDisplay = document.getElementById('cap-canvas-text-display');
  const textBox = document.getElementById('cap-draggable-text-container');

  if (textDisplay) textDisplay.textContent = val || 'MY TEXT';

  if (textBox) {
    if (val && val.length > 0) {
      textBox.style.display = 'block';
    } else {
      textBox.style.display = 'none';
    }
  }

  // Update mutual upload notice
  const uploadNotice = document.getElementById('cap-upload-text-notice');
  const uploadNoticeVal = document.getElementById('cap-upload-text-notice-val');
  if (uploadNotice && uploadNoticeVal) {
    if (capState.customText) {
      uploadNoticeVal.textContent = capState.customText;
      uploadNotice.style.display = 'block';
    } else {
      uploadNotice.style.display = 'none';
    }
  }

  if (typeof window.updateCapAddBtnState === 'function') window.updateCapAddBtnState();
};

window.updateCapTextColor = function (hexColor, btnElem) {
  capState.textColor = hexColor;

  document.querySelectorAll('.cap-text-color-btn').forEach(b => {
    b.style.border = '1.5px solid #cbd5e1';
    b.classList.remove('active');
  });

  let targetBtn = btnElem;
  if (!targetBtn && hexColor) {
    const customCircle = document.getElementById('cap-custom-color-circle');
    if (customCircle && customCircle.dataset.color === hexColor) {
      targetBtn = customCircle;
    }
  }

  if (targetBtn) {
    targetBtn.style.border = '2px solid #0284c7';
    targetBtn.classList.add('active');
  }

  const textDisplay = document.getElementById('cap-canvas-text-display');
  if (textDisplay) {
    textDisplay.style.color = hexColor;
  }
  showToast(`Cap Text Color changed to ${hexColor.toUpperCase()}`);
};

window.onCustomCapColorPickerChange = function (hexVal) {
  if (!hexVal) return;
  const cleanHex = hexVal.replace('#', '').toUpperCase();
  const hexInput = document.getElementById('cap-custom-color-hex');
  if (hexInput) hexInput.value = cleanHex;

  const customCircle = document.getElementById('cap-custom-color-circle');
  if (customCircle) {
    customCircle.style.background = '#' + cleanHex;
    customCircle.dataset.color = '#' + cleanHex;
  }
  const plusIcon = document.getElementById('cap-custom-color-plus-icon');
  if (plusIcon) plusIcon.style.display = 'none';

  updateCapTextColor('#' + cleanHex, customCircle);
};

window.onCustomCapHexInput = function (rawVal) {
  let cleanHex = rawVal.trim().replace('#', '').toUpperCase();

  if (/^([0-9A-F]{3}){1,2}$/i.test(cleanHex)) {
    if (cleanHex.length === 3) {
      cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
    }
    const fullHex = '#' + cleanHex;

    const colorPicker = document.getElementById('cap-custom-color-picker');
    if (colorPicker) colorPicker.value = fullHex;

    const customCircle = document.getElementById('cap-custom-color-circle');
    if (customCircle) {
      customCircle.style.background = fullHex;
      customCircle.dataset.color = fullHex;
    }
    const plusIcon = document.getElementById('cap-custom-color-plus-icon');
    if (plusIcon) plusIcon.style.display = 'none';

    updateCapTextColor(fullHex, customCircle);
  }
};

window.updateCapSpecialInstructions = function (val) {
  capState.specialInstructions = String(val || '').trim();
};

window.recalculateCapPrice = function () {
  const minQty = 2;
  const qty = Math.max(minQty, capState.targetQty || minQty);
  capState.targetQty = qty;

  // Sync Custom Quantity Input Field
  const customInput = document.getElementById('elementa-custom-cap-qty-input');
  if (customInput && document.activeElement !== customInput) {
    customInput.value = qty;
  }

  // Find active slab index
  let activeSlabIndex = 0;
  for (let i = 0; i < CAP_SLABS.length; i++) {
    if (qty >= CAP_SLABS[i].min && qty <= CAP_SLABS[i].max) {
      activeSlabIndex = i;
      break;
    }
  }
  if (qty >= 150) activeSlabIndex = 6;

  const activeSlab = CAP_SLABS[activeSlabIndex];
  const unitPrice = activeSlab.unitPrice;
  const totalPrice = unitPrice * qty;

  capState.unitPrice = unitPrice;
  capState.totalPrice = totalPrice;

  // 1. Update Progress Bar Fill Line & Milestone Node Active States
  const progressFill = document.getElementById('cap-tracker-progress-fill');
  if (progressFill) {
    const pct = Math.min(100, Math.max(0, (activeSlabIndex / (CAP_SLABS.length - 1)) * 100));
    progressFill.style.width = `${pct}%`;
  }

  const nodes = document.querySelectorAll('.caps-configurator-page .elementa-milestone-node');
  nodes.forEach((node, idx) => {
    if (idx === activeSlabIndex) {
      node.classList.add('active');
      node.classList.remove('passed');
    } else if (idx < activeSlabIndex) {
      node.classList.remove('active');
      node.classList.add('passed');
    } else {
      node.classList.remove('active');
      node.classList.remove('passed');
    }
  });

  // Auto-scroll active milestone into center on mobile
  if (nodes && nodes[activeSlabIndex]) {
    try {
      nodes[activeSlabIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (e) { }
  }

  const unitPriceElem = document.getElementById('cap-summary-unit-price');
  if (unitPriceElem) unitPriceElem.textContent = `₹${unitPrice} / cap`;

  const totalPriceElem = document.getElementById('cap-summary-total-price');
  if (totalPriceElem) totalPriceElem.textContent = `₹${totalPrice.toLocaleString('en-IN')} Total`;

  // 3. Update Dynamic Upsell Nudge Bar
  const nudgeText = document.getElementById('cap-nudge-text');
  const nudgeBtn = document.getElementById('cap-nudge-btn');

  if (activeSlabIndex < CAP_SLABS.length - 1) {
    const nextSlab = CAP_SLABS[activeSlabIndex + 1];
    const deltaQty = nextSlab.min - qty;
    if (nudgeText) nudgeText.textContent = `Add ${deltaQty} more cap${deltaQty > 1 ? 's' : ''} to lower your price to ₹${nextSlab.unitPrice}/cap!`;
    if (nudgeBtn) {
      nudgeBtn.textContent = `+ Add ${deltaQty} More`;
      nudgeBtn.setAttribute('data-delta', deltaQty);
      nudgeBtn.style.display = 'inline-block';
    }
  } else {
    if (nudgeText) nudgeText.textContent = `🎉 You've unlocked our MAXIMUM 45% OFF bulk rate!`;
    if (nudgeBtn) nudgeBtn.style.display = 'none';
  }

  // 4. Update CTA Button Text
  const addBtn = document.getElementById('btn-add-cap-cart');
  if (addBtn) {
    addBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add Customized Caps to Cart • ₹${totalPrice.toLocaleString('en-IN')}`;
  }

  if (typeof window.updateCapAddBtnState === 'function') {
    window.updateCapAddBtnState();
  }
};

window.onCustomCapTotalQtyChange = function (val) {
  let qty = parseInt(val, 10);
  if (isNaN(qty) || qty < 2) qty = 2;
  capState.targetQty = qty;
  recalculateCapPrice();
};

window.adjustCustomCapTotalQuantity = function (delta) {
  let current = capState.targetQty || 2;
  let newQty = Math.max(2, current + delta);
  const customInput = document.getElementById('elementa-custom-cap-qty-input');
  if (customInput) customInput.value = newQty;
  onCustomCapTotalQtyChange(newQty);
};

window.selectCapDiscountTier = function (minQty) {
  let qty = Math.max(2, parseInt(minQty, 10) || 2);
  capState.targetQty = qty;
  const customInput = document.getElementById('elementa-custom-cap-qty-input');
  if (customInput) customInput.value = qty;
  recalculateCapPrice();
  showToast(`Selected ${qty} Pcs Cap Tier`);
};

window.toggleCapDiscountTable = function () {
  const tableBox = document.getElementById('cap-discount-table-expand');
  if (tableBox) {
    tableBox.style.display = (tableBox.style.display === 'none' || !tableBox.style.display) ? 'block' : 'none';
  }
};

window.addCapNudgeQuantity = function () {
  const nudgeBtn = document.getElementById('cap-nudge-btn');
  const delta = nudgeBtn ? (parseInt(nudgeBtn.getAttribute('data-delta'), 10) || 1) : 1;
  const newQty = (capState.targetQty || 2) + delta;
  capState.targetQty = newQty;
  recalculateCapPrice();
  showToast(`Added ${delta} more cap${delta > 1 ? 's' : ''}! New total: ${newQty} Pcs`);
};

window.addCapToCart = function () {
  if (typeof window.updateCapAddBtnState === 'function') {
    const check = window.updateCapAddBtnState();
    if (!check.isValid) {
      if (typeof showToast === 'function') showToast(check.reasonMsg || 'Please complete required custom options first.');
      return;
    }
  }

  const qty = Math.max(2, capState.targetQty || 2);
  const unitP = capState.unitPrice || 250;
  const totalPrice = capState.totalPrice || (unitP * qty);

  const hasUpload = !!(capState.rawFile || capState.artworkFile);
  const hasText = !!(capState.customText && capState.customText.trim());

  let customDetailsArr = [];
  if (hasUpload) {
    customDetailsArr.push(`Logo: "${capState.artworkFile || 'Uploaded Design'}"`);
  }
  if (hasText) {
    customDetailsArr.push(`Text: "${capState.customText}" (Color: ${capState.textColor || '#ffffff'})`);
  }
  if (customDetailsArr.length === 0) {
    customDetailsArr.push('Custom Design');
  }
  const textDetails = customDetailsArr.join(', ');
  const specialInstrStr = capState.specialInstructions ? ` [Note: ${capState.specialInstructions}]` : '';

  const itemName = `Customized Cotton Cap (${capState.color}, ${textDetails}) - ${qty} Pcs${specialInstrStr}`;
  const capPhotoUrl = (typeof getCapImageUrl === 'function') ? getCapImageUrl(capState.color) : 'assets/cap-black-front.jpg';
  const imgUrl = capState.artworkDataUrl || capPhotoUrl;

  let customMethodLabel = 'Custom Design';
  if (hasUpload && hasText) {
    customMethodLabel = 'Custom Logo + Text';
  } else if (hasUpload) {
    customMethodLabel = 'Upload Design';
  } else if (hasText) {
    customMethodLabel = 'Add Custom Text';
  }

  const props = {
    'Cap Color': capState.color,
    'Customization Method': customMethodLabel,
    'Special Instructions': capState.specialInstructions || 'None',
    'Unit Price': `₹${unitP.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'Total Price': `₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  };

  if (hasUpload) {
    props['Uploaded Artwork'] = capState.artworkCdnUrl || capState.rawFile || capState.artworkFile || 'File attached';
  }

  if (hasText) {
    props['Custom Text'] = capState.customText;
    props['Text Color'] = capState.textColor || '#ffffff';
  }

  if (typeof handleAddToCart === 'function') {
    handleAddToCart({
      id: 'cap_' + Date.now(),
      mappedVariantId: '67587052437636',
      baseTitle: 'Customized Cotton Cap',
      name: itemName,
      price: `₹${unitP.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      img: imgUrl,
      quantity: qty,
      properties: props
    });
  } else {
    showToast(`Added ${qty} Customized Cotton Caps to Cart!`);
  }
};

window.giftVideosData = [
  {
    title: "Executive 3-in-1 Gift Set Overview & Showcase",
    duration: "HD Video 1",
    src: "assets/gift-video-1.mp4",
    poster: "assets/gift-set-customize-detail.jpg"
  },
  {
    title: "Precision Laser Engraving Craftsmanship",
    duration: "HD Video 2",
    src: "assets/gift-video-2.mp4",
    poster: "assets/gift-product-1.jpg"
  },
  {
    title: "Metallic Card Holder & Rollerball Pen Close-Up",
    duration: "HD Video 3",
    src: "assets/gift-video-3.mp4",
    poster: "assets/gift-product-3.jpg"
  },
  {
    title: "Luxury Presentation Box & Gift Unboxing",
    duration: "HD Video 4",
    src: "assets/gift-video-4.mp4",
    poster: "assets/gift-product-1-main.jpg"
  }
];

window.switchGiftShowcaseVideo = function (index) {
  const thumbCard = document.getElementById('gift-video-thumb-' + index);

  let src = thumbCard ? thumbCard.getAttribute('data-video-src') : null;
  let poster = thumbCard ? thumbCard.getAttribute('data-video-poster') : null;
  let title = thumbCard ? thumbCard.getAttribute('data-video-title') : null;
  let duration = thumbCard ? thumbCard.getAttribute('data-video-duration') : null;

  if (!src && window.giftVideosData && window.giftVideosData[index]) {
    const videoData = window.giftVideosData[index];
    src = videoData.src;
    poster = videoData.poster;
    title = videoData.title;
    duration = videoData.duration;
  }

  const player = document.getElementById('gift-showcase-video-player');
  const playerSrc = document.getElementById('gift-showcase-video-src');
  const titleElem = document.getElementById('gift-active-video-title');
  const durationElem = document.getElementById('gift-active-video-duration');

  if (titleElem && title) titleElem.textContent = title;
  if (durationElem && duration) durationElem.textContent = duration;

  if (player && playerSrc && src) {
    if (poster) player.poster = poster;
    playerSrc.src = src;
    player.load();
    player.play().catch(e => console.log('Autoplay prevented or paused:', e));
  }

  document.querySelectorAll('.gift-video-thumb-card').forEach((card, idx) => {
    if (idx === index) {
      card.style.borderColor = '#0284c7';
      card.style.borderWidth = '2.5px';
      card.style.background = '#f0f9ff';
      card.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.15)';
      const btn = card.querySelector('.fa-play')?.parentElement;
      if (btn) {
        btn.style.background = '#0284c7';
        btn.style.color = '#ffffff';
      }
    } else {
      card.style.borderColor = '#e2e8f0';
      card.style.borderWidth = '1.5px';
      card.style.background = '#ffffff';
      card.style.boxShadow = 'none';
      const btn = card.querySelector('.fa-play')?.parentElement;
      if (btn) {
        btn.style.background = 'rgba(255,255,255,0.9)';
        btn.style.color = '#0f172a';
      }
    }
  });
};

window.buyCapNow = function () {
  if (typeof window.updateCapAddBtnState === 'function') {
    const check = window.updateCapAddBtnState();
    if (!check.isValid) {
      if (typeof showToast === 'function') showToast(check.reasonMsg || 'Please complete required custom options first.');
      return;
    }
  }
  addCapToCart();
  setTimeout(() => {
    if (typeof openCartDrawer === 'function') openCartDrawer();
  }, 300);
};

/* ==========================================================================
   Home Page Parallax & Interactive Scroll Effects Engine
   ========================================================================== */
window.addEventListener('scroll', function () {
  const scrolled = window.pageYOffset;
  const parallaxLayers = document.querySelectorAll('.parallax-floating-layer');
  parallaxLayers.forEach((layer) => {
    const speed = parseFloat(layer.getAttribute('data-parallax-speed')) || 0.12;
    layer.style.transform = `translateY(${scrolled * speed}px)`;
  });

  const parallaxBgs = document.querySelectorAll('.parallax-bg-layer');
  parallaxBgs.forEach((bg) => {
    const speed = parseFloat(bg.getAttribute('data-parallax-speed')) || 0.06;
    bg.style.backgroundPositionY = `${scrolled * speed}px`;
  });
}, { passive: true });

/* ==========================================================================
   Horizontal Drag Scroll for Color Swatch Grid & Sliders
   ========================================================================== */
(function () {
  function initDragScrollContainers() {
    const containers = document.querySelectorAll('.tshirt-color-grid, #tshirt-color-grid-container, .elementa-milestones-track-wrapper');
    containers.forEach(container => {
      if (container.dataset.dragScrollInit) return;
      container.dataset.dragScrollInit = 'true';
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let moved = false;

      container.addEventListener('mousedown', (e) => {
        isDown = true;
        moved = false;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        container.style.cursor = '';
      });

      container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = '';
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 4) {
          moved = true;
          container.style.cursor = 'grabbing';
        }
        container.scrollLeft = scrollLeft - walk;
      });

      // Prevent accidental click when dragging
      container.addEventListener('click', (e) => {
        if (moved) {
          e.stopPropagation();
          e.preventDefault();
          moved = false;
        }
      }, true);

      // Support horizontal scrolling on mouse wheel
      container.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && container.scrollWidth > container.clientWidth) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDragScrollContainers);
  } else {
    initDragScrollContainers();
  }
  window.addEventListener('load', initDragScrollContainers);
})();


// Auto-correct any 'trasfer' typos to 'transfer' in inbuilt sticker titles
document.addEventListener('DOMContentLoaded', function () {
  function sanitizeStickerTitles() {
    document.querySelectorAll('.inbuilt-card-title, #inbuilt-modal-title, .inbuilt-product-card img').forEach(function (el) {
      if (el.tagName === 'IMG' && el.alt && /trasfer/i.test(el.alt)) {
        el.alt = el.alt.replace(/trasfer/gi, 'Transfer');
      } else if (el.textContent && /trasfer/i.test(el.textContent)) {
        el.textContent = el.textContent.replace(/trasfer/gi, 'Transfer');
      }
    });
  }
  sanitizeStickerTitles();
  setTimeout(sanitizeStickerTitles, 500);
  setTimeout(sanitizeStickerTitles, 1500);
});
