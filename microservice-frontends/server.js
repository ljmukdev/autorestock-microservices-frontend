const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'microservice-diagnostic',
        timestamp: new Date().toISOString()
    });
});

// Serve the main dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Microservice test routes
const services = [
    'settings', 'inventory', 'sales', 'purchases', 'ebay', 
    'vinted', 'reporting', 'accounting', 'ad-generator', 
    'rules-engine', 'auto-buying', 'media', 'email-ingest', 'status'
];

services.forEach(service => {
    app.get(`/test/${service}`, (req, res) => {
        res.sendFile(path.join(__dirname, `test-${service}.html`));
    });
});

// Fallback routes for existing pages
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

app.get('/purchases-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'purchases-test.html'));
});

app.get('/purchases', (req, res) => {
    res.sendFile(path.join(__dirname, 'purchases.html'));
});

app.get('/diagnostic-overlay.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'diagnostic-overlay.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔍 Microservice Diagnostic running on port ${PORT}`);
    console.log(`🌐 Main Dashboard: Available at Railway URL`);
    console.log(`🧪 Test Routes: /test/{service-name}`);
});

module.exports = app;