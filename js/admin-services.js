/**
 * National Computer — Admin Services Management
 */

import { setupAdminLayout, showToast, confirmAction } from "./admin-ui.js";
import { 
  fetchServices, 
  saveService, 
  deleteServiceById, 
  toggleServiceActive 
} from "./firebase-service.js";

let allServices = [];

document.addEventListener("DOMContentLoaded", async () => {
  setupAdminLayout("services");
  setupModal();
  await loadServices();
});

async function loadServices() {
  try {
    allServices = await fetchServices();
    renderServicesTable();
  } catch (err) {
    console.error("Failed to load services:", err);
    showToast("Error loading services from database.", "error");
  }
}

function renderServicesTable() {
  const tbody = document.getElementById("services-table-tbody");
  const countEl = document.getElementById("services-header-count");
  if (!tbody) return;

  if (countEl) {
    countEl.textContent = `Technical Services (${allServices.length})`;
  }

  if (allServices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2.5rem; color: #94a3b8;">
          No services defined. Click "Add New Service" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allServices
    .map((srv) => {
      const isActive = srv.isActive !== false;

      return `
        <tr data-id="${srv.id}">
          <td><strong style="color: #0a192f; font-size: 0.95rem;">${escapeHtml(srv.title || srv.name)}</strong></td>
          <td style="color: #475569; font-size: 0.88rem; max-width: 380px;">${escapeHtml(srv.description)}</td>
          <td><span style="font-size: 0.82rem; color: #64748b; font-weight: 600;">${escapeHtml(srv.turnaround || "Standard")}</span></td>
          <td>
            <button type="button" class="status-pill ${isActive ? 'status-active' : 'status-inactive'} toggle-srv-btn" data-id="${srv.id}" data-current="${isActive}" style="cursor: pointer; border: 1px solid currentColor;">
              ${isActive ? 'Active' : 'Hidden'}
            </button>
          </td>
          <td style="text-align: right;">
            <div class="btn-action-group" style="justify-content: flex-end;">
              <button type="button" class="btn-icon edit-srv-btn" data-id="${srv.id}" title="Edit Service">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="btn-icon delete delete-srv-btn" data-id="${srv.id}" data-title="${escapeHtml(srv.title || srv.name)}" title="Delete Service">
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

  tbody.querySelectorAll(".toggle-srv-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sid = btn.getAttribute("data-id");
      const current = btn.getAttribute("data-current") === "true";
      const newStatus = !current;

      try {
        await toggleServiceActive(sid, newStatus);
        const found = allServices.find((s) => s.id === sid);
        if (found) found.isActive = newStatus;
        renderServicesTable();
        showToast(`Service set to ${newStatus ? 'Active' : 'Hidden'}.`, "success");
      } catch (e) {
        showToast("Failed to toggle service status.", "error");
      }
    });
  });

  tbody.querySelectorAll(".edit-srv-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sid = btn.getAttribute("data-id");
      const found = allServices.find((s) => s.id === sid);
      if (found) openModalForEdit(found);
    });
  });

  tbody.querySelectorAll(".delete-srv-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sid = btn.getAttribute("data-id");
      const title = btn.getAttribute("data-title");

      confirmAction(`Are you sure you want to delete service "${title}"?`, async () => {
        try {
          await deleteServiceById(sid);
          allServices = allServices.filter((s) => s.id !== sid);
          renderServicesTable();
          showToast(`Service "${title}" deleted successfully.`, "success");
        } catch (e) {
          showToast("Failed to delete service.", "error");
        }
      });
    });
  });
}

function setupModal() {
  const modal = document.getElementById("service-modal");
  const openBtn = document.getElementById("open-add-service-btn");
  const closeBtn = document.getElementById("close-srv-modal-btn");
  const cancelBtn = document.getElementById("cancel-srv-modal-btn");
  const form = document.getElementById("service-form");

  const closeModal = () => modal.classList.remove("active");

  if (openBtn) openBtn.addEventListener("click", openModalForAdd);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const sid = document.getElementById("srv-id").value;
      const title = document.getElementById("srv-title").value.trim();
      const turnaround = document.getElementById("srv-turnaround").value.trim();
      const description = document.getElementById("srv-desc").value.trim();
      const isActive = document.getElementById("srv-active").checked;

      if (!title || !description) {
        showToast("Service title and description are required.", "error");
        return;
      }

      const saveBtn = document.getElementById("save-srv-btn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const payload = { title, turnaround, description, isActive };
        if (sid) payload.id = sid;

        const saved = await saveService(payload);
        const idx = allServices.findIndex((s) => s.id === saved.id);
        if (idx >= 0) allServices[idx] = saved;
        else allServices.push(saved);

        renderServicesTable();
        closeModal();
        showToast(sid ? "Service updated successfully!" : "Service created successfully!", "success");
      } catch (err) {
        showToast("Failed to save service.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Service";
      }
    });
  }
}

function openModalForAdd() {
  document.getElementById("srv-modal-heading").textContent = "Add Technical Service";
  document.getElementById("srv-id").value = "";
  document.getElementById("srv-title").value = "";
  document.getElementById("srv-turnaround").value = "24 - 48 Hours";
  document.getElementById("srv-desc").value = "";
  document.getElementById("srv-active").checked = true;
  document.getElementById("service-modal").classList.add("active");
}

function openModalForEdit(srv) {
  document.getElementById("srv-modal-heading").textContent = "Edit Technical Service";
  document.getElementById("srv-id").value = srv.id;
  document.getElementById("srv-title").value = srv.title || srv.name || "";
  document.getElementById("srv-turnaround").value = srv.turnaround || "";
  document.getElementById("srv-desc").value = srv.description || "";
  document.getElementById("srv-active").checked = srv.isActive !== false;
  document.getElementById("service-modal").classList.add("active");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
