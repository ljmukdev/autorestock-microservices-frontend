
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`Request headers:`, req.headers);
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debug: List all files in directory
app.get('/debug/files', (req, res) => {
    try {
        const files = fs.readdirSync(__dirname);
        console.log('Files in directory:', files);
        res.json({
            files: files,
            dashboardExists: files.includes('dashboard.html'),
            testFiles: files.filter(f => f.startsWith('test-')),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug: Check dashboard file
app.get('/debug/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard.html');
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

app.get('/', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard.html');
    console.log('Serving dashboard from:', dashboardPath);
    console.log('Dashboard file exists:', fs.existsSync(dashboardPath));
    
    try {
        res.sendFile(dashboardPath);
        console.log('Dashboard served successfully');
    } catch (error) {
        console.error('Error serving dashboard:', error);
        res.status(500).send('Error serving dashboard: ' + error.message);
    }
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
    console.log('MICROSERVICE TESTING DASHBOARD running on port ' + PORT);
    console.log('Main route: / -> dashboard.html');
});

module.exports = app;
