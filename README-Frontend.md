# StockPilot Frontend - Microservice Architecture

This directory contains the frontend application for StockPilot, adapted to work with the microservice architecture.

## Structure

```
frontend/
├── css/
│   └── stockpilot-global.css    # Global styles
├── js/
│   └── stockpilot-api.js        # API client for microservices
├── images/
│   ├── stockpilot-logo.png      # Main logo
│   └── stockpilot-logo-vector.png
├── *.html                       # All HTML pages
└── public/                      # Additional static assets

api-gateway/
├── app.js                       # API Gateway server
├── package.json                 # Dependencies
└── README.md                    # Gateway documentation
```

## Quick Start

1. **Start the API Gateway:**
   ```powershell
   .\start-frontend.ps1
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - API Health: http://localhost:3000/health
   - API Test: http://localhost:3000/test

## How It Works

### API Gateway
The API Gateway (`api-gateway/app.js`) acts as a single entry point for all frontend requests:

- **Static Files**: Serves HTML, CSS, JS, and images directly
- **API Routing**: Proxies API requests to appropriate microservices
- **Error Handling**: Provides fallback responses when services are unavailable
- **Security**: Includes rate limiting, CORS, and security headers

### Microservice Integration
The frontend communicates with microservices through the API Gateway:

- **Purchases**: `/api/purchases/*` → Purchases Service
- **Sales**: `/api/sales/*` → Sales Service  
- **Inventory**: `/api/inventory/*` → Inventory Service
- **Settings**: `/api/settings/*` → Settings Service
- **eBay**: `/api/ebay/*` → eBay Service
- **Vinted**: `/api/vinted/*` → Vinted Service
- **Email**: `/api/email-import/*` → Email Service
- **Reports**: `/api/reports/*` → Reporting Service
- **Media**: `/api/media/*` → Media Service
- **Accounting**: `/api/accounting/*` → Accounting Service
- **Rules**: `/api/rules/*` → Rules Engine Service
- **Auto-buying**: `/api/auto-buying/*` → Auto-buying Service
- **Ad Generator**: `/api/ad-generator/*` → Ad Generator Service
- **Status**: `/api/status/*` → Status Service

### Dashboard Summary
The `/api/dashboard/summary` endpoint aggregates data from multiple services to provide a unified dashboard view.

## Environment Variables

Configure microservice URLs using environment variables:

```bash
PURCHASES_SERVICE_URL=http://localhost:3001
SALES_SERVICE_URL=http://localhost:3002
INVENTORY_SERVICE_URL=http://localhost:3003
SETTINGS_SERVICE_URL=http://localhost:3004
EBAY_SERVICE_URL=http://localhost:3005
VINTED_SERVICE_URL=http://localhost:3006
EMAIL_SERVICE_URL=http://localhost:3007
REPORTING_SERVICE_URL=http://localhost:3008
MEDIA_SERVICE_URL=http://localhost:3009
ACCOUNTING_SERVICE_URL=http://localhost:3010
RULES_SERVICE_URL=http://localhost:3011
AUTO_BUYING_SERVICE_URL=http://localhost:3012
AD_GENERATOR_SERVICE_URL=http://localhost:3013
STATUS_SERVICE_URL=http://localhost:3014
```

## Development

### Running in Development Mode
```powershell
cd api-gateway
npm run dev
```

### Adding New API Endpoints
1. Add the microservice URL to the `microservices` object in `api-gateway/app.js`
2. Add a new proxy middleware for the service
3. Update the frontend API client if needed

### Frontend Modifications
- All HTML files are in the `frontend/` directory
- Global styles are in `frontend/css/stockpilot-global.css`
- API client is in `frontend/js/stockpilot-api.js`
- The API client automatically works with the microservice architecture

## Troubleshooting

### Service Unavailable Errors
If you see "Service unavailable" errors:
1. Check that the corresponding microservice is running
2. Verify the service URL in the environment variables
3. Check the API Gateway logs for connection errors

### Frontend Not Loading
1. Ensure the API Gateway is running on port 3000
2. Check that all static files are in the `frontend/` directory
3. Verify file permissions

### API Calls Failing
1. Check the browser's Network tab for failed requests
2. Verify the microservice endpoints are responding
3. Check the API Gateway logs for proxy errors

## Next Steps

1. Start individual microservices
2. Test the frontend with live microservice data
3. Customize the UI as needed
4. Add authentication/authorization if required
5. Implement real-time updates using WebSockets if needed

