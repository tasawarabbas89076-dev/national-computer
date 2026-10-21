/**
 * National Computer — Admin Category Management
 */

import { setupAdminLayout, showToast, confirmAction } from "./admin-ui.js";
import { 
  fetchCategories, 
  fetchAllProducts, 
  saveCategory, 
  deleteCategoryById 
} from "./firebase-service.js";

let allCategories = [];
let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
  setupAdminLayout("categories");
  setupModal();
  await loadCategories();
});

async function loadCategories() {
  try {
    const [cats, prods] = await Promise.all([
      fetchCategories(),
      fetchAllProducts(),
    ]);

    allCategories = cats;
    allProducts = prods;
    renderCategoriesTable();
  } catch (e) {
    console.error("Failed to load categories:", e);
    showToast("Error loading categories from database.", "error");
  }
}

function renderCategoriesTable() {
  const tbody = document.getElementById("categories-table-tbody");
  const countEl = document.getElementById("cat-header-count");
  if (!tbody) return;

  if (countEl) {
    countEl.textContent = `Category List (${allCategories.length})`;
  }

  if (allCategories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2.5rem; color: #94a3b8;">
          No categories found. Click "Add New Category" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allCategories
    .map((cat) => {
      const prodsCount = allProducts.filter((p) => p.category === cat.slug || p.category === cat.id).length;

      return `
        <tr data-id="${cat.id}">
          <td><strong style="color: #0a192f; font-size: 0.95rem;">${escapeHtml(cat.name)}</strong></td>
          <td><code style="background: #f1f5f9; padding: 0.2rem 0.45rem; border-radius: 4px; font-size: 0.8rem; color: #0284c7;">${escapeHtml(cat.slug)}</code></td>
          <td style="color: #64748b; font-size: 0.88rem;">${escapeHtml(cat.description || "—")}</td>
          <td>
            <span style="font-weight: 700; color: ${prodsCount > 0 ? '#0284c7' : '#94a3b8'};">
              ${prodsCount} product(s)
            </span>
          </td>
          <td style="text-align: right;">
            <div class="btn-action-group" style="justify-content: flex-end;">
              <button type="button" class="btn-icon edit-cat-btn" data-id="${cat.id}" title="Edit Category">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                type="button" 
                class="btn-icon delete delete-cat-btn" 
                data-id="${cat.id}" 
                data-slug="${escapeHtml(cat.slug)}"
                data-name="${escapeHtml(cat.name)}" 
                data-count="${prodsCount}"
                title="Delete Category"
              >
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

  tbody.querySelectorAll(".edit-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cid = btn.getAttribute("data-id");
      const found = allCategories.find((c) => c.id === cid);
      if (found) openModalForEdit(found);
    });
  });

  tbody.querySelectorAll(".delete-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cid = btn.getAttribute("data-id");
      const cslug = btn.getAttribute("data-slug");
      const cname = btn.getAttribute("data-name");
      const count = parseInt(btn.getAttribute("data-count") || "0", 10);

      // Enforce the requirement: Prevent deleting category with active products
      if (count > 0) {
        showToast(`Cannot Delete: "${cname}" still contains ${count} product(s). Please reassign or delete the products first.`, "error");
        return;
      }

      confirmAction(`Are you sure you want to delete category "${cname}"?`, async () => {
        try {
          await deleteCategoryById(cid, cslug);
          allCategories = allCategories.filter((c) => c.id !== cid);
          renderCategoriesTable();
          showToast(`Category "${cname}" deleted successfully.`, "success");
        } catch (err) {
          showToast(err.message || "Failed to delete category.", "error");
        }
      });
    });
  });
}

function setupModal() {
  const modal = document.getElementById("category-modal");
  const openBtn = document.getElementById("open-add-cat-btn");
  const closeBtn = document.getElementById("close-cat-modal-btn");
  const cancelBtn = document.getElementById("cancel-cat-modal-btn");
  const form = document.getElementById("category-form");
  const nameInput = document.getElementById("cat-name");
  const slugInput = document.getElementById("cat-slug");

  const closeModal = () => modal.classList.remove("active");

  if (openBtn) openBtn.addEventListener("click", openModalForAdd);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // Auto-fill slug from name if adding
  if (nameInput && slugInput) {
    nameInput.addEventListener("input", () => {
      const catId = document.getElementById("cat-id").value;
      if (!catId) {
        slugInput.value = nameInput.value.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const catId = document.getElementById("cat-id").value;
      const name = nameInput.value.trim();
      const slug = slugInput.value.trim().toLowerCase();
      const description = document.getElementById("cat-desc").value.trim();

      if (!name || !slug) {
        showToast("Category name and slug are required.", "error");
        return;
      }

      const saveBtn = document.getElementById("save-cat-btn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const payload = { name, slug, description };
        if (catId) payload.id = catId;

        const saved = await saveCategory(payload);
        const idx = allCategories.findIndex((c) => c.id === saved.id);
        if (idx >= 0) allCategories[idx] = saved;
        else allCategories.push(saved);

        renderCategoriesTable();
        closeModal();
        showToast(catId ? "Category updated successfully!" : "Category created successfully!", "success");
      } catch (err) {
        showToast("Failed to save category.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Category";
      }
    });
  }
}

function openModalForAdd() {
  document.getElementById("cat-modal-heading").textContent = "Add Category";
  document.getElementById("cat-id").value = "";
  document.getElementById("cat-name").value = "";
  document.getElementById("cat-slug").value = "";
  document.getElementById("cat-desc").value = "";
  document.getElementById("category-modal").classList.add("active");
}

function openModalForEdit(cat) {
  document.getElementById("cat-modal-heading").textContent = "Edit Category";
  document.getElementById("cat-id").value = cat.id;
  document.getElementById("cat-name").value = cat.name || "";
  document.getElementById("cat-slug").value = cat.slug || "";
  document.getElementById("cat-desc").value = cat.description || "";
  document.getElementById("category-modal").classList.add("active");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
