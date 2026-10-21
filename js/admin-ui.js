/**
 * Shared Admin UI Helpers: Toast notifications, sidebar toggle, user chip, confirmation modal.
 */

import { logoutAdmin, requireAdminAuth } from "./firebase-service.js";

export function showToast(message, type = "info") {
  let container = document.getElementById("admin-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "admin-toast-container";
    container.className = "admin-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

export function confirmAction(message, onConfirm) {
  let modal = document.getElementById("admin-confirm-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "admin-confirm-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 420px; padding: 1.75rem; text-align: center;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #0a192f; margin-bottom: 0.5rem;">Confirm Action</h3>
        <p id="admin-confirm-text" style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;"></p>
        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button type="button" class="btn-admin btn-admin-secondary" id="admin-confirm-cancel">Cancel</button>
          <button type="button" class="btn-admin btn-admin-primary" id="admin-confirm-ok" style="background: #ef4444; border-color: #ef4444; color: #fff;">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const textEl = document.getElementById("admin-confirm-text");
  const okBtn = document.getElementById("admin-confirm-ok");
  const cancelBtn = document.getElementById("admin-confirm-cancel");

  if (textEl) textEl.textContent = message;
  modal.classList.add("active");

  const cleanup = () => {
    modal.classList.remove("active");
    if (okBtn) okBtn.onclick = null;
    if (cancelBtn) cancelBtn.onclick = null;
  };

  if (okBtn) {
    okBtn.onclick = () => {
      cleanup();
      if (onConfirm) onConfirm();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      cleanup();
    };
  }
}

export function setupAdminLayout(activePage = "dashboard") {
  // Mobile sidebar toggle
  const toggleBtn = document.getElementById("mobile-sidebar-toggle");
  const sidebar = document.getElementById("admin-sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      confirmAction("Are you sure you want to log out of the admin panel?", async () => {
        await logoutAdmin();
        window.location.href = "login.html";
      });
    });
  }

  // Active page class in sidebar
  document.querySelectorAll(".nav-item").forEach((link) => {
    if (link.getAttribute("data-page") === activePage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Verify auth on protected admin pages
  requireAdminAuth((user) => {
    const emailEls = document.querySelectorAll(".admin-display-email");
    emailEls.forEach((el) => (el.textContent = user.email || "Administrator"));
  });
}
