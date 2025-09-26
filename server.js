const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the root directory (for redirect files)
app.use(express.static(__dirname));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve static files from the microservice-frontends directory
app.use(express.static(path.join(__dirname, 'microservice-frontends')));

// Debug: List all files in microservice-frontends directory
app.get('/debug/files', (req, res) => {
    try {
        const files = fs.readdirSync(path.join(__dirname, 'microservice-frontends'));
        console.log('Files in microservice-frontends directory:', files);
        res.json({
            files: files,
            dashboardExists: files.includes('dashboard.html'),
            testFiles: files.filter(f => f.startsWith('test-')),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading microservice-frontends directory:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug: Check dashboard file
app.get('/debug/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, 'microservice-frontends', 'dashboard.html');
    try {
        const stats = fs.statSync(dashboardPath);
        const content = fs.readFileSync(dashboardPath, 'utf8');
        console.log('Dashboard file stats:', stats);
        console.log('Dashboard file size:', stats.size);
        console.log('Dashboard first 200 chars:', content.substring(0, 200));
        
        res.json({
            exists: true,
            size: stats.size,
            modified: stats.mtime,
            firstChars: content.substring(0, 200),
            path: dashboardPath
        });
    } catch (error) {
        console.error('Dashboard file error:', error);
        res.status(404).json({ error: error.message, path: dashboardPath });
    }
});

// Serve the main AutoRestock application
app.get('/', (req, res) => {
    const mainAppPath = path.join(__dirname, 'frontend', 'index.html');
    console.log('Serving main AutoRestock app from:', mainAppPath);
    console.log('Main app file exists:', fs.existsSync(mainAppPath));
    
    try {
        res.sendFile(mainAppPath);
        console.log('Main AutoRestock app served successfully');
    } catch (error) {
        console.error('Error serving main app:', error);
        // Fallback to dashboard if index.html doesn't exist
        const dashboardPath = path.join(__dirname, 'frontend', 'dashboard.html');
        res.sendFile(dashboardPath);
    }
});

// Microservice testing dashboard (accessible at /microservices)
app.get('/microservices', (req, res) => {
    const microserviceDashboardPath = path.join(__dirname, 'microservice-frontends', 'dashboard.html');
    console.log('Serving microservice testing dashboard from:', microserviceDashboardPath);
    
    try {
        res.sendFile(microserviceDashboardPath);
        console.log('Microservice testing dashboard served successfully');
    } catch (error) {
        console.error('Error serving microservice testing dashboard:', error);
        res.status(500).send('Error serving microservice testing dashboard: ' + error.message);
    }
});

// Handle trailing slash redirect
app.get('/microservices/', (req, res) => {
    const microserviceDashboardPath = path.join(__dirname, 'microservice-frontends', 'dashboard.html');
    console.log('Serving microservice testing dashboard from:', microserviceDashboardPath);
    
    try {
        res.sendFile(microserviceDashboardPath);
        console.log('Microservice testing dashboard served successfully');
    } catch (error) {
        console.error('Error serving microservice testing dashboard:', error);
        res.status(500).send('Error serving microservice testing dashboard: ' + error.message);
    }
});

// Microservice test routes - Added for microservice testing dashboard
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
      status: 'ok', 
      service: 'AutoRestock Main Application', 
      timestamp: new Date().toISOString(),
      features: {
        mainApp: true,
        microserviceTesting: true,
        userService: 'https://autorestock-user-service-production.up.railway.app'
      }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoRestock Frontend Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'frontend')}`);
  console.log(`🔒 CSP configured to allow eBay service connections`);
  console.log(`🌐 Railway will handle the external URL routing`);
});
