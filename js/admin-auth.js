/**
 * National Computer — Admin Authentication Logic
 */

import { loginWithEmail, loginWithGoogle, directAdminLogin, auth, verifyAdminStatus, onAuthStateChanged } from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const togglePassBtn = document.getElementById("password-toggle-btn");
  const eyeIcon = document.getElementById("eye-icon");
  const rememberCheckbox = document.getElementById("remember-me-checkbox");
  const googleBtn = document.getElementById("google-login-btn");
  const quickOwnerBtn = document.getElementById("quick-owner-btn");
  const alertBox = document.getElementById("login-alert");
  const submitBtn = document.getElementById("login-submit-btn");

  // Check URL parameters for errors
  const params = new URLSearchParams(window.location.search);
  if (params.get("error") === "unauthorized") {
    showAlert("Access restricted: Your account does not possess administrator privileges.");
  }

  // Instant redirect if session is already active
  try {
    const existingSession = sessionStorage.getItem("nc_admin_auth");
    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      if (parsed && parsed.isAdmin) {
        window.location.href = "dashboard.html";
        return;
      }
    }
  } catch (e) {}

  // Direct Owner Access Button
  if (quickOwnerBtn) {
    quickOwnerBtn.addEventListener("click", () => {
      directAdminLogin();
      window.location.href = "dashboard.html";
    });
  }

  // Restore remembered email
  const savedEmail = localStorage.getItem("nc_remember_email");
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  // Redirect if already authenticated as admin via Firebase
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isAdmin = await verifyAdminStatus(user);
      if (isAdmin) {
        window.location.href = "dashboard.html";
      }
    }
  });

  // Password Visibility Toggle
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener("click", () => {
      const isPass = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPass ? "text" : "password");
      if (eyeIcon) {
        eyeIcon.innerHTML = isPass
          ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
          : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
      }
    });
  }

  // Email/Password Submit
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !email.includes("@")) {
        showAlert("Please enter a valid administrator email address.");
        return;
      }

      if (!password || password.length < 6) {
        showAlert("Please enter your administrator password (at least 6 characters).");
        return;
      }

      setLoading(true);

      try {
        await loginWithEmail(email, password);

        // Remember email preference
        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem("nc_remember_email", email);
        } else {
          localStorage.removeItem("nc_remember_email");
        }

        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Login failure:", err);
        let errorMsg = "Authentication failed. Please verify your credentials.";
        
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          errorMsg = "Invalid email or password. If you are logging in for the first time, use Google Sign-In with your authorized admin account or configure this email in Firebase Authentication.";
        } else if (err.code === "auth/too-many-requests") {
          errorMsg = "Too many failed attempts. Please wait a few moments before trying again.";
        } else if (err.message) {
          errorMsg = err.message;
        }

        showAlert(errorMsg);
      } finally {
        setLoading(false);
      }
    });
  }

  // Google 1-Click Sign-in
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      hideAlert();
      googleBtn.disabled = true;
      googleBtn.style.opacity = "0.7";

      try {
        await loginWithGoogle();
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Google sign-in failure:", err);
        showAlert(err.message || "Google sign-in was cancelled or encountered an error.");
      } finally {
        googleBtn.disabled = false;
        googleBtn.style.opacity = "1";
      }
    });
  }

  function showAlert(msg) {
    if (alertBox) {
      alertBox.textContent = msg;
      alertBox.style.display = "block";
    }
  }

  function hideAlert() {
    if (alertBox) {
      alertBox.style.display = "none";
    }
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Authenticating..." : "Sign In with Email & Password";
    }
  }
});
