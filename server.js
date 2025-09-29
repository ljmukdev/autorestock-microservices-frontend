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

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'microservice-testing-dashboard',
        timestamp: new Date().toISOString()
    });
});

// Serve microservice dashboard at root
app.get('/', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard.html');
    console.log('Serving microservice dashboard from:', dashboardPath);
    
    try {
        res.sendFile(dashboardPath);
        console.log('Microservice dashboard served successfully');
    } catch (error) {
        console.error('Error serving microservice dashboard:', error);
        res.status(500).send('Error serving microservice dashboard: ' + error.message);
    }
});

// Microservice test routes
const services = ['settings', 'inventory', 'sales', 'purchases', 'ebay', 'vinted', 'reporting', 'accounting', 'ad-generator', 'rules-engine', 'auto-buying', 'media', 'email-ingest', 'status'];
services.forEach(service => {
    app.get('/test/' + service, (req, res) => {
        const testFilePath = path.join(__dirname, 'test-' + service + '.html');
        console.log(`Serving test page for ${service} from:`, testFilePath);
        
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
    console.log('🚀 AutoRestock Microservice Testing Dashboard running on port ' + PORT);
    console.log('📁 Serving microservice testing interfaces');
    console.log('🔒 CORS enabled for cross-origin requests');
});

module.exports = app;