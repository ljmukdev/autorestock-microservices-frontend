#!/bin/bash
# Railway Deployment Helper Script

echo "🚀 AutoRestock Frontend Deployment Helper"
echo "========================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Deploy the frontend
echo "🚀 Deploying frontend to Railway..."
echo "📁 Source directory: frontends/"
echo "🔧 Build command: npm install"
echo "▶️  Start command: npm start"

# Set the working directory for Railway
export RAILWAY_WORKING_DIRECTORY=frontends

# Deploy
railway up --detach

echo "✅ Deployment initiated!"
echo "🌐 Check your Railway dashboard for deployment status"
