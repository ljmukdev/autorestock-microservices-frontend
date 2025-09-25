# Quick Setup Guide - Frontend Deployment

## 🚀 Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `stockpilot`
4. Description: `Microservice-based inventory management system for reselling`
5. Make it Public or Private (your choice)
6. **Don't** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## 🔗 Step 2: Push to GitHub

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/stockpilot.git

# Push your code
git branch -M main
git push -u origin main
```

## 🚀 Step 3: Deploy Frontend to Railway

### Option A: Deploy API Gateway (Recommended)
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `stockpilot` repository
4. **Important**: Set the **Root Directory** to `api-gateway`
5. Railway will automatically detect it's a Node.js app
6. Click "Deploy"

### Option B: Deploy from Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy API Gateway
cd api-gateway
railway up
```

## ⚙️ Step 4: Configure Environment Variables

In Railway dashboard, add these environment variables to your API Gateway service:

### Required Variables
```bash
NODE_ENV=production
PORT=3000
```

### Microservice URLs (Update with your actual Railway URLs)
```bash
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

## 🧪 Step 5: Test Your Frontend

1. Get your API Gateway URL from Railway dashboard
2. Visit the URL in your browser
3. You should see your AutoRestock frontend
4. Test the navigation and API calls

## 📁 What's Included

Your repository now contains:
- ✅ **Frontend**: All your HTML, CSS, JS files (identical to old structure)
- ✅ **API Gateway**: Routes frontend requests to microservices
- ✅ **Railway Config**: Ready for Railway deployment
- ✅ **Documentation**: Complete setup guides

## 🔧 Troubleshooting

### Frontend Not Loading
- Check if API Gateway is running in Railway
- Verify the service URL is correct
- Check Railway logs for errors

### API Calls Failing
- Verify microservice URLs are correct in environment variables
- Check if your microservices are running
- Test individual microservice endpoints

### Styling Issues
- Ensure all CSS files are in the `frontend/css/` directory
- Check if images are loading from `frontend/images/`

## 🎉 You're Done!

Your AutoRestock frontend is now deployed and ready to work with your microservice architecture. The frontend will look and work exactly like your old monolithic application, but now it's powered by microservices!

---

**Need Help?** Check the detailed guides in `DEPLOYMENT.md` and `README-Frontend.md`


