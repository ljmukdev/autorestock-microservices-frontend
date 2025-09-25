# AutoRestock Microservice Frontends

This directory contains individual frontend interfaces for each microservice in the AutoRestock system. These frontends allow you to test, debug, and monitor each microservice independently before integrating them into the main application.

## 🚀 Quick Start

### For Railway Deployment (Recommended)

1. **Update Railway URLs:**
   ```bash
   # Edit railway-config.js with your actual Railway service URLs
   nano microservice-frontends/railway-config.js
   ```

2. **Launch the main launcher:**
   ```bash
   # Open the launcher in your browser
   open microservice-frontends/launcher.html
   ```

3. **Check service health:**
   - Click "Status" buttons to verify Railway services are online
   - Services should show green indicators if healthy

### For Local Development

1. **Launch the main launcher:**
   ```bash
   # Open the launcher in your browser
   open microservice-frontends/launcher.html
   ```

2. **Or launch a specific service:**
   ```bash
   # Open a specific service frontend
   open microservice-frontends/purchases-service/index.html
   ```

## 📁 Directory Structure

```
microservice-frontends/
├── launcher.html              # Main launcher interface
├── railway-config.js          # Railway service URLs configuration
├── RAILWAY_DEPLOYMENT.md      # Railway deployment guide
├── README.md                  # This documentation
├── shared/                    # Shared components
│   ├── template.html         # Base template for all services
│   ├── styles.css            # Shared CSS styles
│   ├── utils.js              # Common utility functions
│   └── api-client.js         # API client classes
├── purchases-service/         # Purchases service frontend
│   ├── index.html
│   ├── service.js
│   └── styles.css
├── sales-service/            # Sales service frontend
│   ├── index.html
│   └── service.js
├── ebay-service/             # eBay service frontend
│   ├── index.html
│   └── service.js
└── [other-services]/         # Additional service frontends
```

## 🎯 Available Services

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| **Purchases Service** | 3001 | Manages purchase data and supplier information | ✅ Complete |
| **Sales Service** | 3002 | Handles sales data and revenue tracking | ✅ Complete |
| **eBay Service** | 3003 | OAuth authentication and eBay API integration | ✅ Complete |
| **Inventory Service** | 3004 | Manages inventory items and stock levels | 🚧 In Progress |
| **Vinted Service** | 3005 | Web scraping and email parsing for Vinted | 🚧 In Progress |
| **Media Service** | 3006 | Handles media uploads and storage | 🚧 In Progress |
| **Email Service** | 3007 | Email ingestion and categorization | 🚧 In Progress |
| **Reporting Service** | 3008 | Generates reports and analytics | 🚧 In Progress |

## 🛠️ Features

Each microservice frontend includes:

### 📊 Overview Dashboard
- **Health Status**: Real-time service health monitoring
- **Available Endpoints**: List of all API endpoints
- **Quick Stats**: Uptime, memory usage, and service metrics

### 🔧 Service-Specific Functionality
- **Purchases Service**: CRUD operations, filtering, pagination
- **Sales Service**: Sales management and analytics
- **eBay Service**: OAuth authentication, data retrieval
- **Other Services**: Tailored interfaces for each service

### 🧪 API Testing Tools
- **Endpoint Testing**: Test any API endpoint with different methods
- **Request/Response Viewing**: See full request and response data
- **Error Handling**: Clear error messages and debugging info

### 📝 Real-time Logs
- **Service Logs**: View service logs in real-time
- **Log Filtering**: Filter by log level (debug, info, warn, error)
- **Log Management**: Clear logs and refresh functionality

### ⚙️ Configuration Settings
- **Service URL**: Configure the service endpoint
- **Auto-refresh**: Set refresh intervals
- **Log Level**: Control logging verbosity

## 🚀 Usage

### 1. Using the Launcher

The `launcher.html` provides a central interface to:
- View all available services
- Check service health status
- Launch individual service frontends
- Perform bulk operations

### 2. Direct Service Access

Each service can be accessed directly:
```bash
# Purchases Service
http://localhost:3001 (backend)
file:///path/to/microservice-frontends/purchases-service/index.html (frontend)

# Sales Service  
http://localhost:3002 (backend)
file:///path/to/microservice-frontends/sales-service/index.html (frontend)
```

### 3. API Testing

Each frontend includes comprehensive API testing:
1. Select an endpoint from the dropdown
2. Click "Test" to execute the request
3. View the response in the results panel
4. Clear results or test multiple endpoints

## 🔧 Development

### Adding a New Service Frontend

1. **Create service directory:**
   ```bash
   mkdir microservice-frontends/new-service
   ```

2. **Copy template files:**
   ```bash
   cp shared/template.html new-service/index.html
   cp shared/service-template.js new-service/service.js
   ```

3. **Customize the service:**
   - Update service name, description, and port
   - Add service-specific endpoints
   - Implement service-specific functionality
   - Add custom styling if needed

4. **Update the launcher:**
   - Add service card to `launcher.html`
   - Update service configuration in JavaScript

### Shared Components

#### `shared/utils.js`
Common utility functions for all services:
- Tab navigation
- Health checking
- Settings management
- Logging functionality

#### `shared/api-client.js`
API client classes for each service:
- `PurchasesApiClient`
- `SalesApiClient`
- `EbayApiClient`
- `VintedApiClient`
- And more...

#### `shared/styles.css`
Shared CSS styles and components:
- Responsive design
- Modern UI components
- Consistent styling
- Dark/light theme support

## 🐛 Troubleshooting

### Service Not Responding
1. Check if the microservice is running
2. Verify the correct port number
3. Check service health endpoint: `http://localhost:PORT/health`

### CORS Issues
- Ensure microservices have CORS enabled
- Check browser console for CORS errors
- Verify service URLs are correct

### API Testing Failures
1. Check service is running and healthy
2. Verify endpoint paths are correct
3. Check request/response format
4. Review service logs for errors

## 📚 API Endpoints

### Common Endpoints (All Services)
- `GET /health` - Service health check
- `GET /ping` - Simple ping endpoint
- `GET /` - Service information

### Service-Specific Endpoints

#### Purchases Service (Port 3001)
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Create purchase
- `GET /api/purchases/:id` - Get purchase by ID
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

#### Sales Service (Port 3002)
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale by ID
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

#### eBay Service (Port 3003)
- `GET /oauth/login` - Start OAuth flow
- `POST /oauth/refresh` - Refresh token
- `GET /api/ebay/:userId/sales` - Get eBay sales
- `GET /api/ebay/:userId/purchases` - Get eBay purchases
- `GET /api/ebay/:userId/inventory` - Get eBay inventory

## 🤝 Contributing

1. Follow the existing code structure
2. Use the shared components when possible
3. Add comprehensive error handling
4. Include proper logging
5. Test all functionality thoroughly
6. Update documentation

## 📄 License

This project is part of the AutoRestock system. See the main project README for license information.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Check the main AutoRestock documentation
4. Create an issue in the project repository
# Force redeploy

# Force redeploy 09/15/2025 17:56:01
