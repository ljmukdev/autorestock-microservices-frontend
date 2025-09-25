/**
 * AutoRestock Core Configuration
 * Environment settings, service URLs, and feature flags
 */

// Service base URLs
export const EBAY_SERVICE_BASE = localStorage.getItem('STOCKPILOT_EBAY_SERVICE_BASE') || 
  'https://stockpilot-ebay-service-production.up.railway.app';

// Runtime flags from query params or localStorage
const urlParams = new URLSearchParams(window.location.search);
export const FORCE_LIVE = urlParams.get('live') === '1' || 
  localStorage.getItem('STOCKPILOT_FORCE_LIVE') === '1';
export const USE_SAMPLE = urlParams.get('sample') === '1' || 
  localStorage.getItem('STOCKPILOT_SAMPLE_MODE') === '1';

// API endpoints
export const API_ENDPOINTS = {
  PURCHASES: `${EBAY_SERVICE_BASE}/ljmukdev/purchases`,
  INVENTORY: '/api/inventory',
  SALES: '/api/sales',
  AUTH: 'https://stockpilot-ebay-oauth-production.up.railway.app/ebay-oauth/login'
};

// Default request options
export const DEFAULT_REQUEST_OPTIONS = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// Sample data configuration
export const SAMPLE_CONFIG = {
  PURCHASES_LIMIT: 5,
  INVENTORY_LIMIT: 10,
  SALES_LIMIT: 8
};

// Feature flags
export const FEATURES = {
  ENABLE_OAUTH: true,
  ENABLE_SAMPLE_MODE: true,
  ENABLE_DEBUG_LOGGING: urlParams.get('debug') === '1'
};

// Debug logging helper
export function debugLog(message, data = null) {
  if (FEATURES.ENABLE_DEBUG_LOGGING) {
    console.log(`[AutoRestock] ${message}`, data || '');
  }
}

// Configuration validation
export function validateConfig() {
  const issues = [];
  
  if (!EBAY_SERVICE_BASE.startsWith('http')) {
    issues.push('EBAY_SERVICE_BASE must be a valid URL');
  }
  
  if (FORCE_LIVE && USE_SAMPLE) {
    issues.push('Cannot force live mode and use sample mode simultaneously');
  }
  
  if (issues.length > 0) {
    console.warn('Configuration issues:', issues);
  }
  
  return issues.length === 0;
}

// Initialize configuration
debugLog('Configuration loaded', {
  EBAY_SERVICE_BASE,
  FORCE_LIVE,
  USE_SAMPLE,
  FEATURES
});

debugLog('PURCHASES endpoint:', API_ENDPOINTS.PURCHASES);

validateConfig();