/**
 * National Computer — Admin Dashboard Logic
 */

import { setupAdminLayout } from "./admin-ui.js";
import { 
  fetchAllProducts, 
  fetchCategories, 
  fetchServices, 
  seedInitialDatabaseIfEmpty 
} from "./firebase-service.js";
import { PRODUCTS_DATA, BUSINESS_CONFIG } from "./script.js";

const DEFAULT_CATEGORIES = [
  { id: "cat-desktops", name: "Desktop Computers", slug: "desktops", description: "Gaming rigs, office workstations, all-in-one PCs." },
  { id: "cat-laptops", name: "Laptops", slug: "laptops", description: "Business ultrabooks, gaming laptops, student notebooks." },
  { id: "cat-monitors", name: "Monitors", slug: "monitors", description: "Gaming displays, 4K UHD designer screens, curved panels." },
  { id: "cat-keyboards", name: "Keyboards", slug: "keyboards", description: "Mechanical, ergonomic, and wireless keyboards." },
  { id: "cat-mouse", name: "Mouse", slug: "mouse", description: "Ergonomic productivity mice, ultra-lightweight gaming mice." },
  { id: "cat-printers", name: "Printers", slug: "printers", description: "Laser jet, ink tank, wireless duplex printers." },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", description: "NVMe SSDs, USB-C docks, RAM modules, cables." },
];

const DEFAULT_SERVICES = [
  { id: "srv-comp-rep", title: "Computer Repair", description: "Comprehensive hardware troubleshooting, motherboard repair, and power diagnostics.", turnaround: "24 - 48 Hours", isActive: true },
  { id: "srv-lap-rep", title: "Laptop Repair", description: "OEM screen replacements, battery renewal, hinge restorations, and charging jack repairs.", turnaround: "24 Hours", isActive: true },
  { id: "srv-win-inst", title: "Windows Installation", description: "Genuine OS setup, partition alignment, driver updates, and data preservation.", turnaround: "2 - 4 Hours", isActive: true },
  { id: "srv-soft-inst", title: "Software & Antivirus", description: "Malware removal, business productivity suites, and performance cleanup.", turnaround: "Same Day", isActive: true },
  { id: "srv-hw-upg", title: "Hardware Upgrades", description: "SSD cloning, high-speed RAM expansions, and graphics card upgrades.", turnaround: "1 - 2 Hours", isActive: true },
  { id: "srv-it-sup", title: "IT Support", description: "Office network configuration, Wi-Fi mesh, NAS storage, and remote support.", turnaround: "Scheduled", isActive: true },
];

document.addEventListener("DOMContentLoaded", async () => {
  setupAdminLayout("dashboard");

  // Ensure initial database seeding if collection is fresh
  await seedInitialDatabaseIfEmpty(
    PRODUCTS_DATA.map((p) => ({
      ...p,
      currency: "PKR",
      // Convert sample dollar to sample PKR for consistency
      price: p.price.startsWith("$")
        ? `PKR ${(parseInt(p.price.replace(/[^0-9]/g, ""), 10) * 278).toLocaleString()}`
        : p.price,
      isActive: true,
    })),
    DEFAULT_CATEGORIES,
    DEFAULT_SERVICES,
    BUSINESS_CONFIG
  );

  loadDashboardStats();
});

async function loadDashboardStats() {
  try {
    const [products, categories, services] = await Promise.all([
      fetchAllProducts(),
      fetchCategories(),
      fetchServices(),
    ]);

    const activeCount = products.filter((p) => p.isActive !== false).length;

    // Update Metric Badges
    document.getElementById("stat-total-products").textContent = products.length;
    document.getElementById("stat-active-products").textContent = activeCount;
    document.getElementById("stat-total-categories").textContent = categories.length;
    document.getElementById("stat-total-services").textContent = services.length;

    // Populate Recent Products Table
    renderRecentProducts(products.slice(0, 5));
  } catch (err) {
    console.error("Error loading dashboard metrics:", err);
  }
}

function renderRecentProducts(items) {
  const tbody = document.getElementById("recent-products-tbody");
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">
          No products found. Click "Add New Product" to populate your inventory.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items
    .map((prod) => {
      const priceDisplay = prod.price || "PKR 0";
      const isActive = prod.isActive !== false;

      return `
        <tr>
          <td>
            <div class="prod-name-cell">
              <img 
                src="${prod.image || 'https://images.unsplash.com/photo-1587202374463-8874a6866382?auto=format&fit=crop&w=150&q=80'}" 
                alt="${escapeHtml(prod.name)}" 
                class="prod-thumb" 
                onerror="this.src='https://images.unsplash.com/photo-1587202374463-8874a6866382?auto=format&fit=crop&w=150&q=80';"
              />
              <div>
                <div class="prod-name-title">${escapeHtml(prod.name)}</div>
                <div class="prod-name-sub">${prod.isFeatured ? '<span class="badge-featured">Featured</span>' : ''}</div>
              </div>
            </div>
          </td>
          <td><span style="font-weight: 500; font-size: 0.85rem;">${escapeHtml(prod.categoryLabel || prod.category)}</span></td>
          <td><strong style="color: #0a192f;">${escapeHtml(priceDisplay)}</strong></td>
          <td>
            <span class="status-pill ${isActive ? 'status-active' : 'status-inactive'}">
              ${isActive ? 'Active' : 'Draft / Inactive'}
            </span>
          </td>
          <td>
            <a href="products.html?edit=${prod.id}" class="btn-admin btn-admin-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.65rem;">
              Edit Product
            </a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
