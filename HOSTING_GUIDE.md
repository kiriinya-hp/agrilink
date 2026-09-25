# 🌐 AgriLink — Complete Cloud Hosting & Deployment Guide

This guide provides step-by-step instructions to deploy **AgriLink** to the internet so that anyone, including your university project supervisors and external evaluators, can access it via a live public web link (with automatic HTTPS SSL).

---

## 🏆 Recommended Hosting Option: **Render.com** (100% Free)

**Render** allows you to host both the Node.js Express backend and the React frontend together as a **single unified service** on their free tier with automatic HTTPS and free continuous deployment from GitHub.

### Step 1: Create a GitHub Repository

1. Open [github.com](https://github.com/) and sign in to your account.
2. Click the **"+"** icon in the top-right corner and select **"New repository"**.
3. Repository name: `agrilink`
4. Set it to **Public** or **Private** (both work with Render).
5. Leave "Add a README file" **unchecked** (we already have one).
6. Click **"Create repository"**.

### Step 2: Push Your Local Code to GitHub

Open **PowerShell** on your computer and run these commands:

```powershell
# 1. Navigate to your desktop project folder
cd C:\Users\USER11\Desktop\agrilink

# 2. Initialize git (if not already done)
git init

# 3. Add all files to git
git add .

# 4. Create your initial commit
git commit -m "Initial commit of AgriLink platform"

# 5. Rename branch to main
git branch -M main

# 6. Link to your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/agrilink.git

# 7. Push the code online
git push -u origin main
```

---

### Step 3: Deploy on Render.com

1. Go to [render.com](https://render.com/) and click **"Get Started"** (or sign in with your GitHub account).
2. On your Render Dashboard, click the blue **"New +"** button and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and click **Next**.
4. Select your **`agrilink`** repository from the list (or connect your GitHub account).
5. Fill in the settings:
   - **Name:** `agrilink-ke` *(or any unique name you prefer)*
   - **Region:** Frankfurt (EU) or Oregon (US)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node`
   - **Build Command:** 
     ```bash
     npm run build && cd backend && npx prisma db push && npm run db:seed
     ```
   - **Start Command:** 
     ```bash
     npm start
     ```
   - **Instance Type:** `Free`

6. Click **"Advanced"** and add your **Environment Variables**:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Tells Express to run in production mode |
   | `JWT_SECRET` | `agrilink_super_secure_jwt_token_2026_ke` | Encryption key for authentication tokens |
   | `GMAIL_USER` | `your_email@gmail.com` | Your Gmail address for sending verification codes |
   | `GMAIL_APP_PASSWORD` | `your_16_digit_app_password` | Google 16-character App Password |
   | `DARAJA_ENVIRONMENT` | `sandbox` | Safaricom M-Pesa testing environment |
   | `DARAJA_SHORTCODE` | `174379` | Safaricom Sandbox Paybill/Till |

7. Click **"Create Web Service"**.

Render will now:
- Install all dependencies
- Compile the React frontend into `dist/`
- Generate Prisma client and initialize SQLite database with seed data (*Admin Kelvin Kiriinya, Farmers, Buyers, Transporters*)
- Launch the Express server and serve the app live!

Your live web link will look like:
👉 **`https://agrilink-ke.onrender.com`**

---

## ⚡ Alternative Option: **Railway.app**

If you prefer **Railway**:
1. Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your `agrilink` repository.
4. Add the environment variables (`NODE_ENV=production`, `JWT_SECRET=...`).
5. Under service settings, set:
   - **Build Command:** `npm run build && cd backend && npx prisma db push && npm run db:seed`
   - **Start Command:** `npm start`
6. Click **"Generate Domain"** to get your public URL.

---

## 📱 Verifying Your Live Deployment

Once deployed:
1. Open your live URL on any computer or phone (`https://agrilink-ke.onrender.com`).
2. Log in as Admin to test:
   - **Email:** `admin@agrilink.co.ke`
   - **Password:** `Password123!`
3. Test registering a new account — the Google App Mailer will send real verification codes!
4. Install the **PWA** on your Android phone directly from the browser by clicking **"Install App"** on Chrome!
