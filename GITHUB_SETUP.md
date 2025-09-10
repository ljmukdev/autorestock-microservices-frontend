# GitHub Repository Setup Guide

This guide will help you set up your StockPilot repository on GitHub and configure it for Railway deployment.

## 🚀 Step 1: Create GitHub Repository

### Option A: Create Repository on GitHub.com

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `stockpilot`
   - **Description**: `Microservice-based inventory management system for reselling`
   - **Visibility**: Choose Public or Private
   - **Initialize**: Don't check any boxes (we already have files)
5. Click "Create repository"

### Option B: Create Repository via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# Windows: winget install GitHub.cli
# Or download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create stockpilot --public --description "Microservice-based inventory management system for reselling"
```

## 🔗 Step 2: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/stockpilot.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## 🔐 Step 3: Configure GitHub Secrets for Railway

1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway authentication token | Railway Dashboard → Account → Tokens → New Token |

### How to Get Railway Token

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your profile picture (top right)
3. Select "Account Settings"
4. Go to "Tokens" tab
5. Click "New Token"
6. Give it a name like "GitHub Actions"
7. Copy the token and add it to GitHub secrets

## 🚀 Step 4: Enable GitHub Actions

The repository already includes GitHub Actions workflows in `.github/workflows/deploy.yml`. These will:

- Run tests on every push and pull request
- Automatically deploy to Railway when code is pushed to `main` branch
- Deploy all microservices and the API Gateway

### Workflow Features

- **Testing**: Runs tests for the API Gateway
- **Deployment**: Automatically deploys to Railway on main branch pushes
- **Multi-service**: Deploys all core services (API Gateway, Purchases, Sales, Inventory, Settings)

## 📊 Step 5: Monitor Deployments

### GitHub Actions Tab
1. Go to your repository on GitHub
2. Click "Actions" tab
3. View deployment status and logs

### Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. View your deployed services
3. Monitor logs and performance

## 🔧 Step 6: Configure Branch Protection (Optional)

To ensure code quality, you can set up branch protection rules:

1. Go to repository "Settings" → "Branches"
2. Click "Add rule"
3. Configure:
   - **Branch name pattern**: `main`
   - **Require pull request reviews**: ✅
   - **Require status checks**: ✅
   - **Require branches to be up to date**: ✅

## 🚀 Step 7: Deploy to Railway

### Automatic Deployment
Once you push to the `main` branch, GitHub Actions will automatically deploy to Railway.

### Manual Deployment
You can also deploy manually using the Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy API Gateway
cd api-gateway
railway up

# Deploy microservices
cd ../microservices/purchases-service
railway up
# Repeat for other services...
```

## 📋 Step 8: Verify Deployment

### Check GitHub Actions
1. Go to "Actions" tab in your repository
2. Verify all workflows are passing
3. Check deployment logs for any errors

### Check Railway Services
1. Go to Railway Dashboard
2. Verify all services are running
3. Check service URLs and health endpoints

### Test Frontend
1. Get your API Gateway URL from Railway
2. Visit the URL in your browser
3. Test the application functionality

## 🔄 Step 9: Continuous Development

### Development Workflow
1. Create feature branches for new features
2. Make changes and test locally
3. Push to feature branch
4. Create pull request to `main`
5. Review and merge
6. Automatic deployment to Railway

### Environment Management
- **Development**: Local development with local services
- **Staging**: Railway deployment for testing
- **Production**: Railway deployment for live use

## 🛠️ Troubleshooting

### Common Issues

1. **GitHub Actions Failing**
   - Check if `RAILWAY_TOKEN` secret is set correctly
   - Verify Railway CLI is working: `railway whoami`
   - Check workflow logs for specific errors

2. **Railway Deployment Issues**
   - Check service logs in Railway dashboard
   - Verify environment variables are set
   - Ensure all dependencies are in package.json

3. **Frontend Not Loading**
   - Check if API Gateway is running
   - Verify service URLs are correct
   - Check browser console for errors

### Getting Help

- Check the `DEPLOYMENT.md` file for detailed deployment instructions
- Review individual service READMEs in the `microservices/` directory
- Create an issue in the GitHub repository for bugs or questions

## 📈 Next Steps

1. **Set up monitoring**: Configure alerts and monitoring for production
2. **Add CI/CD**: Enhance GitHub Actions with more comprehensive testing
3. **Database setup**: Configure MongoDB for production use
4. **Custom domains**: Set up custom domains for your services
5. **Scaling**: Configure auto-scaling based on traffic

---

**Your StockPilot microservice architecture is now ready for production deployment! 🎉**
