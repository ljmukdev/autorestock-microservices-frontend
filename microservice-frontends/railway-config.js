/**
 * Railway Configuration for StockPilot Microservice Frontends
 * This file contains the Railway URLs for each deployed microservice
 */

// Railway service URLs - Updated with actual Railway deployment URLs
const RAILWAY_SERVICES = {
    'purchases-service': {
        name: 'Purchases Service',
        url: 'https://stockpilot-purchases-service-production.up.railway.app',
        port: 3001,
        description: 'Manages purchase data, supplier information, and purchase workflows'
    },
    'sales-service': {
        name: 'Sales Service', 
        url: 'https://beautiful-motivation-production.up.railway.app',
        port: 3002,
        description: 'Manages sales data, revenue tracking, and sales analytics'
    },
    'ebay-service': {
        name: 'eBay Service',
        url: 'https://delightful-liberation-production.up.railway.app',
        port: 3003,
        description: 'OAuth authentication and data retrieval from eBay API'
    },
    'inventory-service': {
        name: 'Inventory Service',
        url: 'https://stockpilot-inventory-service-production-production.up.railway.app',
        port: 3004,
        description: 'Manages inventory items, stock levels, and product information'
    },
    'vinted-service': {
        name: 'Vinted Service',
        url: 'https://stockpilot-vinted-service-production-production.up.railway.app',
        port: 3005,
        description: 'Web scraping and email parsing for Vinted transactions'
    },
    'media-service': {
        name: 'Media Service',
        url: 'https://stockpilot-media-service-production-production.up.railway.app',
        port: 3006,
        description: 'Handles media uploads, storage, and management'
    },
    'email-ingestion-service': {
        name: 'Email Service',
        url: 'https://stockpilot-email-ingest-service-production-production.up.railway.app',
        port: 3007,
        description: 'Email ingestion, parsing, and categorization'
    },
    'reporting-service': {
        name: 'Reporting Service',
        url: 'https://stockpilot-reporting-service-production.up.railway.app',
        port: 3008,
        description: 'Generates reports, analytics, and trend analysis'
    },
    'ad-generator-service': {
        name: 'Ad Generator Service',
        url: 'https://ad-generator-service-production-production.up.railway.app',
        port: 3009,
        description: 'Generates advertisements and marketing content'
    },
    'auto-buying-service': {
        name: 'Auto Buying Service',
        url: 'https://stockpilot-auto-buying-service-service-production.up.railway.app',
        port: 3010,
        description: 'Automated purchasing and inventory management'
    },
    'rules-engine-service': {
        name: 'Rules Engine Service',
        url: 'https://stockpilot-rules-engine-service-production-production.up.railway.app',
        port: 3011,
        description: 'Business rules engine and decision making'
    },
    'settings-service': {
        name: 'Settings Service',
        url: 'https://stockpilot-settings-service-production.up.railway.app',
        port: 3012,
        description: 'Application settings and configuration management'
    },
    'status-service': {
        name: 'Status Service',
        url: 'https://stockpilot-status-service-production-production.up.railway.app',
        port: 3013,
        description: 'System status monitoring and health checks'
    },
    'accounting-integration-service': {
        name: 'Accounting Integration Service',
        url: 'https://stockpilot-accounting-integration-service-production.up.railway.app',
        port: 3014,
        description: 'Accounting system integration and financial data management'
    }
};

/**
 * Get Railway service URL
 * @param {string} serviceName - Name of the service
 * @returns {string} Railway URL for the service
 */
function getRailwayServiceUrl(serviceName) {
    const service = RAILWAY_SERVICES[serviceName];
    if (!service) {
        console.warn(`Service ${serviceName} not found in Railway configuration`);
        return '';
    }
    return service.url;
}

/**
 * Get all Railway services
 * @returns {Object} All Railway services configuration
 */
function getAllRailwayServices() {
    return RAILWAY_SERVICES;
}

/**
 * Check if a service is configured for Railway
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if service is configured
 */
function isRailwayServiceConfigured(serviceName) {
    return serviceName in RAILWAY_SERVICES;
}

/**
 * Get service configuration
 * @param {string} serviceName - Name of the service
 * @returns {Object|null} Service configuration or null if not found
 */
function getServiceConfig(serviceName) {
    return RAILWAY_SERVICES[serviceName] || null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RAILWAY_SERVICES,
        getRailwayServiceUrl,
        getAllRailwayServices,
        isRailwayServiceConfigured,
        getServiceConfig
    };
} else {
    // Browser environment
    window.RailwayConfig = {
        RAILWAY_SERVICES,
        getRailwayServiceUrl,
        getAllRailwayServices,
        isRailwayServiceConfigured,
        getServiceConfig
    };
}
