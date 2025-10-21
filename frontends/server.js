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

// Specific route for config.js to ensure it's served correctly
app.get('/js/core/config.js', (req, res) => {
  console.log('Serving config.js with explicit route');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'js/core/config.js'));
});

// Serve static files with explicit MIME type handling
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    console.log(`Serving static file: ${path}`);
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      console.log(`Set Content-Type: application/javascript for ${path}`);
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
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
