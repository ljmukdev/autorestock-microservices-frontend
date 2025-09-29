const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const userRoutes = require('./routes/users');
const aliasRoutes = require('./routes/aliases');
const connectionRoutes = require('./routes/connections');
const onboardingRoutes = require('./routes/onboarding');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import data store
const dataStore = require('./data/mongodb-store');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔧 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'NOT SET',
  MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tenants', aliasRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AutoRestock User Service',
    version: '1.0.0',
    description: 'Single source of truth for users/tenants',
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
      aliases: '/api/v1/tenants/:id/aliases',
      connections: '/api/v1/connections',
      onboarding: '/api/v1/onboarding/status'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Initialize data store
console.log('🔄 Initializing data store...');
dataStore.initialize().then(() => {
  console.log('✅ Data store initialized');
  
  // Start server
  console.log('🚀 Starting server...');
  app.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/`);
  });
}).catch((error) => {
  console.error('❌ Failed to initialize data store:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await dataStore.close();
    console.log('MongoDB connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await dataStore.close();
    console.log('MongoDB connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = app;
