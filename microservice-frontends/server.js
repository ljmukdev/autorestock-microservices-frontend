const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.use(express.static(__dirname));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'microservice-testing-dashboard',
        timestamp: new Date().toISOString()
    });
});

const services = ['settings', 'inventory', 'sales', 'purchases', 'ebay', 'vinted', 'reporting', 'accounting', 'ad-generator', 'rules-engine', 'auto-buying', 'media', 'email-ingest', 'status'];

services.forEach(service => {
    app.get('/test/' + service, (req, res) => {
        res.sendFile(path.join(__dirname, 'test-' + service + '.html'));
    });
});

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

app.listen(PORT, '0.0.0.0', () => {
    console.log('MICROSERVICE TESTING DASHBOARD running on port ' + PORT);
    console.log('Main route: / -> dashboard.html');
    console.log('Test routes: /test/{service-name}');
});

module.exports = app;