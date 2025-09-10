# MongoDB Setup Guide for StockPilot Microservices

## Quick Setup with MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and sign up
3. Choose the **FREE** M0 Sandbox tier (no credit card required)

### Step 2: Create a Cluster
1. Choose **AWS** as your cloud provider
2. Select a region close to you (e.g., `us-east-1` for US East)
3. Keep the default cluster name `Cluster0`
4. Click "Create Cluster"

### Step 3: Set Up Database Access
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and password (save these!)
5. Set privileges to **Read and write to any database**
6. Click **Add User**

### Step 4: Set Up Network Access
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for Railway deployment)
4. Click **Confirm**

### Step 5: Get Your Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** and version **4.1 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Configure Your Microservices

#### For Railway Deployment:
1. Go to your Railway project dashboard
2. Select your reporting-service
3. Go to **Variables** tab
4. Add these environment variables:
   - `MONGODB_URI` = `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockpilot-reporting?retryWrites=true&w=majority`
   - `DATABASE_URL` = `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockpilot-reporting?retryWrites=true&w=majority`

#### For Local Development:
1. Create a `.env` file in each microservice directory:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockpilot-reporting?retryWrites=true&w=majority
   DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockpilot-reporting?retryWrites=true&w=majority
   ```

### Step 7: Test Your Connection
```bash
cd microservices/reporting-service
npm run test:db
```

## Database Names for Each Service

Each microservice uses its own database:
- **reporting-service**: `stockpilot-reporting`
- **purchases-service**: `purchases-service`
- **sales-service**: `sales-service`
- **inventory-service**: `inventory-service`
- **settings-service**: `settings-service`
- **auto-buying-service**: `auto-buying-service`
- **ad-generator-service**: `ad-generator-service`
- **accounting-integration**: `accounting-integration`

## Troubleshooting

### Connection String Format
Make sure your connection string includes the database name:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

### Common Issues
1. **Authentication failed**: Check username/password
2. **Network access denied**: Make sure IP is whitelisted
3. **Connection timeout**: Check if cluster is running

### Testing Connection
```bash
# Test reporting service
cd microservices/reporting-service
npm run test:db

# Test any service
cd microservices/[service-name]
npm run test:db
```

## Free Tier Limits
- **512 MB storage**
- **Shared RAM and vCPUs**
- **No backup retention**
- **Perfect for development and small applications**

This should be more than enough for your microservices development!
