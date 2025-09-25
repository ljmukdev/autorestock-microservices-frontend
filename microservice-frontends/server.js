
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

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

// Serve static files from the root directory (for redirect files)
app.use(express.static(__dirname));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'microservice-testing-dashboard',
        timestamp: new Date().toISOString()
    });
});

// Serve microservice dashboard at root
app.get('/', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard-microservice.html');
    console.log('Serving microservice dashboard from:', dashboardPath);
    console.log('Dashboard file exists:', fs.existsSync(dashboardPath));
    
    try {
        res.sendFile(dashboardPath);
        console.log('Microservice dashboard served successfully');
    } catch (error) {
        console.error('Error serving microservice dashboard:', error);
        // Fallback to original dashboard
        res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
    }
});

const services = ['settings', 'inventory', 'sales', 'purchases', 'ebay', 'vinted', 'reporting', 'accounting', 'ad-generator', 'rules-engine', 'auto-buying', 'media', 'email-ingest', 'status'];
services.forEach(service => {
    app.get('/test/' + service, (req, res) => {
        const testFilePath = path.join(__dirname, 'test-' + service + '.html');
        console.log(`Serving test page for ${service} from:`, testFilePath);
        console.log(`Test file exists:`, fs.existsSync(testFilePath));
        
        try {
            res.sendFile(testFilePath);
            console.log(`Test page for ${service} served successfully`);
        } catch (error) {
            console.error(`Error serving test page for ${service}:`, error);
            res.status(500).send(`Error serving test page for ${service}: ` + error.message);
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 AutoRestock Frontend Server running on port ' + PORT);
    console.log('📁 Serving microservice dashboard and test pages');
    console.log('🔒 CSP configured to allow eBay service connections');
});

module.exports = app;
