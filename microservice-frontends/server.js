const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// IMPORTANT: Dashboard route BEFORE static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Static files after main route
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'microservice-testing-dashboard',
        timestamp: new Date().toISOString()
    });
});

// Test routes
const services = ['settings', 'inventory', 'sales', 'purchases', 'ebay', 'vinted', 'reporting', 'accounting', 'ad-generator', 'rules-engine', 'auto-buying', 'media', 'email-ingest', 'status'];

services.forEach(service => {
    app.get(/test/${service}, (req, res) => {
        res.sendFile(path.join(__dirname, 	est-${service}.html));
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(🔧 MICROSERVICE TESTING DASHBOARD running on port ${PORT});
    console.log(✅ Main route: / -> dashboard.html);
    console.log(🧪 Test routes: /test/{service-name});
});

module.exports = app;
