# AgriLink: Integrated B2B Agribusiness Supply Chain & Direct Marketplace
### Bachelor of Business Information Technology (BBIT) Capstone Project

AgriLink is a **fully production-ready** full-stack digital procurement and logistics management system. It features real user registration, bcrypt-secured authentication, role-based dashboards, and Safaricom M-Pesa Daraja STK Push for live escrow payments.

---

## 🌟 Key Capabilities
* **Real User Registration:** New Farmers, Commercial Buyers, and Transporters create accounts with bcrypt-hashed passwords stored directly in SQLite.
* **JWT Authentication:** Secure stateless session tokens persisted in `localStorage`, validated on every page load.
* **Role-Based Dashboards:** Login route automatically directs each user to their correct interface.
* **Dedicated Admin Portal:** Separate high-security login strictly for System Administrators (Kelvin Kiriinya) — blocks all other roles with a `403 Forbidden`.
* **Live M-Pesa Daraja STK Push:** Dispatches real payment prompts to the buyer's phone when placing an order. Funds are locked in escrow and released only after delivery OTP verification.
* **Atomic Escrow Settlement:** ACID-compliant database transaction simultaneously marks delivery complete, releases escrow, credits Farmer wallet, credits Transporter wallet, and records platform fee.

---

## 🛠️ Technology Stack
| Layer | Technology |
| :--- | :--- |
| **Backend API** | Node.js 24, Express.js (ES Modules) |
| **ORM & Database** | Prisma ORM, SQLite (dev), upgradeable to PostgreSQL |
| **Authentication** | bcryptjs (password hashing), jsonwebtoken (JWT sessions) |
| **Payments** | Safaricom Daraja API (M-Pesa STK Push Lipa Na M-Pesa) |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React |

---

## 🚀 Quick Start (Run Locally)

### Step 1 — Start the Backend API (Port 5000)
```powershell
cd C:\Users\USER11\.gemini\antigravity\scratch\agrilink\backend
npm run dev
```

### Step 2 — Start the Frontend App (Port 3000) in a second terminal
```powershell
cd C:\Users\USER11\.gemini\antigravity\scratch\agrilink\frontend
npm run dev
```

Then open your browser to **`http://localhost:3000`**

> **One-click alternative:** Double-click `start.bat` in the project root folder.

---

## 👥 Pre-Seeded Accounts (Default Password: `Password123!`)

| Role | Name | Login Email | Phone |
| :--- | :--- | :--- | :--- |
| **Farmer** | John Kamau | `farmer@agrilink.co.ke` | +254711223344 |
| **Buyer** | Fresh Grocers Ltd | `buyer@freshgrocers.co.ke` | +254722334455 |
| **Transporter** | David Kipchoge | `driver@agrihaul.co.ke` | +254733445566 |
| **Admin** | **Kelvin Kiriinya** | `admin@agrilink.co.ke` | +254797722331 |

> 🔐 Admin login is only accessible via the dedicated **Admin Portal** link at the bottom of the standard Login page.

---

## 🔑 How Authentication & Security Work

1. **2-Step Registration:** 
   - New stakeholders enter their details and click **"Continue & Send Verification Code"**.
   - A **6-digit security code** is dispatched directly to their email via Google Mail Services.
   - The user enters the 6-digit code on the verification screen to activate their account and log in.
2. **Password Resetting (Forgot Password):**
   - Click **"Forgot Password?"** on the Sign In screen.
   - Enter your email address to receive an instant 6-digit password reset authorization code.
   - Enter the code, type your new password, and your account is immediately secured with bcrypt hashing.
3. **Login:** Users sign in with email or phone + password. Backend verifies bcrypt hash and issues a signed JWT token.
4. **Admin Portal:** Accessible exclusively via the Admin Portal link, enforcing strict `ADMIN` role privileges for Kelvin Kiriinya.

---

## 📧 Free Google App Password Email Setup

AgriLink uses Google's free Gmail SMTP service to dispatch verification codes and password reset emails.

To configure your own Gmail address:
1. Open your Google Account: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is turned ON.
3. In the top search bar, type **"App passwords"** and click on it.
4. Enter an app name (e.g., `AgriLink`) and click **Create**.
5. Copy the 16-character code (e.g. `abcd efgh ijkl mnop`).
6. Open [`backend/.env`](file:///C:/Users/USER11/.gemini/antigravity/scratch/agrilink/backend/.env) and set:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_code
   ```
*(Note: If you run locally without adding Gmail credentials, the system automatically logs all 6-digit codes to your terminal console so you can test smoothly offline!)*

---

## 📱 M-Pesa Daraja Integration

The escrow checkout sends a **real STK Push prompt** to the buyer's mobile phone.

### Configure Live Safaricom Keys in `.env`:
```
# File: backend/.env
MPESA_ENVIRONMENT=production          # change from "sandbox" to "production"
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=your_paybill_or_till
MPESA_PASSKEY=your_online_passkey
MPESA_CALLBACK_URL=https://your-public-domain.com/api/payments/mpesa/callback
```

> 💡 Obtain your Consumer Key/Secret and Passkey from the [Safaricom Daraja Developer Portal](https://developer.safaricom.co.ke). For public callback access during development, use **ngrok** (`ngrok http 5000`) to expose `localhost:5000` to the internet.

---

## 🎯 5-Minute Academic Defense Script

1. **The Problem (30s):** Farmers lose 40–60% of margins to middlemen. Buyers face unreliable supply chains.
2. **Registration (45s):** Register as a new Farmer → show details saved to database.
3. **Marketplace & Escrow (1.5 min):** Log in as Buyer → Browse listing → Click "Order with Escrow" → Enter phone → Click "Send STK Push" → Show M-Pesa prompt on phone (or sandbox response).
4. **Logistics (45s):** Log in as Transporter → Claim cargo job → Mark In Transit → Share delivery OTP.
5. **Delivery & Settlement (1 min):** Log back in as Buyer → Enter 4-digit OTP → Click "Release Escrow" → Atomic disbursement to Farmer and Transporter wallets.
6. **Admin Console (30s):** Log into Admin Portal as Kelvin Kiriinya → Show live GMV, escrow reserves, all registered users table.
