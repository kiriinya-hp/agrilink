import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes, { autoRestoreSnapshotIfAvailable, autoSaveSnapshot } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AgriShamba API Service',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '../../frontend/dist');

// If built frontend exists, serve it
if (fs.existsSync(frontendDist)) {
  // ─── Public Privacy Policy Page (required by Google Play Store) ─────────
  app.get('/privacy', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Privacy Policy — AgriShamba</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.7; }
    .container { max-width: 800px; margin: 0 auto; padding: 32px 20px 60px; }
    .header { background: linear-gradient(135deg, #064e3b, #065f46); color: white; padding: 36px 32px; border-radius: 16px; margin-bottom: 36px; }
    .header img { height: 48px; margin-bottom: 12px; }
    .header h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 6px; }
    .header p { font-size: 0.9rem; opacity: 0.8; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 99px; padding: 4px 14px; font-size: 0.75rem; font-weight: 600; margin-bottom: 16px; }
    h2 { font-size: 1.1rem; font-weight: 800; color: #064e3b; margin: 32px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #d1fae5; }
    p { font-size: 0.92rem; color: #334155; margin-bottom: 12px; }
    ul { padding-left: 20px; margin-bottom: 12px; }
    li { font-size: 0.92rem; color: #334155; margin-bottom: 6px; }
    .highlight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
    .highlight p { margin: 0; color: #065f46; font-weight: 600; font-size: 0.88rem; }
    .contact { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; margin-top: 32px; }
    .contact p { margin: 0; font-size: 0.88rem; }
    .contact a { color: #1d4ed8; }
    footer { text-align: center; margin-top: 40px; font-size: 0.78rem; color: #94a3b8; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="badge">🌾 AgriShamba</div>
    <h1>Privacy Policy</h1>
    <p>Toka Shambani Hadi Sokoni &nbsp;|&nbsp; Effective Date: October 2026 &nbsp;|&nbsp; Version 1.0</p>
  </div>

  <h2>1. Introduction</h2>
  <p>Welcome to <strong>AgriShamba</strong> ("Platform", "we", "us"). AgriShamba is a Kenya-based B2B digital agricultural supply chain platform that connects farmers, wholesale buyers, and transporters through a secure marketplace with M-Pesa escrow payment protection and real-time GPS freight tracking.</p>
  <p>This Privacy Policy explains what personal data we collect, why we collect it, how it is used, and the rights you have over your data when you use AgriShamba via our website or Android application.</p>

  <h2>2. Information We Collect</h2>
  <p>We collect only the data necessary to provide our services:</p>
  <ul>
    <li><strong>Account Information:</strong> Full name, email address, phone number (M-Pesa registered), county/location, business or farm name, and National ID or Business Registration number (for KYC escrow compliance).</li>
    <li><strong>Location Data:</strong> Real-time GPS coordinates when you use the driver live tracking feature (transporters only, with your explicit permission). Location is used solely to display your delivery route to the buyer and never stored permanently.</li>
    <li><strong>Camera / Photo Data:</strong> Images uploaded via the Crop Disease Doctor or Produce Listing features. Photos are processed for analysis and stored securely on our servers.</li>
    <li><strong>Transaction Data:</strong> M-Pesa STK Push payment records, escrow transaction history, order details, and withdrawal records used for financial reconciliation and dispute resolution.</li>
    <li><strong>Device &amp; Usage Data:</strong> App crash logs, device type, and general usage metrics used to improve platform performance. No advertising identifiers are collected.</li>
  </ul>

  <h2>3. How We Use Your Information</h2>
  <ul>
    <li>Authenticating your identity and securing your account.</li>
    <li>Processing M-Pesa escrow payments and disbursing funds after confirmed delivery.</li>
    <li>Enabling real-time GPS route tracking for active freight shipments.</li>
    <li>Sending SMS OTP confirmation codes for delivery verification.</li>
    <li>Generating automated market price alerts and agronomic weather advisories.</li>
    <li>Complying with Kenyan financial regulations regarding escrow and mobile money transactions.</li>
    <li>Resolving disputes between buyers, farmers, and transporters.</li>
  </ul>

  <h2>4. Location Permission — Why We Need It</h2>
  <div class="highlight">
    <p>📍 AgriShamba collects location data <em>only when you are an active transporter with a live shipment</em>. This data is displayed on a live map to allow buyers to track their delivery in real time. Location tracking stops automatically when the delivery is completed or cancelled. We never track your location in the background or outside active shipments.</p>
  </div>

  <h2>5. Camera Permission — Why We Need It</h2>
  <div class="highlight">
    <p>📷 Camera access is used exclusively for two features: (1) the <strong>Kilimo Crop Disease Doctor</strong> — for scanning plant leaves to detect disease, and (2) uploading produce listing photos. We do not access your camera in the background and do not store facial or biometric data.</p>
  </div>

  <h2>6. Data Sharing</h2>
  <p>We do <strong>not</strong> sell, rent, or share your personal data with third parties for advertising purposes. Your data may be shared only in the following circumstances:</p>
  <ul>
    <li><strong>Safaricom M-Pesa:</strong> Phone number and transaction amount for payment processing.</li>
    <li><strong>MongoDB Atlas (Database):</strong> Encrypted cloud storage for all account and transaction data.</li>
    <li><strong>Firebase (Google):</strong> Used solely for Google sign-in authentication. No data is shared for advertising.</li>
    <li><strong>Legal Compliance:</strong> If required by Kenyan law, court order, or regulatory authority.</li>
  </ul>

  <h2>7. Data Security</h2>
  <p>All data transmitted between your device and our servers is encrypted using HTTPS/TLS. Passwords are hashed using bcrypt. M-Pesa credentials are stored server-side as environment variables and never exposed to the client. Database access is restricted by IP allowlist and requires authenticated credentials.</p>

  <h2>8. Data Retention</h2>
  <p>Your personal data is retained for as long as your account remains active. Transaction records (escrow, M-Pesa) are retained for 7 years as required by Kenyan financial regulations. Upon account deletion, all personal profile data, produce listings, orders, and notifications are permanently erased within 24 hours.</p>

  <h2>9. Your Rights — Account &amp; Data Deletion</h2>
  <p>You have the right to access, correct, or delete your personal data at any time. To permanently delete your account and all associated data:</p>
  <ul>
    <li><strong>In-App:</strong> Open the app → Tap your profile icon → Scroll to the bottom → Tap <strong>"Delete My Account &amp; All Personal Data"</strong> → Confirm.</li>
    <li><strong>By Email:</strong> Send a deletion request to <a href="mailto:support@agrishamba.co.ke">support@agrishamba.co.ke</a> with the subject line <em>"Account Deletion Request"</em>.</li>
  </ul>
  <p>Deletion is permanent and cannot be undone. Active escrow funds will be flagged for manual review before deletion is processed.</p>

  <h2>10. Children's Privacy</h2>
  <p>AgriShamba is intended for users aged 18 and above. We do not knowingly collect personal information from anyone under 18 years of age.</p>

  <h2>11. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. Material changes will be communicated via in-app notification and by updating the "Effective Date" above. Continued use of the platform after the effective date constitutes acceptance of the updated policy.</p>

  <div class="contact">
    <p>📬 <strong>Contact / Data Protection Officer:</strong><br/>
    AgriShamba Platform &nbsp;|&nbsp; Nairobi, Kenya<br/>
    Email: <a href="mailto:support@agrishamba.co.ke">support@agrishamba.co.ke</a><br/>
    Platform: <a href="https://agrilink-pyrv.onrender.com">agrilink-pyrv.onrender.com</a>
    </p>
  </div>

  <footer>
    &copy; 2026 AgriShamba. All rights reserved. &nbsp;|&nbsp; Toka Shambani Hadi Sokoni
  </footer>
</div>
</body>
</html>`);
  });

  // ─── Public Produce Traceability / Farm Passport Page ────────────────────
  // Accessible via QR code scan — no authentication required.
  // URL pattern: /trace/:orderId
  app.get('/trace/:orderId', async (req, res) => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const _prisma = new PrismaClient();
      const order = await _prisma.order.findUnique({
        where: { id: req.params.orderId },
        include: {
          buyer: { select: { name: true, businessName: true } },
          items: {
            include: {
              listing: {
                include: {
                  farmer: { select: { name: true, phone: true, location: true, businessName: true } }
                }
              }
            }
          },
          escrowTransaction: true,
          shipment: {
            include: {
              transporter: { select: { name: true, phone: true, businessName: true } }
            }
          }
        }
      });
      await _prisma.$disconnect();

      if (!order) {
        return res.status(404).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>Produce Passport Not Found</h2><p>Order ID not recognised. Please check the QR code.</p>
          <a href="https://agrilink-pyrv.onrender.com" style="color:#064e3b">← Back to AgriShamba</a></body></html>`);
      }

      const item = order.items?.[0];
      const listing = item?.listing;
      const farmer = listing?.farmer;
      const transporter = order.shipment?.transporter;
      const harvestDate = listing?.harvestDate
        ? new Date(listing.harvestDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'N/A';
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
      const statusColor = order.status === 'COMPLETED' ? '#065f46' : '#92400e';
      const statusBg = order.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7';
      const escrowRef = (order.escrowTransaction?.id || order.id).slice(0, 20).toUpperCase();

      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Produce Passport — ${order.orderNumber} | AgriShamba</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0fdf4; color: #1e293b; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 24px 16px 60px; }
    .card { background: #fff; max-width: 540px; width: 100%; border-radius: 20px; box-shadow: 0 8px 40px rgba(6,78,59,0.15); overflow: hidden; border: 2px solid #a7f3d0; }
    .hero { background: linear-gradient(135deg, #064e3b, #065f46); padding: 28px 24px; color: white; }
    .hero-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .hero h1 { font-size: 22px; font-weight: 900; }
    .hero p { font-size: 12px; opacity: 0.8; }
    .passport-badge { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; white-space: nowrap; }
    .order-num { display: inline-block; background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px 14px; font-family: monospace; font-size: 14px; font-weight: 700; margin-top: 10px; }
    .body { padding: 24px; }
    .status-row { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
    .status-chip { background: ${statusBg}; color: ${statusColor}; font-size: 12px; font-weight: 800; padding: 5px 16px; border-radius: 20px; border: 1.5px solid ${statusColor}40; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cell { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
    .cell.green { background: #ecfdf5; border-color: #6ee7b7; }
    .cell.amber { background: #fffbeb; border-color: #fcd34d; }
    .cell.blue { background: #eff6ff; border-color: #bfdbfe; }
    .cell .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap-: 4px; }
    .cell .val { font-size: 15px; font-weight: 800; color: #0f172a; }
    .cell .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .full-cell { grid-column: 1 / -1; }
    .escrow-bar { background: #ecfdf5; border: 1.5px solid #6ee7b7; border-radius: 14px; padding: 14px 16px; margin-top: 14px; display: flex; align-items: center; gap: 12px; }
    .escrow-bar svg-icon { font-size: 22px; }
    .escrow-bar .ref { font-family: monospace; font-size: 13px; font-weight: 900; color: #065f46; word-break: break-all; }
    .escrow-bar .sublbl { font-size: 10px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    .verify-btn { display: block; width: 100%; margin-top: 20px; padding: 14px; background: #064e3b; color: white; font-size: 14px; font-weight: 800; border-radius: 14px; text-decoration: none; text-align: center; }
    .footer-note { text-align: center; margin-top: 18px; font-size: 11px; color: #94a3b8; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 18px 0; }
    @media print { body { background: #fff; padding: 0; } .card { box-shadow: none; border: 2px solid #064e3b; } .verify-btn { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="hero">
      <div class="hero-top">
        <div>
          <h1>🌾 AgriShamba</h1>
          <p>Toka Shambani Hadi Sokoni</p>
        </div>
        <div class="passport-badge">PRODUCE PASSPORT</div>
      </div>
      <div class="order-num">${order.orderNumber}</div>
    </div>

    <div class="body">
      <div class="status-row">
        <div class="status-chip">● ${order.status}</div>
      </div>

      <div class="grid">
        <div class="cell green full-cell">
          <div class="lbl">🌱 Crop / Produce</div>
          <div class="val">${item?.cropName || 'N/A'}</div>
          <div class="sub">${listing?.grade || ''} · ${listing?.category || ''} · ${item?.quantity || 0} kg</div>
        </div>

        <div class="cell">
          <div class="lbl">👨‍🌾 Farmer</div>
          <div class="val">${farmer?.name || 'Unknown'}</div>
          <div class="sub">${farmer?.businessName || farmer?.phone || ''}</div>
        </div>

        <div class="cell">
          <div class="lbl">📍 Farm Location</div>
          <div class="val">${farmer?.location || listing?.location || 'Kenya'}</div>
        </div>

        <div class="cell amber">
          <div class="lbl">📅 Harvest Date</div>
          <div class="val">${harvestDate}</div>
        </div>

        <div class="cell">
          <div class="lbl">📦 Order Date</div>
          <div class="val">${orderDate}</div>
        </div>

        <div class="cell blue full-cell">
          <div class="lbl">🚛 Cold-Chain Transporter</div>
          <div class="val">${transporter?.name || 'Pending Assignment'}</div>
          <div class="sub">${transporter?.businessName || ''}</div>
        </div>

        <div class="cell full-cell">
          <div class="lbl">🏭 Delivery Destination</div>
          <div class="val">${order.deliveryAddress}</div>
        </div>
      </div>

      <div class="escrow-bar">
        <div>
          <div class="sublbl">🔒 AgriShamba Escrow Reference</div>
          <div class="ref">${escrowRef}</div>
        </div>
      </div>

      <hr class="divider"/>

      <a class="verify-btn" href="https://agrilink-pyrv.onrender.com" target="_blank">
        🔍 Verify on AgriShamba Platform
      </a>

      <p class="footer-note">
        This document was generated by AgriShamba — Kenya's trusted farm-to-market platform.<br/>
        For disputes or verification: <strong>agrilink-pyrv.onrender.com</strong>
      </p>
    </div>
  </div>
</body>
</html>`);
    } catch (err) {
      console.error('[Trace] Error generating passport:', err.message);
      res.status(500).send('Error loading produce passport. Please try again.');
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/health') || req.url.startsWith('/privacy') || req.url.startsWith('/trace')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🌾 AgriShamba Backend API running on port ${PORT}`);
  console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
  console.log(`📡 API Base:     http://localhost:${PORT}/api`);
  console.log(`=========================================`);
  
  // Sync persistent snapshot on server start
  try {
    await autoRestoreSnapshotIfAvailable();
  } catch (err) {
    console.warn('Initial snapshot restore notice:', err.message);
  }

  // ─── Self-Ping Keepalive (Render Free Tier) ───────────────────────────────
  // Render free tier sleeps after 15 min of inactivity. This pings /health
  // every 14 minutes so the app NEVER goes to sleep.
  if (process.env.NODE_ENV === 'production') {
    const APP_URL = process.env.RENDER_EXTERNAL_URL || `https://agrilink-pyrv.onrender.com`;
    const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

    setInterval(async () => {
      try {
        const { default: https } = await import('https');
        https.get(`${APP_URL}/health`, (res) => {
          console.log(`[Keepalive] Self-ping OK — status ${res.statusCode} at ${new Date().toISOString()}`);
        }).on('error', (err) => {
          console.warn(`[Keepalive] Self-ping failed: ${err.message}`);
        });
      } catch (e) {
        console.warn('[Keepalive] Self-ping error:', e.message);
      }
    }, PING_INTERVAL_MS);

    console.log(`[Keepalive] ✅ Self-ping active — pinging ${APP_URL}/health every 14 minutes`);
  }
  // ─────────────────────────────────────────────────────────────────────────
});
