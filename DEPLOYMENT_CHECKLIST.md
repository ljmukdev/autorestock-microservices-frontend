# Frontend Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway account set up
- [ ] Microservices already deployed on Railway

## 🚀 Deployment Steps

### 1. GitHub Setup
- [ ] Create repository on GitHub.com
- [ ] Push code: `git remote add origin https://github.com/YOUR_USERNAME/stockpilot.git`
- [ ] Push: `git push -u origin main`

### 2. Railway Deployment
- [ ] Go to Railway Dashboard
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select `stockpilot` repository
- [ ] **Set Root Directory to: `api-gateway`**
- [ ] Click "Deploy"

### 3. Environment Variables
Add these to your Railway API Gateway service:

```bash
NODE_ENV=production
PORT=3000
PURCHASES_SERVICE_URL=https://your-purchases-service.railway.app
SALES_SERVICE_URL=https://your-sales-service.railway.app
INVENTORY_SERVICE_URL=https://your-inventory-service.railway.app
SETTINGS_SERVICE_URL=https://your-settings-service.railway.app
EBAY_SERVICE_URL=https://your-ebay-service.railway.app
VINTED_SERVICE_URL=https://your-vinted-service.railway.app
EMAIL_SERVICE_URL=https://your-email-service.railway.app
REPORTING_SERVICE_URL=https://your-reporting-service.railway.app
MEDIA_SERVICE_URL=https://your-media-service.railway.app
ACCOUNTING_SERVICE_URL=https://your-accounting-service.railway.app
RULES_SERVICE_URL=https://your-rules-service.railway.app
AUTO_BUYING_SERVICE_URL=https://your-auto-buying-service.railway.app
AD_GENERATOR_SERVICE_URL=https://your-ad-generator-service.railway.app
STATUS_SERVICE_URL=https://your-status-service.railway.app
```

### 4. Testing
- [ ] Get API Gateway URL from Railway
- [ ] Visit URL in browser
- [ ] Test navigation between pages
- [ ] Test API calls (check browser console)
- [ ] Verify all microservices are responding

## 🔧 Troubleshooting

### Frontend Not Loading
- Check Railway logs for errors
- Verify Root Directory is set to `api-gateway`
- Check if service is running

### API Calls Failing
- Verify microservice URLs are correct
- Check if microservices are running
- Test individual microservice health endpoints

### Styling/Images Not Loading
- Check if static files are being served correctly
- Verify file paths in HTML

## 📊 What You'll Get

- **Frontend URL**: `https://your-api-gateway.railway.app`
- **Health Check**: `https://your-api-gateway.railway.app/health`
- **API Test**: `https://your-api-gateway.railway.app/test`

## 🎉 Success!

Once deployed, your AutoRestock frontend will:
- Look identical to your old monolithic application
- Work with your existing microservice architecture
- Handle all API calls through the API Gateway
- Scale automatically with Railway

---

**Total Time**: ~10-15 minutes
**Difficulty**: Easy
**Result**: Production-ready frontend with microservice backend


