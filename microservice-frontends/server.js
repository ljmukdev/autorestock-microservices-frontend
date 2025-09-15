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

// Serve the main launcher
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve purchases test page
app.get('/purchases-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'purchases-test.html'));
});

// Serve purchases page directly
app.get('/purchases', (req, res) => {
    res.sendFile(path.join(__dirname, 'purchases.html'));
});

// Serve diagnostic overlay
app.get('/diagnostic-overlay.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'diagnostic-overlay.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔍 Microservice Diagnostic running on port ${PORT}`);
    console.log(`🌐 Launcher: http://localhost:${PORT}/`);
    console.log(`🔧 Diagnostic Overlay: http://localhost:${PORT}/diagnostic-overlay.html`);
});

module.exports = app;