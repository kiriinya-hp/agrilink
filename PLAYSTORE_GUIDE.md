# AgriLink — Google Play Store Deployment & Mobile App Packaging Guide

This guide walks you through publishing the **AgriLink B2B Agribusiness SCM Platform** as an Android application (`.apk` / `.aab`) on the **Google Play Store**.

AgriLink is engineered as a **Progressive Web App (PWA)** with a dedicated `manifest.json`, service worker (`sw.js`), and mobile-responsive layout. This makes it 100% compatible with Google's official **Trusted Web Activity (TWA)** and **Bubblewrap CLI**, as well as **Capacitor**.

---

## 📱 Method 1: Google Bubblewrap / Trusted Web Activity (Official & Recommended)

Google's **Bubblewrap CLI** packages your PWA directly into a native Android App Bundle (`.aab`) without writing Java or Kotlin code.

### Prerequisites
1. **Node.js** (v18+)
2. **Java Development Kit (JDK 17+)**
3. **Android SDK Command-line Tools** (installed via Android Studio or standalone)

### Step 1 — Install Bubblewrap CLI
Open your terminal and run:
```bash
npm install -g @bubblewrap/cli
```

### Step 2 — Host AgriLink with HTTPS
Google Play Store and TWAs require your site to be served over **HTTPS** (e.g. via Vercel, Render, or Firebase Hosting):
```
https://agrilink.co.ke   (or https://agrilink-app.vercel.app)
```

### Step 3 — Initialize Bubblewrap Project
Create a mobile app directory and initialize Bubblewrap:
```bash
mkdir agrilink-android
cd agrilink-android
bubblewrap init --manifest="https://agrilink.co.ke/manifest.json"
```

Bubblewrap will automatically download your `manifest.json`, icons, theme colors (`#16a34a`), and generate the Android project files.

### Step 4 — Build the Android App Bundle (`.aab`)
```bash
bubblewrap build
```
This generates:
- `app-release-bundle.aab` (Ready for upload to Google Play Console)
- `assetlinks.json` (Digital Asset Links file for domain verification)

### Step 5 — Verify Domain Ownership (Digital Asset Links)
Upload the generated `assetlinks.json` to your web server:
```
https://agrilink.co.ke/.well-known/assetlinks.json
```
This removes the Chrome browser address bar, making AgriLink look and feel like a 100% native Android application!

---

## ⚡ Method 2: Capacitor (Native Plugins & Offline Packaging)

If you prefer building a standard Android Studio project:

### Step 1 — Install Capacitor in AgriLink Frontend
```powershell
cd C:\Users\USER11\.gemini\antigravity\scratch\agrilink\frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init AgriLink ke.co.agrilink.app --web-dir dist
```

### Step 2 — Build Frontend and Add Android Platform
```powershell
npm run build
npx cap add android
```

### Step 3 — Open in Android Studio
```powershell
npx cap open android
```
In Android Studio:
1. Click **Build $\rightarrow$ Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)**.
3. Sign with your upload keystore.
4. Export the `.aab` file!

---

## 🚀 Publishing to Google Play Console

1. **Log in:** Go to [play.google.com/console](https://play.google.com/console) and create a developer account ($25 one-time fee).
2. **Create App:** Name: `AgriLink Agribusiness Marketplace`, Category: `Business / Agriculture`.
3. **Store Listing Assets:**
   - App Icon: 512x512 PNG
   - Feature Graphic: 1024x500 PNG
   - Screenshots: 2+ phone screenshots of the B2B Marketplace and Escrow Checkout.
4. **App Content:** Fill Privacy Policy (e.g., `https://agrilink.co.ke/privacy`).
5. **Release:** Go to **Production $\rightarrow$ Create New Release**, upload `app-release-bundle.aab`, and click **Start Rollout to Production**!

---

## 📲 Instant Mobile Installation (Direct PWA)
Users on Android can also install AgriLink immediately from Google Chrome without going through the Play Store:
1. Open AgriLink in Chrome on Android.
2. Tap the **"Install Mobile App"** button in the header (or Chrome menu $\rightarrow$ *"Add to Home Screen"*).
3. AgriLink is installed on the user's home screen with the official crop icon and runs full-screen!
