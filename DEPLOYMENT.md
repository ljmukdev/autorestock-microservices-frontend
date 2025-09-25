# AutoRestock Deployment Guide

This guide covers deploying AutoRestock's microservice architecture to Railway with GitHub integration.

## 🚀 Railway Deployment

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Railway CLI** (optional): `npm install -g @railway/cli`

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select the `stockpilot` repository

### Step 2: Deploy API Gateway

1. In Railway dashboard, click "New Service"
2. Select "GitHub Repo" and choose your repository
3. Set the **Root Directory** to `api-gateway`
4. Railway will automatically detect the Node.js app
5. Click "Deploy"

**Environment Variables for API Gateway:**
```bash
NODE_ENV=production
PORT=3000
```

### Step 3: Deploy Microservices

For each microservice, create a new service in Railway:

#### Core Services
- **Purchases Service**: Root directory `microservices/purchases-service`
- **Sales Service**: Root directory `microservices/sales-service`
- **Inventory Service**: Root directory `microservices/inventory-service`
- **Settings Service**: Root directory `microservices/settings-service`

#### Integration Services
- **eBay Service**: Root directory `microservices/ebay-service`
- **Vinted Service**: Root directory `microservices/vinted-service`
- **Email Service**: Root directory `microservices/email-ingestion-service`

#### Support Services
- **Reporting Service**: Root directory `microservices/reporting-service`
- **Media Service**: Root directory `microservices/media-service`
- **Accounting Service**: Root directory `microservices/accounting-integration-service`
- **Rules Engine**: Root directory `microservices/rules-engine-service`
- **Auto-buying Service**: Root directory `microservices/auto-buying-service`
- **Ad Generator**: Root directory `microservices/ad-generator-service`
- **Status Service**: Root directory `microservices/status-service`

### Step 4: Configure Environment Variables

Set these environment variables for each service:

#### Database
```bash
MONGODB_URI=mongodb://localhost:27017/stockpilot
# Or use Railway's MongoDB addon
MONGODB_URI=${{MONGODB_URI}}
```

#### Service URLs (for API Gateway)
```bash
PURCHASES_SERVICE_URL=https://purchases-service-production.up.railway.app
SALES_SERVICE_URL=https://sales-service-production.up.railway.app
INVENTORY_SERVICE_URL=https://inventory-service-production.up.railway.app
SETTINGS_SERVICE_URL=https://settings-service-production.up.railway.app
EBAY_SERVICE_URL=https://ebay-service-production.up.railway.app
VINTED_SERVICE_URL=https://vinted-service-production.up.railway.app
EMAIL_SERVICE_URL=https://email-service-production.up.railway.app
REPORTING_SERVICE_URL=https://reporting-service-production.up.railway.app
MEDIA_SERVICE_URL=https://media-service-production.up.railway.app
ACCOUNTING_SERVICE_URL=https://accounting-service-production.up.railway.app
RULES_SERVICE_URL=https://rules-service-production.up.railway.app
AUTO_BUYING_SERVICE_URL=https://auto-buying-service-production.up.railway.app
AD_GENERATOR_SERVICE_URL=https://ad-generator-service-production.up.railway.app
STATUS_SERVICE_URL=https://status-service-production.up.railway.app
```

### Step 5: Add MongoDB Database

1. In Railway dashboard, click "New"
2. Select "Database" → "MongoDB"
3. This will provide a `MONGODB_URI` environment variable
4. Add this variable to all services that need database access

### Step 6: Configure Custom Domains (Optional)

1. Go to your API Gateway service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## 🔄 GitHub Integration

### GitHub Actions Setup

1. **Add Railway Token to GitHub Secrets:**
   - Go to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"
   - Add new secret: `RAILWAY_TOKEN`
   - Get the token from Railway dashboard → Account → Tokens

2. **Enable GitHub Actions:**
   - The workflow file is already configured in `.github/workflows/deploy.yml`
   - It will automatically deploy on pushes to `main` branch

### Manual Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy specific service
cd microservices/purchases-service
railway up

# Deploy all services
railway up --service purchases-service
railway up --service sales-service
# ... repeat for each service
```

## 🧪 Testing Deployment

### Health Checks

Each service exposes a health endpoint:
- API Gateway: `https://your-api-gateway.railway.app/health`
- Microservices: `https://your-service.railway.app/health`

### Frontend Access

- **Production URL**: `https://your-api-gateway.railway.app`
- **API Health**: `https://your-api-gateway.railway.app/health`
- **API Test**: `https://your-api-gateway.railway.app/test`

## 📊 Monitoring

### Railway Dashboard
- View logs for each service
- Monitor resource usage
- Check deployment status

### Application Monitoring
- Use the Status Service for centralized monitoring
- Check individual service health endpoints
- Monitor API Gateway logs for request routing

## 🔧 Troubleshooting

### Common Issues

1. **Service Not Starting**
   - Check logs in Railway dashboard
   - Verify environment variables are set
   - Ensure all dependencies are in package.json

2. **Database Connection Issues**
   - Verify MONGODB_URI is correct
   - Check if MongoDB service is running
   - Ensure network connectivity

3. **API Gateway Routing Issues**
   - Verify service URLs are correct
   - Check if microservices are running
   - Review API Gateway logs

4. **Frontend Not Loading**
   - Check if API Gateway is running
   - Verify static file serving
   - Check browser console for errors

### Debug Commands

```bash
# Check service status
railway status

# View logs
railway logs

# Connect to service shell
railway shell

# Check environment variables
railway variables
```

## 🚀 Production Checklist

- [ ] All services deployed to Railway
- [ ] Environment variables configured
- [ ] Database connected and accessible
- [ ] Custom domain configured (if needed)
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] Monitoring configured
- [ ] Backup strategy in place

## 📈 Scaling

### Horizontal Scaling
- Railway automatically handles scaling based on traffic
- Each service can be scaled independently
- Use Railway's scaling settings to adjust resources

### Vertical Scaling
- Upgrade service plans in Railway dashboard
- Monitor resource usage and adjust accordingly

## 🔒 Security

### Environment Variables
- Never commit sensitive data to Git
- Use Railway's environment variable system
- Rotate secrets regularly

### Network Security
- Railway provides HTTPS by default
- Use Railway's private networking for internal communication
- Configure CORS appropriately

---

**Need Help?** Check the individual service READMEs or create an issue in the GitHub repository.


