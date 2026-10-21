/**
 * National Computer — Admin Product Management
 */

import { setupAdminLayout, showToast, confirmAction } from "./admin-ui.js";
import { 
  fetchAllProducts, 
  fetchCategories, 
  saveProduct, 
  deleteProductById, 
  toggleProductActive 
} from "./firebase-service.js";

let allProducts = [];
let allCategories = [];

document.addEventListener("DOMContentLoaded", async () => {
  setupAdminLayout("products");
  setupModalHandlers();
  setupFilterHandlers();

  await loadData();

  // Check URL params e.g. products.html?action=new or products.html?edit=id
  const params = new URLSearchParams(window.location.search);
  if (params.get("action") === "new") {
    openModalForAdd();
  } else if (params.get("edit")) {
    const editId = params.get("edit");
    const found = allProducts.find((p) => p.id === editId);
    if (found) openModalForEdit(found);
  }
});

async function loadData() {
  try {
    const [prods, cats] = await Promise.all([
      fetchAllProducts(),
      fetchCategories(),
    ]);

    allProducts = prods;
    allCategories = cats;

    populateCategoryDropdowns();
    renderProductsTable();
  } catch (err) {
    console.error("Failed to load products/categories:", err);
    showToast("Error loading catalog data from database.", "error");
  }
}

function populateCategoryDropdowns() {
  const filterSelect = document.getElementById("admin-category-filter");
  const modalSelect = document.getElementById("prod-category");

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="all">All Categories</option>` + 
      allCategories.map((c) => `<option value="${c.slug}">${escapeHtml(c.name)}</option>`).join("");
  }

  if (modalSelect) {
    modalSelect.innerHTML = allCategories
      .map((c) => `<option value="${c.slug}" data-label="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`)
      .join("");
  }
}

function setupFilterHandlers() {
  const searchInput = document.getElementById("admin-search-input");
  const catFilter = document.getElementById("admin-category-filter");
  const statusFilter = document.getElementById("admin-status-filter");

  const runFilter = () => renderProductsTable();

  if (searchInput) searchInput.addEventListener("input", runFilter);
  if (catFilter) catFilter.addEventListener("change", runFilter);
  if (statusFilter) statusFilter.addEventListener("change", runFilter);
}

function renderProductsTable() {
  const tbody = document.getElementById("products-table-tbody");
  const countEl = document.getElementById("products-table-count");
  if (!tbody) return;

  const searchTerm = (document.getElementById("admin-search-input")?.value || "").toLowerCase().trim();
  const catVal = document.getElementById("admin-category-filter")?.value || "all";
  const statusVal = document.getElementById("admin-status-filter")?.value || "all";

  const filtered = allProducts.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)) ||
      (p.category && p.category.toLowerCase().includes(searchTerm));

    const matchesCat = catVal === "all" || p.category === catVal;

    let matchesStatus = true;
    if (statusVal === "active") matchesStatus = p.isActive !== false;
    else if (statusVal === "inactive") matchesStatus = p.isActive === false;
    else if (statusVal === "featured") matchesStatus = Boolean(p.isFeatured);

    return matchesSearch && matchesCat && matchesStatus;
  });

  if (countEl) {
    countEl.textContent = `Products Inventory (${filtered.length} of ${allProducts.length})`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2.5rem; color: #94a3b8;">
          No matching products found. Try adjusting your search or filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((prod) => {
      const isActive = prod.isActive !== false;
      let formattedPrice = prod.price || "PKR 0";
      if (!formattedPrice.toUpperCase().includes("PKR") && !formattedPrice.startsWith("$")) {
        formattedPrice = `PKR ${formattedPrice}`;
      }

      return `
        <tr data-id="${prod.id}">
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
                ${prod.badge ? `<span style="font-size: 0.72rem; color: #0284c7; background: #e0f2fe; padding: 0.1rem 0.4rem; border-radius: 4px;">${escapeHtml(prod.badge)}</span>` : ""}
              </div>
            </div>
          </td>
          <td><span style="font-weight: 500;">${escapeHtml(prod.categoryLabel || prod.category)}</span></td>
          <td><strong style="color: #0a192f;">${escapeHtml(formattedPrice)}</strong></td>
          <td>
            <button type="button" class="status-pill ${isActive ? 'status-active' : 'status-inactive'} toggle-status-btn" data-id="${prod.id}" data-current="${isActive}" style="cursor: pointer; border: 1px solid currentColor;">
              ${isActive ? 'Active' : 'Draft / Hidden'}
            </button>
          </td>
          <td>
            ${prod.isFeatured ? '<span class="badge-featured">Featured</span>' : '<span style="color: #94a3b8; font-size: 0.8rem;">No</span>'}
          </td>
          <td style="text-align: right;">
            <div class="btn-action-group" style="justify-content: flex-end;">
              <button type="button" class="btn-icon edit-btn" data-id="${prod.id}" title="Edit Product">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="btn-icon delete delete-btn" data-id="${prod.id}" data-name="${escapeHtml(prod.name)}" title="Delete Product">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Attach button events
  tbody.querySelectorAll(".toggle-status-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pid = btn.getAttribute("data-id");
      const current = btn.getAttribute("data-current") === "true";
      const newStatus = !current;

      try {
        await toggleProductActive(pid, newStatus);
        const target = allProducts.find((p) => p.id === pid);
        if (target) target.isActive = newStatus;
        renderProductsTable();
        showToast(`Product set to ${newStatus ? 'Active' : 'Hidden'}.`, "success");
      } catch (e) {
        showToast("Failed to toggle product status.", "error");
      }
    });
  });

  tbody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.getAttribute("data-id");
      const prod = allProducts.find((p) => p.id === pid);
      if (prod) openModalForEdit(prod);
    });
  });

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.getAttribute("data-id");
      const pname = btn.getAttribute("data-name");

      confirmAction(`Are you sure you want to permanently delete "${pname}"? This action cannot be undone.`, async () => {
        try {
          await deleteProductById(pid);
          allProducts = allProducts.filter((p) => p.id !== pid);
          renderProductsTable();
          showToast(`"${pname}" has been deleted.`, "success");
        } catch (e) {
          showToast("Failed to delete product.", "error");
        }
      });
    });
  });
}

// ============================================================================
// MODAL & FORM LOGIC
// ============================================================================
function setupModalHandlers() {
  const modal = document.getElementById("product-modal");
  const openBtn = document.getElementById("open-add-product-btn");
  const closeBtn = document.getElementById("close-modal-btn");
  const cancelBtn = document.getElementById("cancel-modal-btn");
  const form = document.getElementById("product-form");
  const imageFileInput = document.getElementById("prod-image-file");
  const imageUrlInput = document.getElementById("prod-image-url");
  const imagePreview = document.getElementById("image-preview");

  const closeModal = () => modal.classList.remove("active");

  if (openBtn) openBtn.addEventListener("click", openModalForAdd);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // URL Image preview
  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", () => {
      const url = imageUrlInput.value.trim();
      if (url) {
        imagePreview.src = url;
        imagePreview.style.display = "block";
      } else {
        imagePreview.style.display = "none";
      }
    });
  }

  // Local File Upload with restriction: PNG, JPG, WEBP and size < 2MB
  if (imageFileInput) {
    imageFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showToast("Invalid file format. Please upload JPG, PNG, or WEBP.", "error");
        imageFileInput.value = "";
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showToast("Image file size exceeds 2MB limit. Please choose a smaller image.", "error");
        imageFileInput.value = "";
        return;
      }

      // Read as base64 preview
      const reader = new FileReader();
      reader.onload = (event) => {
        imageUrlInput.value = event.target.result;
        imagePreview.src = event.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  // Form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const prodId = document.getElementById("prod-id").value;
      const name = document.getElementById("prod-name").value.trim();
      const catSelect = document.getElementById("prod-category");
      const category = catSelect.value;
      const categoryLabel = catSelect.options[catSelect.selectedIndex]?.text || category;
      const priceRaw = document.getElementById("prod-price").value.trim();
      const currency = document.getElementById("prod-currency").value.trim() || "PKR";
      const description = document.getElementById("prod-desc").value.trim();
      const specsRaw = document.getElementById("prod-specs").value.trim();
      const image = document.getElementById("prod-image-url").value.trim() || 
        "https://images.unsplash.com/photo-1587202374463-8874a6866382?auto=format&fit=crop&w=700&q=80";
      const badge = document.getElementById("prod-badge").value.trim();
      const isActive = document.getElementById("prod-active").checked;
      const isFeatured = document.getElementById("prod-featured").checked;

      if (!name) {
        showToast("Product name is required.", "error");
        return;
      }

      if (!priceRaw) {
        showToast("Product price is required.", "error");
        return;
      }

      // Format price clearly
      let formattedPrice = priceRaw;
      if (!formattedPrice.toUpperCase().includes("PKR") && !formattedPrice.startsWith("$")) {
        formattedPrice = `PKR ${formattedPrice}`;
      }

      const specs = specsRaw
        ? specsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const saveBtn = document.getElementById("save-product-btn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const payload = {
          name,
          category,
          categoryLabel,
          price: formattedPrice,
          currency,
          description,
          specs,
          image,
          badge,
          isActive,
          isFeatured,
        };

        if (prodId) {
          payload.id = prodId;
        }

        const saved = await saveProduct(payload);

        // Update local list
        const idx = allProducts.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          allProducts[idx] = saved;
        } else {
          allProducts.unshift(saved);
        }

        renderProductsTable();
        closeModal();
        showToast(prodId ? "Product updated successfully!" : "New product created successfully!", "success");
      } catch (err) {
        console.error("Save error:", err);
        showToast("Failed to save product to database.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Product";
      }
    });
  }
}

function openModalForAdd() {
  document.getElementById("modal-heading").textContent = "Add New Product";
  document.getElementById("prod-id").value = "";
  document.getElementById("prod-name").value = "";
  document.getElementById("prod-price").value = "";
  document.getElementById("prod-desc").value = "";
  document.getElementById("prod-specs").value = "";
  document.getElementById("prod-image-url").value = "";
  document.getElementById("prod-image-file").value = "";
  document.getElementById("prod-badge").value = "";
  document.getElementById("prod-active").checked = true;
  document.getElementById("prod-featured").checked = false;

  const preview = document.getElementById("image-preview");
  preview.src = "";
  preview.style.display = "none";

  document.getElementById("product-modal").classList.add("active");
}

function openModalForEdit(prod) {
  document.getElementById("modal-heading").textContent = "Edit Product";
  document.getElementById("prod-id").value = prod.id;
  document.getElementById("prod-name").value = prod.name || "";
  
  const catSelect = document.getElementById("prod-category");
  if (catSelect) catSelect.value = prod.category || "";

  document.getElementById("prod-price").value = (prod.price || "").replace(/^PKR\s*/i, "");
  document.getElementById("prod-desc").value = prod.description || "";
  document.getElementById("prod-specs").value = (prod.specs || []).join(", ");
  document.getElementById("prod-image-url").value = prod.image || "";
  document.getElementById("prod-image-file").value = "";
  document.getElementById("prod-badge").value = prod.badge || "";
  document.getElementById("prod-active").checked = prod.isActive !== false;
  document.getElementById("prod-featured").checked = Boolean(prod.isFeatured);

  const preview = document.getElementById("image-preview");
  if (prod.image) {
    preview.src = prod.image;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }

  document.getElementById("product-modal").classList.add("active");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
