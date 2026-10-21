/**
 * National Computer — Admin Content & Settings Management
 */

import { setupAdminLayout, showToast } from "./admin-ui.js";
import { fetchWebsiteContent, saveWebsiteContent } from "./firebase-service.js";
import { BUSINESS_CONFIG } from "./script.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupAdminLayout("settings");
  await loadContent();
  setupForm();
});

async function loadContent() {
  try {
    const data = await fetchWebsiteContent();
    const config = data || BUSINESS_CONFIG;

    document.getElementById("cfg-hero-title").value = config.heroTitle || "Your Technology Partner — National Computer";
    document.getElementById("cfg-hero-desc").value = config.heroDescription || "Empowering individuals and businesses with top-tier laptops, desktop workstations, premium peripherals, and dependable hardware repair services. Built on technical excellence and customer trust.";
    document.getElementById("cfg-hero-image").value = config.heroImage || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80";

    document.getElementById("cfg-phone").value = config.phone || "+92 306 6343757 (0306-6343757)";
    document.getElementById("cfg-whatsapp").value = config.whatsappNumber || "03066343757";
    document.getElementById("cfg-email").value = config.email || "info@nationalcomputer.com";
    document.getElementById("cfg-hours").value = config.hours || "Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 4:00 PM";
    document.getElementById("cfg-address").value = config.address || "National Computer, Silicon Plaza / Main Tech Market";
    document.getElementById("cfg-footer-text").value = config.footerText || "© 2026 National Computer. All rights reserved. Professional Computer Sales & Repair Services.";
  } catch (err) {
    console.error("Failed to load website content:", err);
    showToast("Error loading website settings.", "error");
  }
}

function setupForm() {
  const form = document.getElementById("website-content-form");
  const saveBtn = document.getElementById("save-content-btn");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let waInput = document.getElementById("cfg-whatsapp").value.trim();
      let cleanWa = waInput.replace(/[^0-9]/g, "");
      if (cleanWa.startsWith("0")) {
        cleanWa = "92" + cleanWa.slice(1);
      } else if (!cleanWa.startsWith("92")) {
        cleanWa = "92" + cleanWa;
      }

      const payload = {
        heroTitle: document.getElementById("cfg-hero-title").value.trim(),
        heroDescription: document.getElementById("cfg-hero-desc").value.trim(),
        heroImage: document.getElementById("cfg-hero-image").value.trim(),
        phone: document.getElementById("cfg-phone").value.trim(),
        whatsappNumber: cleanWa || "923066343757",
        email: document.getElementById("cfg-email").value.trim(),
        hours: document.getElementById("cfg-hours").value.trim(),
        address: document.getElementById("cfg-address").value.trim(),
        footerText: document.getElementById("cfg-footer-text").value.trim(),
      };

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving to Live Website...";

      try {
        await saveWebsiteContent(payload);
        showToast("Website content and contact information updated successfully! Changes are live.", "success");
      } catch (err) {
        console.error("Failed to save content:", err);
        showToast("Error saving website content to database.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save All Changes to Live Website";
      }
    });
  }
}
