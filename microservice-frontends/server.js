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

// Serve static files from the microservice-frontends directory
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'microservice-frontends',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint - redirect to launcher
app.get('/', (req, res) => {
    res.redirect('/launcher.html');
});

// API endpoint to get service configuration
app.get('/api/services', (req, res) => {
    try {
        const railwayConfig = require('./railway-config.js');
        res.json({
            success: true,
            services: railwayConfig.RAILWAY_SERVICES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load service configuration'
        });
    }
});

// Catch-all handler for SPA routing (if needed)
app.get('*', (req, res) => {
    // If it's an API request, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For frontend routes, try to serve the file
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file doesn't exist, serve launcher.html
            res.sendFile(path.join(__dirname, 'launcher.html'));
        }
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microservice Frontends server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Launcher available at: http://localhost:${PORT}/launcher.html`);
});

module.exports = app;
