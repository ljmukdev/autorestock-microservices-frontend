const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set CSP headers to allow eBay service connections
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://stockpilot-ebay-oauth-production.up.railway.app https://*.railway.app https://*.up.railway.app; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'; " +
    "script-src-attr 'none'; " +
    "upgrade-insecure-requests"
  );
  next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'StockPilot Frontend', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StockPilot Frontend Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'frontend')}`);
  console.log(`🔒 CSP configured to allow eBay service connections`);
});
