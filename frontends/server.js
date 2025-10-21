const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://autorestock-user-service-production.up.railway.app"],
    },
  },
}));

// Enable CORS for API calls
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'autorestock-frontend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve legacy pages for backward compatibility
app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'multipage-registration.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve static files (JS, CSS, images, etc.) - be explicit about extensions
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve main SPA application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

// SPA fallback - serve app.html for HTML routes only
app.get('*.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`AutoRestock Frontend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Registration form: http://localhost:${PORT}/registration`);
});

module.exports = app;
