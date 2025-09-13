# 🚀 StockPilot Microservices Testing Guide

## **Phase 1: Quick Health Check (5 minutes)**

### **1. Run Health Check Script**
```bash
# Make executable and run
chmod +x test-microservices.sh
./test-microservices.sh
```

### **2. Manual Health Checks**
Visit these URLs in your browser:
- `https://your-reporting-service.up.railway.app/ping`
- `https://your-purchases-service.up.railway.app/ping`
- `https://your-sales-service.up.railway.app/ping`

**Expected:** All should return `{"status": "ok"}`

---

## **Phase 2: API Endpoint Testing (10 minutes)**

### **1. Run Comprehensive API Tests**
```bash
node test-api-endpoints.js
```

### **2. Test Each Service Manually**

#### **Reporting Service**
```bash
# Health check
curl https://your-reporting-service.up.railway.app/health

# List reports
curl https://your-reporting-service.up.railway.app/api/reports

# Create test report
curl -X POST https://your-reporting-service.up.railway.app/api/reports \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Report","type":"analytics","data":{"test":true},"userId":"507f1f77bcf86cd799439011"}'
```

#### **Purchases Service**
```bash
# Health check
curl https://your-purchases-service.up.railway.app/health

# List purchases
curl https://your-purchases-service.up.railway.app/api/purchases

# Create test purchase
curl -X POST https://your-purchases-service.up.railway.app/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"item":"Test Item","price":29.99,"quantity":1,"userId":"507f1f77bcf86cd799439011"}'
```

---

## **Phase 3: Database Testing (5 minutes)**

### **1. Check Database Collections**
Connect to your MongoDB and verify collections exist:
```javascript
// In MongoDB shell or GUI
use stockpilot
show collections

// Should see:
// - reports
// - purchases
// - sales
// - inventory
// - settings
```

### **2. Test Data Persistence**
1. Create data via API
2. Check it appears in database
3. Verify it can be retrieved

---

## **Phase 4: Integration Testing (15 minutes)**

### **1. End-to-End Workflow**
```bash
# 1. Create a purchase
curl -X POST https://your-purchases-service.up.railway.app/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"item":"iPhone 15","price":999,"quantity":1,"userId":"user123"}'

# 2. Create a sale
curl -X POST https://your-sales-service.up.railway.app/api/sales \
  -H "Content-Type: application/json" \
  -d '{"item":"iPhone 15","price":1200,"quantity":1,"userId":"user123"}'

# 3. Generate a report
curl -X POST https://your-reporting-service.up.railway.app/api/reports \
  -H "Content-Type: application/json" \
  -d '{"title":"Sales Report","type":"financial","data":{"sales":1200,"purchases":999},"userId":"user123"}'
```

### **2. Cross-Service Communication**
Test that services can communicate (if they do):
- Purchase → Inventory update
- Sale → Reporting update
- Settings → All services

---

## **Phase 5: Performance Testing (10 minutes)**

### **1. Load Testing**
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test reporting service
ab -n 100 -c 10 https://your-reporting-service.up.railway.app/ping

# Test purchases service
ab -n 100 -c 10 https://your-purchases-service.up.railway.app/ping
```

### **2. Response Time Monitoring**
- Check Railway logs for response times
- Monitor database connection times
- Verify health check response times

---

## **Phase 6: Error Handling Testing (10 minutes)**

### **1. Test Database Failures**
- Temporarily disconnect database
- Verify services still respond to `/ping`
- Check error handling in logs

### **2. Test Invalid Requests**
```bash
# Invalid JSON
curl -X POST https://your-purchases-service.up.railway.app/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'

# Missing required fields
curl -X POST https://your-purchases-service.up.railway.app/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"item":"Test"}'
```

---

## **Phase 7: Monitoring Setup (5 minutes)**

### **1. Railway Monitoring**
- Check Railway dashboard for service health
- Monitor resource usage
- Set up alerts for failures

### **2. Log Monitoring**
- Check service logs for errors
- Monitor database connection logs
- Verify health check logs

---

## **🚀 Development Workflow**

### **Daily Testing Routine (5 minutes)**
1. Run health check script
2. Check Railway dashboard
3. Verify database connections
4. Test one new feature

### **Weekly Testing Routine (30 minutes)**
1. Run full API test suite
2. Test all integrations
3. Performance check
4. Error handling test

### **Before Deployment**
1. Run all tests
2. Check all services are healthy
3. Verify database connections
4. Test critical workflows

---

## **🔧 Quick Fixes for Common Issues**

### **Service Not Starting**
1. Check Railway logs
2. Verify environment variables
3. Check database connection
4. Restart service

### **Database Connection Issues**
1. Verify MongoDB credentials
2. Check network connectivity
3. Restart database service
4. Check connection string format

### **API Errors**
1. Check request format
2. Verify required fields
3. Check authentication
4. Review service logs

---

## **📊 Success Metrics**

- **Health Checks:** 100% passing
- **API Endpoints:** 90%+ working
- **Response Times:** < 2 seconds
- **Error Rate:** < 5%
- **Database Connections:** Stable

**This testing strategy will keep your microservices architecture healthy and moving forward efficiently!** 🎉


