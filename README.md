# National Computer — Official Website & Admin Panel

A complete, modern, professional web application built for **National Computer**, featuring a high-converting public storefront (Home + Products & Services) and a secure, responsive, full-featured **Admin Panel** backed by **Firebase Authentication** and **Cloud Firestore**.

---

## 🌟 Architecture & Features

### 1. Public Storefront (Preserved 2-Page Structure)
- **Homepage (`index.html`)**:
  - Hero section with headline, description, high-tech visual card, and live stats.
  - 7 Product Categories (Desktops, Laptops, Monitors, Keyboards, Mouse, Printers, Accessories).
  - 6 Technical Service modules with turnaround time indicators.
  - "Why Choose Us" 4-pillar trust section.
  - 4 Featured Product cards dynamically synchronized with Cloud Firestore.
  - Call to Action with click-to-call and instant WhatsApp chat.
  - Footer with business info, live operating hours, and discreet Admin Portal link.
- **Products & Services (`products.html`)**:
  - Real-time search query matching product titles, specs chips, categories, and descriptions.
  - Interactive category filter buttons with live product counter.
  - Product cards displaying prices in PKR (or USD sample pricing) with instant WhatsApp quote builder.
  - Quick Inquiry Modal for 1-click WhatsApp quote or contact form prefill.
  - Technical Workshop section with a 4-step repair process.
  - Contact section with editable placeholders and client-side validated inquiry form.

### 2. Administrator Management Portal (`/admin/`)
- **Admin Login (`admin/login.html`)**:
  - Secure authentication via **Firebase Authentication**.
  - Email/Password sign-in and 1-Click Authorized Google Account sign-in.
  - Show/hide password visibility toggle.
  - Remember email option (no plain-text passwords stored).
  - Protected admin routes: unauthorized users are immediately signed out and redirected.
  - Bootstrapped administrator: `tasawarabbas89076@gmail.com` (and any UID in `/admins/{uid}`).
- **Dashboard (`admin/dashboard.html`)**:
  - Live metric summary cards: Total Products, Active/In-Stock Products, Total Categories, Total Services.
  - Quick Administrative Action shortcuts: Add Product, Manage Products, Edit Website Content, Update Contact Info, View Live Website.
  - Recent inventory items table with status pills and quick edit links.
  - Real-time connection status check against Firestore.
- **Manage Products (`admin/products.html`)**:
  - Live inventory table with category labels, PKR pricing, and featured badges.
  - Instant Active/Draft visibility toggle with zero-lag database sync.
  - Real-time search and multi-criteria filters (Category, Status, Featured).
  - Add & Edit Product Modal with validation.
  - Image handling: direct image URL or local file upload (JPG/PNG/WEBP, restricted to < 2MB).
  - Delete product with safety confirmation prompt.
- **Manage Categories (`admin/categories.html`)**:
  - Add, edit, and organize product categories with auto-slug generation.
  - Live count of products assigned to each category.
  - **Deletion Protection**: Strict enforcement preventing deletion of any category that still contains active products until reassigned.
- **Manage Services (`admin/services.html`)**:
  - Add, edit, and update computer & laptop repair services.
  - Set turnaround times (e.g. Same Day, 24-48 Hours).
  - Toggle public visibility to show or hide services from the public storefront.
  - Delete services after confirmation.
- **Website Content & Settings (`admin/settings.html`)**:
  - Edit Homepage Headline, Description, and Hero Showcase Image.
  - Update Business Phone Number, WhatsApp Number (digits for wa.me links), Email, Address, and Opening Hours.
  - Edit Footer Copyright text.
  - Changes instantly update across public pages without code modifications.

---

## 📁 Project Directory Structure

```
national-computer/
├── index.html                   # Page 1: Public Homepage
├── products.html                # Page 2: Public Products & Services
├── admin/
│   ├── login.html               # Admin Login (Firebase Auth)
│   ├── dashboard.html           # Admin Dashboard & Metrics
│   ├── products.html            # Product Management & CRUD Modal
│   ├── categories.html          # Category Management & Deletion Safety
│   ├── services.html            # Service & Repair Management
│   └── settings.html            # Site Content, Contact Info & Settings
├── css/
│   ├── style.css                # Public website styling (Navy / White / Cyan)
│   └── admin.css                # Admin panel styling (Sidebar, Tables, Modals, Forms)
├── js/
│   ├── script.js                # Public storefront logic & Firestore sync
│   ├── firebase-service.js      # Central Firebase Auth & Firestore data layer
│   ├── admin-ui.js              # Shared toast notifications, sidebar & auth guard
│   ├── admin-auth.js            # Login form validation & Google/Email auth
│   ├── admin-dashboard.js       # Dashboard metrics & recent products
│   ├── admin-products.js        # Product CRUD, filters, image validation (<2MB)
│   ├── admin-categories.js      # Category CRUD & constraint checking
│   ├── admin-services.js        # Service CRUD & visibility toggles
│   └── admin-settings.js        # Site content & contact info editor
├── firebase-applet-config.json  # Auto-configured Firebase Project credentials
├── firebase-blueprint.json      # Intermediate representation schema (entities & paths)
├── firestore.rules              # Hardened Firebase security rules
├── package.json                 # Dependencies & build scripts
├── vite.config.ts               # Multi-page Rollup bundle configuration
└── README.md                    # Project documentation & deployment manual
```

---

## 🔒 Security & Firebase Configuration

### 1. Pre-Configured Administrator
The admin panel is configured with role-based access control. The following administrator account is authorized by default:
- **Primary Admin Email**: `tasawarabbas89076@gmail.com`

### 2. Signing In for the First Time
You can access the admin panel at `/admin/login.html`:
- **Option 1: Sign in with Google (Fastest)**
  Click **"Sign In with Authorized Google Account"** and log in with `tasawarabbas89076@gmail.com`. You will immediately gain access to the dashboard.
- **Option 2: Sign in with Email & Password**
  1. Go to the [Firebase Console](https://console.firebase.google.com/).
  2. Select your project: `crafty-block-c5v9p`.
  3. Navigate to **Authentication** > **Sign-in method** and verify that **Email/Password** is enabled.
  4. Under **Users**, click **Add user**, enter `tasawarabbas89076@gmail.com`, and choose your password.
  5. Return to `/admin/login.html` and sign in.

### 3. Granting Additional Admins
To grant administrative access to another user:
- In Firestore, navigate to the `/admins/` collection.
- Create a document with the user's Firebase Auth `UID` containing `{ "email": "newadmin@example.com", "role": "Administrator" }`.

### 4. Firestore Security Rules
The included `firestore.rules` file enforces:
- **Public Read Access**: Anyone can browse active products, categories, services, and public site contact info.
- **Admin-Only Write Access**: Only authenticated users whose email matches the admin or whose UID exists in `/admins/` can create, update, or delete products, categories, services, or website settings.
- **Schema & ID Sanitization**: Rejects malformed records, non-string identifiers, or oversized payloads.

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   - Public Website: `http://localhost:3000/index.html`
   - Public Catalog: `http://localhost:3000/products.html`
   - Admin Login: `http://localhost:3000/admin/login.html`

3. **Build production bundle**:
   ```bash
   npm run build
   ```
   All pages are compiled into `dist/` with optimized chunking.

---

## 🚀 Deployment Instructions

### Deploying to Vercel (Recommended)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Complete National Computer website and admin panel"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New..."** > **"Project"**.
3. Import your repository. Vercel automatically detects the Vite setup:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your public website and admin portal will be live immediately.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Modern CSS3 (Custom Variables, Flexbox, CSS Grid), Vanilla JavaScript (ES Modules).
- **Build System**: Vite 8 with multi-page Rollup bundling.
- **Database**: Google Cloud Firestore (Live persistent storage).
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-In).
- **Styling**: Tailored Dark Navy Blue (`#0a192f`), Crisp White, and Electric Cyan (`#00d2ff`).
