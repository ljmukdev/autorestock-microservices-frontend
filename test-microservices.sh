#!/bin/bash

# Microservices Health Check Script
# Run this to quickly test all services

echo "🔍 Testing AutoRestock Microservices Health..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a service
test_service() {
    local service_name=$1
    local url=$2
    local endpoint=${3:-"/ping"}
    
    echo -n "Testing $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url$endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
        return 1
    fi
}

# Test all services
echo "📡 Testing service endpoints..."

# Replace these URLs with your actual Railway URLs
test_service "Reporting Service" "https://your-reporting-service.up.railway.app" "/ping"
test_service "Purchases Service" "https://your-purchases-service.up.railway.app" "/ping"
test_service "Sales Service" "https://your-sales-service.up.railway.app" "/ping"
test_service "Inventory Service" "https://your-inventory-service.up.railway.app" "/ping"
test_service "Settings Service" "https://your-settings-service.up.railway.app" "/ping"

echo ""
echo "🏥 Testing health endpoints..."

# Test health endpoints (these require database)
test_service "Reporting Health" "https://your-reporting-service.up.railway.app" "/health"
test_service "Purchases Health" "https://your-purchases-service.up.railway.app" "/health"

echo ""
echo "✅ Health check complete!"


