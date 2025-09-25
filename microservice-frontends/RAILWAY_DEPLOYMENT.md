# Railway Deployment Guide for AutoRestock Microservice Frontends

This guide explains how to deploy and configure the microservice frontends to work with your Railway-deployed microservices.

## 🚀 Quick Setup

### 1. Update Railway URLs

Edit `railway-config.js` and replace the placeholder URLs with your actual Railway deployment URLs:

```javascript
const RAILWAY_SERVICES = {
    'purchases-service': {
        name: 'Purchases Service',
        url: 'https://your-actual-purchases-service-url.up.railway.app', // Replace this
        port: 3001,
        description: 'Manages purchase data, supplier information, and purchase workflows'
    },
    // ... update all other services
};
```

### 2. Deploy Frontends to Railway

You can deploy the frontends in several ways:

#### Option A: Deploy as Static Files
1. Create a new Railway project
2. Upload the `microservice-frontends` folder
3. Configure Railway to serve static files
4. Set the root path to `microservice-frontends`

#### Option B: Deploy Individual Services
1. Each service frontend can be deployed as a separate Railway service
2. Update the launcher to point to the deployed frontend URLs

#### Option C: Deploy with Main Application
1. Include the frontends in your main AutoRestock application
2. Serve them from a `/microservice-frontends` route

## 🔧 Configuration Steps

### Step 1: Get Your Railway URLs

1. Go to your Railway dashboard
2. For each microservice, copy the Railway URL
3. Update `railway-config.js` with these URLs

### Step 2: Configure CORS

Make sure your Railway microservices have CORS enabled for the frontend domain:

```javascript
// In your microservice app.js
app.use(cors({
    origin: [
        'https://your-frontend-domain.up.railway.app',
        'http://localhost:3000', // For local development
        'file://' // For local file access
    ],
    credentials: true
}));
```

### Step 3: Environment Variables

Ensure your Railway services have the necessary environment variables:

```bash
# For each microservice
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=https://your-frontend-domain.up.railway.app
```

## 📋 Service URLs Template

Here's a template for your `railway-config.js`:

```javascript
const RAILWAY_SERVICES = {
    'purchases-service': {
        name: 'Purchases Service',
        url: 'https://purchases-service-production-xxxx.up.railway.app',
        port: 3001,
        description: 'Manages purchase data, supplier information, and purchase workflows'
    },
    'sales-service': {
        name: 'Sales Service', 
        url: 'https://sales-service-production-xxxx.up.railway.app',
        port: 3002,
        description: 'Manages sales data, revenue tracking, and sales analytics'
    },
    'ebay-service': {
        name: 'eBay Service',
        url: 'https://ebay-service-production-xxxx.up.railway.app',
        port: 3003,
        description: 'OAuth authentication and data retrieval from eBay API'
    },
    'inventory-service': {
        name: 'Inventory Service',
        url: 'https://inventory-service-production-xxxx.up.railway.app',
        port: 3004,
        description: 'Manages inventory items, stock levels, and product information'
    },
    'vinted-service': {
        name: 'Vinted Service',
        url: 'https://vinted-service-production-xxxx.up.railway.app',
        port: 3005,
        description: 'Web scraping and email parsing for Vinted transactions'
    },
    'media-service': {
        name: 'Media Service',
        url: 'https://media-service-production-xxxx.up.railway.app',
        port: 3006,
        description: 'Handles media uploads, storage, and management'
    },
    'email-ingestion-service': {
        name: 'Email Service',
        url: 'https://email-ingestion-service-production-xxxx.up.railway.app',
        port: 3007,
        description: 'Email ingestion, parsing, and categorization'
    },
    'reporting-service': {
        name: 'Reporting Service',
        url: 'https://reporting-service-production-xxxx.up.railway.app',
        port: 3008,
        description: 'Generates reports, analytics, and trend analysis'
    }
};
```

## 🧪 Testing Your Setup

### 1. Health Check Test

Open your browser's developer console and run:

```javascript
// Test a specific service
fetch('https://your-purchases-service-url.up.railway.app/health')
    .then(response => response.json())
    .then(data => console.log('Service health:', data))
    .catch(error => console.error('Service error:', error));
```

### 2. Frontend Test

1. Open the launcher: `microservice-frontends/launcher.html`
2. Click "Status" on any service card
3. Verify the service is online and healthy

### 3. API Testing

1. Launch a service frontend
2. Go to the "API Testing" tab
3. Test various endpoints to ensure they work

## 🚨 Troubleshooting

### CORS Issues

If you see CORS errors:

1. **Check Railway service CORS configuration:**
   ```javascript
   app.use(cors({
       origin: ['https://your-frontend-domain.up.railway.app'],
       credentials: true
   }));
   ```

2. **Verify the frontend domain is in the allowed origins list**

### Service Not Responding

1. **Check Railway dashboard** - Ensure services are deployed and running
2. **Check service logs** - Look for errors in Railway logs
3. **Verify URLs** - Make sure Railway URLs are correct in `railway-config.js`

### Health Check Failures

1. **Check service health endpoint** - Visit `https://your-service-url.up.railway.app/health`
2. **Check database connection** - Ensure MongoDB is connected
3. **Check environment variables** - Verify all required env vars are set

## 📝 Deployment Checklist

- [ ] All microservices deployed to Railway
- [ ] Railway URLs updated in `railway-config.js`
- [ ] CORS configured for frontend domain
- [ ] Environment variables set in Railway
- [ ] Health checks passing
- [ ] Frontend launcher working
- [ ] Individual service frontends accessible
- [ ] API testing functional

## 🔄 Workflow

1. **Develop locally** - Use localhost URLs for development
2. **Push to Git** - Commit your changes
3. **Deploy to Railway** - Railway auto-deploys from Git
4. **Update frontend URLs** - Update `railway-config.js` with new Railway URLs
5. **Test on Railway** - Verify everything works in production

## 📞 Support

If you encounter issues:

1. Check Railway service logs
2. Verify service health endpoints
3. Test API endpoints directly
4. Check browser console for errors
5. Ensure CORS is properly configured

Remember: The frontends are designed to work with your Railway-deployed microservices, not local development servers!
