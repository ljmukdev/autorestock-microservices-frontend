# StockPilot - Microservice Architecture

A comprehensive inventory management system built with a microservice architecture, designed for reselling and e-commerce operations.

## 🏗️ Architecture Overview

StockPilot is built as a collection of microservices, each handling specific business domains:

### Core Services
- **Purchases Service** - Manage purchase records and inventory intake
- **Sales Service** - Handle sales transactions and revenue tracking
- **Inventory Service** - Track stock levels and item management
- **Settings Service** - Application configuration and user preferences

### Integration Services
- **eBay Service** - eBay API integration and automation
- **Vinted Service** - Vinted platform integration
- **Email Service** - Email parsing and data ingestion

### Support Services
- **Reporting Service** - Analytics and business intelligence
- **Media Service** - Image and file management
- **Accounting Service** - Financial reporting and bookkeeping
- **Rules Engine** - Business logic and automation rules
- **Auto-buying Service** - Automated purchasing decisions
- **Ad Generator Service** - Marketing content creation
- **Status Service** - System health monitoring

### Frontend & Gateway
- **API Gateway** - Single entry point for all frontend requests
- **Frontend** - React-based web application

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (or Railway MongoDB)
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd stockpilot
   ```

2. **Start the API Gateway and Frontend:**
   ```powershell
   .\start-frontend.ps1
   ```

3. **Start individual microservices:**
   ```bash
   # Each service can be started independently
   cd microservices/purchases-service
   npm install
   npm start
   ```

### Production Deployment

This project is configured for Railway deployment. Each microservice can be deployed independently.

## 📁 Project Structure

```
stockpilot/
├── api-gateway/                 # API Gateway and Frontend Server
├── frontend/                    # Frontend Application
├── microservices/              # Individual Microservices
│   ├── purchases-service/
│   ├── sales-service/
│   ├── inventory-service/
│   ├── settings-service/
│   ├── ebay-service/
│   ├── vinted-service/
│   ├── email-ingestion-service/
│   ├── reporting-service/
│   ├── media-service/
│   ├── accounting-integration-service/
│   ├── rules-engine-service/
│   ├── auto-buying-service/
│   ├── ad-generator-service/
│   └── status-service/
├── shared/                      # Shared utilities and types
└── docs/                       # Documentation
```

## 🔧 Configuration

### Environment Variables

Each service uses environment variables for configuration. See individual service READMEs for specific requirements.

Common variables:
- `PORT` - Service port (default varies by service)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

### Railway Configuration

Each service includes a `railway.json` configuration file for deployment.

## 🧪 Testing

```bash
# Run tests for a specific service
cd microservices/purchases-service
npm test

# Run all tests
npm run test:all
```

## 📊 Monitoring

- **Health Checks**: Each service exposes `/health` endpoint
- **Status Service**: Centralized monitoring and alerting
- **Logging**: Structured logging across all services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `docs/` folder
- Review individual service READMEs

## 🔄 Deployment Status

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

---

**StockPilot** - Streamlining your reselling business with intelligent automation.

# Navigation fix 09/25/2025 14:59:01
# CSP fix 09/25/2025 15:01:20
