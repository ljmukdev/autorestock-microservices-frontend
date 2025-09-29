# AutoRestock Microservice Testing Dashboard

A clean, standalone repository for testing AutoRestock microservices.

## 🚀 Quick Start

This repository contains testing interfaces for all AutoRestock microservices.

### Features

- **Dashboard**: Central testing interface for all microservices
- **Individual Tests**: Dedicated test pages for each microservice
- **Health Monitoring**: Service status and connectivity testing

### Available Services

- **Core Services**: Settings, Inventory, Sales, Purchases
- **Integration Services**: eBay, Vinted, Email Ingestion
- **Support Services**: Reporting, Accounting, Media, Rules Engine
- **Automation Services**: Auto-buying, Ad Generator, Status

### Deployment

This repository is configured for Railway deployment with:

- **Health Check**: `/health` endpoint
- **Auto-restart**: On failure with retry policy
- **CORS Enabled**: For cross-origin requests

### Usage

1. **Main Dashboard**: Access the central testing interface
2. **Service Tests**: Use `/test/{service-name}` for specific service testing
3. **Health Check**: Monitor service status via `/health`

### Railway Configuration

- **Start Command**: `npm start`
- **Health Check Path**: `/health`
- **Port**: Auto-assigned by Railway

## 🔧 Development

```bash
npm install
npm start
```

## 📊 Testing

Each microservice has its own dedicated test interface accessible at:
- `/test/ebay` - eBay service testing
- `/test/purchases` - Purchase service testing
- `/test/sales` - Sales service testing
- And more...

## 🎯 Purpose

This repository provides a clean, focused testing environment for AutoRestock microservices without the complexity of the main application structure.