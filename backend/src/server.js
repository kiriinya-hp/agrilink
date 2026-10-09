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
    service: 'Mazao Hub API Service',
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
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/health')) {
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
  console.log(`🌾 Mazao Hub Backend API running on port ${PORT}`);
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
    const APP_URL = process.env.RENDER_EXTERNAL_URL || `https://Mazao Hub-pyrv.onrender.com`;
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
