import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Intercept relative /api calls when running inside Capacitor Android app
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api')) {
      const isNative = Boolean(window.Capacitor?.isNativePlatform?.()) || window.location.protocol === 'capacitor:' || window.location.origin.includes('localhost');
      // If running inside native mobile webview pointing to localhost, route to live Render backend
      if (isNative && window.location.hostname === 'localhost' && !window.location.port) {
        input = 'https://agrilink-pyrv.onrender.com' + input;
      }
    }
    return originalFetch.call(this, input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
