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
const fetch = require('node-fetch');

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
  ebay: process.env.EBAY_SERVICE_URL || 'https://stockpilot-ebay-microservice-production.up.railway.app',
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

// Direct purchase endpoint (bypass proxy issues)
app.post('/api/purchases', async (req, res) => {
  console.log('🔄 Direct purchase endpoint called');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const purchaseServiceUrl = microservices.purchases;
    const response = await fetch(`${purchaseServiceUrl}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      timeout: 25000
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Purchases service error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Purchases service error',
        details: errorText,
        status: response.status
      });
    }
    
    const result = await response.json();
    console.log('✅ Purchase created successfully:', result);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('❌ Direct purchase endpoint error:', error.message);
    res.status(500).json({
      error: 'Failed to create purchase',
      details: error.message
    });
  }
});

// Direct delete purchase endpoint
app.delete('/api/purchases/:id', async (req, res) => {
  console.log('🗑️ Direct delete purchase endpoint called for ID:', req.params.id);
  
  try {
    const purchaseServiceUrl = microservices.purchases;
    const response = await fetch(`${purchaseServiceUrl}/api/purchases/${req.params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 25000
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Purchases service delete error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to delete purchase',
        details: errorText,
        status: response.status
      });
    }
    
    const result = await response.json();
    console.log('✅ Purchase deleted successfully:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Direct delete endpoint error:', error.message);
    res.status(500).json({
      error: 'Failed to delete purchase',
      details: error.message
    });
  }
});

// eBay OAuth start endpoint - now handled by proxy

// eBay purchase sync endpoint - now handled by flat route proxy

// Transform eBay data to purchase format
function transformEbayDataToPurchases(ebayData) {
  const purchases = [];
  
  try {
    // Handle different eBay data structures
    if (ebayData.purchases && Array.isArray(ebayData.purchases)) {
      ebayData.purchases.forEach(ebayPurchase => {
        const purchase = {
          identifier: ebayPurchase.itemId || `EBAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: extractCategoryFromTitle(ebayPurchase.title || ''),
          brand: extractBrandFromTitle(ebayPurchase.title || ''),
          model: extractModelFromTitle(ebayPurchase.title || ''),
          generation: null,
          source: 'eBay',
          supplier: 'eBay',
          seller_username: ebayPurchase.seller || 'Unknown',
          order_id: ebayPurchase.itemId || null,
          price_paid: parseFloat(ebayPurchase.currentPrice || ebayPurchase.price || 0),
          shipping_cost: parseFloat(ebayPurchase.shippingCost || 0),
          fees: parseFloat(ebayPurchase.fees || 0),
          tracking_ref: ebayPurchase.trackingNumber || null,
          notes: `eBay Purchase: ${ebayPurchase.title || 'Unknown Item'}`,
          dateOfPurchase: ebayPurchase.endTime ? new Date(ebayPurchase.endTime) : new Date(),
          status: 'Purchased',
          createdBy: 'ebay-sync',
          platform: 'eBay',
          external_id: ebayPurchase.itemId,
          external_url: ebayPurchase.viewUrl || null,
          photos: ebayPurchase.photos || []
        };
        
        purchases.push(purchase);
      });
    }
    
    // Handle alternative data structures
    if (ebayData.orders && Array.isArray(ebayData.orders)) {
      ebayData.orders.forEach(order => {
        // Process order items
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const purchase = {
              identifier: item.itemId || `EBAY_ORDER_${order.orderId}_${Date.now()}`,
              category: extractCategoryFromTitle(item.title || ''),
              brand: extractBrandFromTitle(item.title || ''),
              model: extractModelFromTitle(item.title || ''),
              generation: null,
              source: 'eBay',
              supplier: 'eBay',
              seller_username: order.seller || 'Unknown',
              order_id: order.orderId || item.itemId,
              price_paid: parseFloat(item.price || 0),
              shipping_cost: parseFloat(order.shippingCost || 0),
              fees: parseFloat(order.fees || 0),
              tracking_ref: order.trackingNumber || null,
              notes: `eBay Order: ${item.title || 'Unknown Item'}`,
              dateOfPurchase: order.orderDate ? new Date(order.orderDate) : new Date(),
              status: 'Purchased',
              createdBy: 'ebay-sync',
              platform: 'eBay',
              external_id: item.itemId,
              external_url: item.viewUrl || null,
              photos: item.photos || []
            };
            
            purchases.push(purchase);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error transforming eBay data:', error.message);
  }
  
  return purchases;
}

// Helper functions for data extraction
function extractCategoryFromTitle(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('sonos') || titleLower.includes('speaker') || titleLower.includes('audio')) return 'Audio Equipment';
  if (titleLower.includes('iphone') || titleLower.includes('apple') || titleLower.includes('mobile')) return 'Mobile Accessories';
  if (titleLower.includes('laptop') || titleLower.includes('computer') || titleLower.includes('pc')) return 'Computing';
  if (titleLower.includes('headphone') || titleLower.includes('earphone') || titleLower.includes('headset')) return 'Audio Equipment';
  if (titleLower.includes('cable') || titleLower.includes('charger') || titleLower.includes('adapter')) return 'Accessories';
  
  return 'Other';
}

function extractBrandFromTitle(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('sonos')) return 'Sonos';
  if (titleLower.includes('apple')) return 'Apple';
  if (titleLower.includes('samsung')) return 'Samsung';
  if (titleLower.includes('bose')) return 'Bose';
  if (titleLower.includes('jbl')) return 'JBL';
  if (titleLower.includes('lg')) return 'LG';
  if (titleLower.includes('dell')) return 'Dell';
  if (titleLower.includes('hp')) return 'HP';
  if (titleLower.includes('lenovo')) return 'Lenovo';
  
  return 'Unknown';
}

function extractModelFromTitle(title) {
  // Try to extract model numbers or specific product names
  const modelPatterns = [
    /(\b[A-Z]{2,}\d{2,}[A-Z]?\b)/, // Pattern like "Play5", "iPhone12"
    /(\b\d{4}[A-Z]?\b)/, // Pattern like "2021", "13Pro"
    /(\b[A-Z]+\d+[A-Z]*\b)/ // General alphanumeric patterns
  ];
  
  for (const pattern of modelPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return 'Unknown';
}

// Keep GET requests using proxy for now
app.get('/api/purchases', createProxyMiddleware({
  target: microservices.purchases,
  changeOrigin: true,
  secure: true, // Use HTTPS
  timeout: 25000, // 25 second timeout
  proxyTimeout: 25000,
  pathRewrite: {
    '^/api/purchases': '/api/purchases'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to ${microservices.purchases}${req.url}`);
    console.log(`🌐 Full target URL: ${microservices.purchases}/api/purchases`);
    console.log(`📋 Request headers being sent:`, proxyReq.getHeaders());
    // Force HTTPS if not already set
    if (!proxyReq.protocol || proxyReq.protocol === 'http:') {
      proxyReq.protocol = 'https:';
    }
  },
  onError: (err, req, res) => {
    console.error('🚨 Purchases service proxy error:', err.message);
    console.error('🔍 Error details:', {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    });
    console.error('📡 Target URL:', microservices.purchases);
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'Purchases service unavailable',
        details: err.message,
        target: microservices.purchases
      });
    }
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

app.use(
  '/api/v1/ebay',
  createProxyMiddleware({
    target: microservices.ebay,        // e.g. https://stockpilot-ebay-microservice-production.up.railway.app
    changeOrigin: true,
    xfwd: true,
    pathRewrite: { '^/api/v1/ebay': '' },  // strip prefix → service sees flat routes
    proxyTimeout: 25_000,
    timeout: 25_000,
    onProxyReq: (proxyReq, req) => {
      const rid = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      proxyReq.setHeader('x-request-id', rid);
      proxyReq.setHeader('x-forwarded-host', req.headers.host || 'api-gateway');
    },
    onError: (err, req, res) => {
      console.error('eBay service error:', err.message);
      res.status(503).json({ error: 'EBAY_SERVICE_UNAVAILABLE', detail: err.message });
    },
  })
);

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
