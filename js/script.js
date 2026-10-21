/**
 * National Computer — Public Website Logic
 * Connects to Firebase Firestore for dynamic products, categories, services & content,
 * with resilient offline/fallback support.
 */

import { 
  fetchActiveProducts, 
  fetchCategories, 
  fetchServices, 
  fetchWebsiteContent 
} from "./firebase-service.js";

// ============================================================================
// BASELINE BUSINESS SETTINGS
// ============================================================================
export let BUSINESS_CONFIG = {
  name: "National Computer",
  phone: "+92 306 6343757 (0306-6343757)",
  whatsappNumber: "03066343757",
  email: "info@nationalcomputer.com",
  address: "National Computer, Silicon Plaza / Main Tech Market",
  hours: "Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 4:00 PM",
  heroTitle: "Your Technology Partner — National Computer",
  heroDescription: "Empowering individuals and businesses with top-tier laptops, desktop workstations, premium peripherals, and dependable hardware repair services. Built on technical excellence and customer trust.",
  heroImage: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  footerText: "© 2026 National Computer. All rights reserved. Professional Computer Sales & Repair Services.",
};

// ============================================================================
// BASELINE PRODUCTS CATALOG DATA (With PKR Currency & USD Fallback)
// ============================================================================
export let PRODUCTS_DATA = [
  {
    id: "pc-pro-desk-01",
    name: "National Pro Tower Workstation",
    category: "desktops",
    categoryLabel: "Desktop Computers",
    image: "https://images.unsplash.com/photo-1587202374463-8874a6866382?auto=format&fit=crop&w=700&q=80",
    description: "High-performance desktop for creative pros, 3D rendering, and demanding multitasking.",
    specs: ["Core i7 14th Gen", "32GB DDR5 RAM", "1TB NVMe Gen4", "RTX 4070 12GB"],
    price: "PKR 415,000",
    currency: "PKR",
    isFeatured: true,
    badge: "Best Seller",
    isActive: true,
  },
  {
    id: "lap-zen-14",
    name: "UltraBook Pro Slim 14\"",
    category: "laptops",
    categoryLabel: "Laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80",
    description: "All-day battery life in a featherlight aluminum chassis. Perfect for executives and students.",
    specs: ["14\" 2.8K OLED 120Hz", "Intel Core Ultra 7", "16GB LPDDR5X", "512GB SSD"],
    price: "PKR 319,000",
    currency: "PKR",
    isFeatured: true,
    badge: "Featured",
    isActive: true,
  },
  {
    id: "mon-curv-27",
    name: "ViewMaster 27\" QHD Curved Monitor",
    category: "monitors",
    categoryLabel: "Monitors",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80",
    description: "Immersive 1500R curved gaming & productivity display with vivid HDR colors and 165Hz refresh.",
    specs: ["27-inch 2560x1440", "165Hz / 1ms", "HDR400 Support", "HDMI 2.1 & DP 1.4"],
    price: "PKR 79,000",
    currency: "PKR",
    isFeatured: true,
    badge: "Popular",
    isActive: true,
  },
  {
    id: "prn-laser-x1",
    name: "OfficeJet Pro All-in-One Wireless Printer",
    category: "printers",
    categoryLabel: "Printers",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=700&q=80",
    description: "High-speed auto-duplex wireless color printing, scanning, and copying with low-cost ink tanks.",
    specs: ["35 ppm Print Speed", "Auto-Duplex", "Wi-Fi & Ethernet", "Eco-Tank System"],
    price: "PKR 97,000",
    currency: "PKR",
    isFeatured: true,
    badge: "Eco-Save",
    isActive: true,
  },
  {
    id: "lap-game-16",
    name: "Titan Predator 16\" Gaming Laptop",
    category: "laptops",
    categoryLabel: "Laptops",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=80",
    description: "Uncapped gaming power with vapor chamber cooling and per-key RGB mechanical keyboard.",
    specs: ["AMD Ryzen 9 7945HX", "RTX 4080 16GB", "32GB DDR5", "240Hz QHD Display"],
    price: "PKR 595,000",
    currency: "PKR",
    isFeatured: false,
    badge: "High Performance",
    isActive: true,
  },
  {
    id: "pc-office-sff",
    name: "National Slim Office PC Core i5",
    category: "desktops",
    categoryLabel: "Desktop Computers",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=700&q=80",
    description: "Space-saving compact form factor desktop engineered for corporate productivity and quiet operation.",
    specs: ["Core i5 13th Gen", "16GB RAM", "512GB NVMe SSD", "Dual DisplayPort"],
    price: "PKR 179,000",
    currency: "PKR",
    isFeatured: false,
    badge: "Office Ready",
    isActive: true,
  },
  {
    id: "kb-mech-rgb",
    name: "Apex Mechanical RGB Tactile Keyboard",
    category: "keyboards",
    categoryLabel: "Keyboards",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
    description: "Hot-swappable tactile mechanical switches, aircraft-grade aluminum top frame, and sound dampening.",
    specs: ["Brown Switches", "Hot-Swappable", "PBT Double-Shot", "Detachable USB-C"],
    price: "PKR 24,500",
    currency: "PKR",
    isFeatured: false,
    badge: "Hot-Swap",
    isActive: true,
  },
  {
    id: "ms-precision-wire",
    name: "Precision Master Wireless Ergonomic Mouse",
    category: "mouse",
    categoryLabel: "Mouse",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700&q=80",
    description: "Sculpted ergonomic grip with dual Bluetooth/2.4GHz connectivity and hyper-fast metal scroll wheel.",
    specs: ["4000 DPI Darkfield", "Rechargeable Type-C", "Multi-Device Pair", "70-Day Battery"],
    price: "PKR 18,900",
    currency: "PKR",
    isFeatured: false,
    badge: "Ergonomic",
    isActive: true,
  },
  {
    id: "mon-4k-32",
    name: "ColorCraft 32\" 4K UHD Designer Monitor",
    category: "monitors",
    categoryLabel: "Monitors",
    image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=700&q=80",
    description: "Factory calibrated 99% DCI-P3 color reproduction with USB-C 90W single-cable power delivery.",
    specs: ["3840x2160 IPS Panel", "99% DCI-P3 / sRGB", "USB-C 90W PD", "Ergonomic Stand"],
    price: "PKR 159,000",
    currency: "PKR",
    isFeatured: false,
    badge: "Color Accurate",
    isActive: true,
  },
  {
    id: "acc-nvme-2tb",
    name: "FastDrive Pro 2TB Gen4 NVMe M.2 SSD",
    category: "accessories",
    categoryLabel: "Accessories",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80",
    description: "Blazing fast read speeds up to 7400 MB/s for lightning boot times, gaming, and file transfers.",
    specs: ["7400 MB/s Read", "6800 MB/s Write", "Heatsink Included", "5-Year Warranty"],
    price: "PKR 44,000",
    currency: "PKR",
    isFeatured: false,
    badge: "Gen4 Speed",
    isActive: true,
  },
  {
    id: "kb-ergo-split",
    name: "ErgoWave Wireless Split Keyboard",
    category: "keyboards",
    categoryLabel: "Keyboards",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=700&q=80",
    description: "Cushioned palm rest and split curved layout designed to relieve wrist strain during long work days.",
    specs: ["Split Curve Frame", "Memory Foam Rest", "Quiet Scissor Keys", "Multi-OS Support"],
    price: "PKR 32,500",
    currency: "PKR",
    isFeatured: false,
    badge: "Comfort",
    isActive: true,
  },
  {
    id: "prn-laser-mono",
    name: "National FastMono Heavy-Duty Laser Printer",
    category: "printers",
    categoryLabel: "Printers",
    image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=700&q=80",
    description: "Workhorse black & white laser printer for high volume office documentation and invoice printing.",
    specs: ["42 ppm Speed", "1200 DPI Crisp Text", "250-Sheet Tray", "Low Toner Cost"],
    price: "PKR 63,000",
    currency: "PKR",
    isFeatured: false,
    badge: "Workhorse",
    isActive: true,
  },
  {
    id: "acc-dock-usbc",
    name: "Triple-Display USB-C Thunderbolt 4 Dock",
    category: "accessories",
    categoryLabel: "Accessories",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80",
    description: "Connect 3 external monitors, Gigabit Ethernet, audio, and all USB accessories through a single cable.",
    specs: ["14-in-1 Ports", "100W Laptop Charge", "Dual 4K / Triple FHD", "SD 4.0 Card Slot"],
    price: "PKR 49,000",
    currency: "PKR",
    isFeatured: false,
    badge: "14-in-1",
    isActive: true,
  },
  {
    id: "ms-ultra-light",
    name: "ViperSpeed 59g Lightweight Gaming Mouse",
    category: "mouse",
    categoryLabel: "Mouse",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=80",
    description: "Featherlight 59-gram honeycomb chassis with optical switches and zero-drag paracord cable.",
    specs: ["26,000 DPI Optical", "59g Ultra-Light", "Optical Switches", "Pure PTFE Skates"],
    price: "PKR 15,000",
    currency: "PKR",
    isFeatured: false,
    badge: "Ultra-Light",
    isActive: true,
  }
];

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupInquiryModal();
  if (document.getElementById("contact-form")) setupContactForm();

  // 1. Initial render with fallback data so page is never blank
  setupDynamicPlaceholders();
  setupWhatsAppLinks();

  if (document.getElementById("featured-products-container")) {
    renderFeaturedProducts();
  }
  if (document.getElementById("products-catalog-container")) {
    initProductsPage();
  }

  // 2. Load live data from Firestore in the background and update UI
  await syncLiveContentFromFirestore();
});

async function syncLiveContentFromFirestore() {
  try {
    // Sync Content & Settings
    const liveContent = await fetchWebsiteContent();
    if (liveContent) {
      BUSINESS_CONFIG = { ...BUSINESS_CONFIG, ...liveContent };
      setupDynamicPlaceholders();
      setupWhatsAppLinks();

      // Update live hero if on homepage
      const heroTitleEl = document.querySelector(".hero-title");
      const heroDescEl = document.querySelector(".hero-description");
      const heroImgEl = document.querySelector(".hero-image");

      if (heroTitleEl && liveContent.heroTitle) {
        heroTitleEl.innerHTML = liveContent.heroTitle.includes("National")
          ? liveContent.heroTitle.replace("National Computer", `<span class="highlight">National Computer</span>`)
          : escapeHtml(liveContent.heroTitle);
      }
      if (heroDescEl && liveContent.heroDescription) {
        heroDescEl.textContent = liveContent.heroDescription;
      }
      if (heroImgEl && liveContent.heroImage) {
        heroImgEl.src = liveContent.heroImage;
      }
    }

    // Sync Products
    const liveProds = await fetchActiveProducts();
    if (liveProds && liveProds.length > 0) {
      PRODUCTS_DATA = liveProds;

      if (document.getElementById("featured-products-container")) {
        renderFeaturedProducts();
      }
      if (document.getElementById("products-catalog-container")) {
        initProductsPage();
      }
    }
  } catch (e) {
    console.warn("Operating with local fallback content:", e);
  }
}

// ============================================================================
// NAVIGATION & MOBILE MENU
// ============================================================================
function setupNavigation() {
  const menuBtn = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!isExpanded));
      navMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target) && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// ============================================================================
// DYNAMIC EDITABLE PLACEHOLDERS
// ============================================================================
function setupDynamicPlaceholders() {
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const key = el.getAttribute("data-cfg");
    if (BUSINESS_CONFIG[key]) {
      if (el.tagName === "A" && key === "phone") {
        el.setAttribute("href", `tel:${BUSINESS_CONFIG.phone.replace(/[^0-9+]/g, "")}`);
        el.textContent = BUSINESS_CONFIG.phone;
      } else if (el.tagName === "A" && key === "email") {
        el.setAttribute("href", `mailto:${BUSINESS_CONFIG.email}`);
        el.textContent = BUSINESS_CONFIG.email;
      } else {
        el.textContent = BUSINESS_CONFIG[key];
      }
    }
  });
}

// ============================================================================
// WHATSAPP URL GENERATION
// ============================================================================
export function normalizeWhatsAppNumber(raw) {
  let clean = String(raw || "03066343757").replace(/[^0-9]/g, "");
  if (clean.startsWith("0092")) {
    clean = clean.slice(2);
  } else if (clean.startsWith("0")) {
    clean = "92" + clean.slice(1);
  } else if (!clean.startsWith("92")) {
    clean = "92" + clean;
  }
  return clean;
}

export function getWhatsAppUrl(customMessage = "") {
  const defaultMsg = `Hello National Computer, I would like to inquire about your products and services.`;
  const text = encodeURIComponent(customMessage || defaultMsg);
  const cleanPhone = normalizeWhatsAppNumber(BUSINESS_CONFIG.whatsappNumber || "03066343757");
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

function setupWhatsAppLinks() {
  document.querySelectorAll(".whatsapp-link").forEach((btn) => {
    const customText = btn.getAttribute("data-wa-text") || "";
    btn.setAttribute("href", getWhatsAppUrl(customText));
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener noreferrer");
  });
}

// ============================================================================
// FEATURED PRODUCTS RENDERER (Homepage)
// ============================================================================
function renderFeaturedProducts() {
  const container = document.getElementById("featured-products-container");
  if (!container) return;

  const featured = PRODUCTS_DATA.filter((p) => p.isFeatured && p.isActive !== false).slice(0, 4);
  const displayItems = featured.length > 0 ? featured : PRODUCTS_DATA.slice(0, 4);
  container.innerHTML = displayItems.map((product) => createProductCardHtml(product)).join("");
  bindCardButtons(container);
}

// ============================================================================
// PRODUCT CARD HTML BUILDER
// ============================================================================
function createProductCardHtml(product) {
  const specsHtml = product.specs
    ? product.specs.map((s) => `<span class="spec-chip">${escapeHtml(s)}</span>`).join("")
    : "";

  let displayPrice = product.price || "PKR 0";
  if (!displayPrice.toUpperCase().includes("PKR") && !displayPrice.startsWith("$")) {
    displayPrice = `PKR ${displayPrice}`;
  }

  const waMessage = `Hello National Computer, I'm interested in "${product.name}" (${displayPrice} Sample Price). Is it currently in stock?`;
  const waLink = getWhatsAppUrl(waMessage);

  return `
    <article class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="product-image-wrap">
        <div class="product-badge-wrap">
          <span class="badge badge-cyan">${escapeHtml(product.categoryLabel || product.category)}</span>
          ${product.badge ? `<span class="badge badge-success">${escapeHtml(product.badge)}</span>` : ""}
        </div>
        <img 
          src="${product.image || 'https://images.unsplash.com/photo-1587202374463-8874a6866382?auto=format&fit=crop&w=700&q=80'}" 
          alt="${escapeHtml(product.name)}" 
          class="product-img"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1587202374463-8874a6866382?auto=format&fit=crop&w=700&q=80';"
        />
      </div>
      <div class="product-info">
        <span class="product-category-label">${escapeHtml(product.categoryLabel || product.category)}</span>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <p class="product-desc">${escapeHtml(product.description || "")}</p>
        <div class="product-specs">${specsHtml}</div>
        
        <div class="product-price-row">
          <div class="price-container">
            <span class="price-label">Sample Price</span>
            <span class="price-value">${displayPrice}</span>
          </div>
        </div>

        <div class="product-actions">
          <button type="button" class="btn btn-outline btn-sm quick-inquire-btn" data-product-id="${product.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Inquire
          </button>
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.181-.176.2-.352.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.135-.135.301-.352.452-.527.15-.176.201-.301.301-.502.1-.2.05-.377-.025-.527-.075-.15-.678-1.635-.929-2.239-.244-.588-.493-.508-.678-.518-.176-.01-.377-.01-.578-.01-.2 0-.527.075-.803.377-.276.301-1.055 1.03-1.055 2.511 0 1.481 1.08 2.91 1.231 3.111.15.2 2.125 3.245 5.148 4.551.719.311 1.28.497 1.718.636.722.23 1.378.197 1.9.119.582-.088 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.578-.352z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

function bindCardButtons(container) {
  container.querySelectorAll(".quick-inquire-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.getAttribute("data-product-id");
      const product = PRODUCTS_DATA.find((p) => p.id === pid);
      if (product) {
        openInquiryModal(product);
      }
    });
  });
}

// ============================================================================
// PRODUCTS & SERVICES CATALOG (Products Page)
// ============================================================================
function initProductsPage() {
  const container = document.getElementById("products-catalog-container");
  const searchInput = document.getElementById("product-search");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const countEl = document.getElementById("products-count");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let activeCategory = urlParams.get("category") || "all";
  let searchTerm = "";

  filterBtns.forEach((btn) => {
    if (btn.getAttribute("data-category") === activeCategory) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }

    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category");
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    const activeItems = PRODUCTS_DATA.filter((p) => p.isActive !== false);

    const filtered = activeItems.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.categoryLabel && product.categoryLabel.toLowerCase().includes(searchTerm)) ||
        (product.specs && product.specs.some((s) => s.toLowerCase().includes(searchTerm)));

      return matchesCategory && matchesSearch;
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${activeItems.length} products`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="no-products-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a;">No matching products found</h3>
          <p style="color: #64748b; font-size: 0.95rem;">Try adjusting your search terms or selecting another category.</p>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map((p) => createProductCardHtml(p)).join("");
      bindCardButtons(container);
    }
  }

  applyFilters();
}

// ============================================================================
// QUICK INQUIRY MODAL
// ============================================================================
let currentModalProduct = null;

function setupInquiryModal() {
  const modalOverlay = document.getElementById("inquiry-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  if (!modalOverlay) return;

  const closeModal = () => modalOverlay.classList.remove("active");

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  const modalWaBtn = document.getElementById("modal-whatsapp-btn");
  const modalFormBtn = document.getElementById("modal-form-jump-btn");

  if (modalWaBtn) {
    modalWaBtn.addEventListener("click", () => {
      if (!currentModalProduct) return;
      const msg = `Hello National Computer, I would like to inquire about the ${currentModalProduct.name} (${currentModalProduct.price} Sample Price).`;
      window.open(getWhatsAppUrl(msg), "_blank");
      closeModal();
    });
  }

  if (modalFormBtn) {
    modalFormBtn.addEventListener("click", () => {
      if (!currentModalProduct) return;
      closeModal();
      
      const formServiceSelect = document.getElementById("form-service");
      const formMsgTextarea = document.getElementById("form-message");
      const contactSection = document.getElementById("contact");

      if (formServiceSelect) formServiceSelect.value = "Product Inquiry";
      if (formMsgTextarea) {
        formMsgTextarea.value = `I am interested in inquiring about "${currentModalProduct.name}" (${currentModalProduct.price} Sample Price). Please contact me with availability and purchase details.`;
      }
      if (contactSection) contactSection.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function openInquiryModal(product) {
  currentModalProduct = product;
  const modalOverlay = document.getElementById("inquiry-modal");
  const modalProdTitle = document.getElementById("modal-product-title");
  const modalProdPrice = document.getElementById("modal-product-price");
  const modalProdDesc = document.getElementById("modal-product-desc");
  const modalWaBtn = document.getElementById("modal-whatsapp-btn");

  if (modalProdTitle) modalProdTitle.textContent = product.name;
  if (modalProdPrice) modalProdPrice.textContent = `${product.price} (Sample Price)`;
  if (modalProdDesc) modalProdDesc.textContent = product.description || "";

  if (modalWaBtn) {
    const msg = `Hello National Computer, I would like to inquire about "${product.name}" (${product.price} Sample Price). Is it currently available?`;
    modalWaBtn.setAttribute("href", getWhatsAppUrl(msg));
  }

  if (modalOverlay) {
    modalOverlay.classList.add("active");
  }
}

// ============================================================================
// CONTACT FORM VALIDATION
// ============================================================================
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const alertBox = document.getElementById("form-alert");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;
    const nameInput = document.getElementById("form-name");
    const phoneInput = document.getElementById("form-phone");
    const messageInput = document.getElementById("form-message");

    form.querySelectorAll(".form-group").forEach((grp) => grp.classList.remove("has-error"));
    if (alertBox) {
      alertBox.className = "form-alert";
      alertBox.style.display = "none";
    }

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, "Please enter your name (minimum 2 characters).");
      isValid = false;
    }

    const cleanPhone = phoneInput.value.replace(/[\s\-()]/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      showError(phoneInput, "Please enter a valid phone number (at least 7 digits).");
      isValid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showError(messageInput, "Please provide message details (minimum 10 characters).");
      isValid = false;
    }

    if (!isValid) return;

    if (alertBox) {
      alertBox.className = "form-alert success";
      alertBox.innerHTML = `
        <strong>Message Validated Successfully!</strong><br />
        Thank you, <em>${escapeHtml(nameInput.value.trim())}</em>. Your inquiry details are ready.<br />
        <small style="display:block; margin-top: 6px; color: #047857;">
          Note: Static form inputs are verified. For instant direct assistance, contact us via WhatsApp or Phone.
        </small>
      `;
      alertBox.style.display = "block";
    }

    form.reset();
  });
}

function showError(inputEl, msg) {
  const group = inputEl.closest(".form-group");
  if (group) {
    group.classList.add("has-error");
    const errorEl = group.querySelector(".form-error");
    if (errorEl) errorEl.textContent = msg;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
