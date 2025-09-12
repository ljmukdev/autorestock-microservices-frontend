/**
 * StockPilot API Gateway
 * Routes frontend requests to appropriate microservices
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

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
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Microservice endpoints configuration
const microservices = {
  // Core services
  purchases: process.env.PURCHASES_SERVICE_URL || 'https://stockpilot-purchases-service-production.up.railway.app',
  sales: process.env.SALES_SERVICE_URL || 'http://localhost:3002',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
  settings: process.env.SETTINGS_SERVICE_URL || 'http://localhost:3004',
  
  // Integration services
  ebay: process.env.EBAY_SERVICE_URL || 'http://localhost:3005',
  vinted: process.env.VINTED_SERVICE_URL || 'http://localhost:3006',
  email: process.env.EMAIL_SERVICE_URL || 'http://localhost:3007',
  
  // Support services
  reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3008',
  media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3009',
  accounting: process.env.ACCOUNTING_SERVICE_URL || 'http://localhost:3010',
  rules: process.env.RULES_SERVICE_URL || 'http://localhost:3011',
  autoBuying: process.env.AUTO_BUYING_SERVICE_URL || 'http://localhost:3012',
  adGenerator: process.env.AD_GENERATOR_SERVICE_URL || 'http://localhost:3013',
  status: process.env.STATUS_SERVICE_URL || 'http://localhost:3014'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: Object.keys(microservices)
  });
});

// API routes with proxy middleware
app.use('/api/purchases', createProxyMiddleware({
  target: microservices.purchases,
  changeOrigin: true,
  timeout: 25000, // 25 second timeout
  proxyTimeout: 25000,
  pathRewrite: {
    '^/api/purchases': '/api/purchases'
  },
  onError: (err, req, res) => {
    console.error('Purchases service error:', err.message);
    if (!res.headersSent) {
      res.status(503).json({ error: 'Purchases service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${microservices.purchases}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from purchases service: ${proxyRes.statusCode}`);
  }
}));

app.use('/api/sales', createProxyMiddleware({
  target: microservices.sales,
  changeOrigin: true,
  pathRewrite: {
    '^/api/sales': '/api'
  },
  onError: (err, req, res) => {
    console.error('Sales service error:', err.message);
    res.status(503).json({ error: 'Sales service unavailable' });
  }
}));

app.use('/api/inventory', createProxyMiddleware({
  target: microservices.inventory,
  changeOrigin: true,
  pathRewrite: {
    '^/api/inventory': '/api'
  },
  onError: (err, req, res) => {
    console.error('Inventory service error:', err.message);
    res.status(503).json({ error: 'Inventory service unavailable' });
  }
}));

app.use('/api/consumables', createProxyMiddleware({
  target: microservices.inventory, // Consumables are part of inventory service
  changeOrigin: true,
  pathRewrite: {
    '^/api/consumables': '/api/consumables'
  },
  onError: (err, req, res) => {
    console.error('Consumables service error:', err.message);
    res.status(503).json({ error: 'Consumables service unavailable' });
  }
}));

app.use('/api/settings', createProxyMiddleware({
  target: microservices.settings,
  changeOrigin: true,
  pathRewrite: {
    '^/api/settings': '/api'
  },
  onError: (err, req, res) => {
    console.error('Settings service error:', err.message);
    res.status(503).json({ error: 'Settings service unavailable' });
  }
}));

app.use('/api/ebay', createProxyMiddleware({
  target: microservices.ebay,
  changeOrigin: true,
  pathRewrite: {
    '^/api/ebay': '/api'
  },
  onError: (err, req, res) => {
    console.error('eBay service error:', err.message);
    res.status(503).json({ error: 'eBay service unavailable' });
  }
}));

app.use('/api/vinted', createProxyMiddleware({
  target: microservices.vinted,
  changeOrigin: true,
  pathRewrite: {
    '^/api/vinted': '/api'
  },
  onError: (err, req, res) => {
    console.error('Vinted service error:', err.message);
    res.status(503).json({ error: 'Vinted service unavailable' });
  }
}));

app.use('/api/email-import', createProxyMiddleware({
  target: microservices.email,
  changeOrigin: true,
  pathRewrite: {
    '^/api/email-import': '/api'
  },
  onError: (err, req, res) => {
    console.error('Email service error:', err.message);
    res.status(503).json({ error: 'Email service unavailable' });
  }
}));

app.use('/api/reports', createProxyMiddleware({
  target: microservices.reporting,
  changeOrigin: true,
  pathRewrite: {
    '^/api/reports': '/api'
  },
  onError: (err, req, res) => {
    console.error('Reporting service error:', err.message);
    res.status(503).json({ error: 'Reporting service unavailable' });
  }
}));

app.use('/api/media', createProxyMiddleware({
  target: microservices.media,
  changeOrigin: true,
  pathRewrite: {
    '^/api/media': '/api'
  },
  onError: (err, req, res) => {
    console.error('Media service error:', err.message);
    res.status(503).json({ error: 'Media service unavailable' });
  }
}));

app.use('/api/accounting', createProxyMiddleware({
  target: microservices.accounting,
  changeOrigin: true,
  pathRewrite: {
    '^/api/accounting': '/api'
  },
  onError: (err, req, res) => {
    console.error('Accounting service error:', err.message);
    res.status(503).json({ error: 'Accounting service unavailable' });
  }
}));

app.use('/api/rules', createProxyMiddleware({
  target: microservices.rules,
  changeOrigin: true,
  pathRewrite: {
    '^/api/rules': '/api'
  },
  onError: (err, req, res) => {
    console.error('Rules service error:', err.message);
    res.status(503).json({ error: 'Rules service unavailable' });
  }
}));

app.use('/api/auto-buying', createProxyMiddleware({
  target: microservices.autoBuying,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auto-buying': '/api'
  },
  onError: (err, req, res) => {
    console.error('Auto-buying service error:', err.message);
    res.status(503).json({ error: 'Auto-buying service unavailable' });
  }
}));

app.use('/api/ad-generator', createProxyMiddleware({
  target: microservices.adGenerator,
  changeOrigin: true,
  pathRewrite: {
    '^/api/ad-generator': '/api'
  },
  onError: (err, req, res) => {
    console.error('Ad generator service error:', err.message);
    res.status(503).json({ error: 'Ad generator service unavailable' });
  }
}));

app.use('/api/status', createProxyMiddleware({
  target: microservices.status,
  changeOrigin: true,
  pathRewrite: {
    '^/api/status': '/api'
  },
  onError: (err, req, res) => {
    console.error('Status service error:', err.message);
    res.status(503).json({ error: 'Status service unavailable' });
  }
}));

// Dashboard summary endpoint - aggregates data from multiple services
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const summary = {
      totalInvestment: 0,
      inventoryCount: 0,
      salesToday: 0,
      dailyRevenue: 0,
      profitMargin: 0,
      pendingImports: 0,
      lowStockCount: 0,
      recentPurchases: []
    };

    // Try to get data from each service
    const services = [
      { name: 'purchases', url: microservices.purchases },
      { name: 'sales', url: microservices.sales },
      { name: 'inventory', url: microservices.inventory },
      { name: 'email', url: microservices.email }
    ];

    for (const service of services) {
      try {
        const response = await fetch(`${service.url}/api/dashboard/summary`);
        if (response.ok) {
          const data = await response.json();
          Object.assign(summary, data);
        }
      } catch (error) {
        console.warn(`Failed to get data from ${service.name} service:`, error.message);
      }
    }

    res.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard summary' });
  }
});

// Test endpoint for frontend connectivity
app.get('/test', (req, res) => {
  res.json({ 
    message: 'StockPilot API Gateway is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StockPilot API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying to microservices:`);
  Object.entries(microservices).forEach(([name, url]) => {
    console.log(`   ${name}: ${url}`);
  });
});

module.exports = app;
