/**
 * File: autorestock-api.js
 * Location: frontend/js/autorestock-api.js
 * Purpose: JavaScript API client for AutoRestock frontend communication with backend
 * Description: Provides methods for all API endpoints including settings, eBay integration, 
 *              database operations, purchases, sales, inventory, and reports
 * Author: AutoRestock Development Team
 * Created: July 16, 2025
 * Last Modified: July 16, 2025
 */

// AutoRestock API Client Class
class AutoRestockAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        console.log('📡 AutoRestock API initialized with base URL:', baseURL || 'relative');
    }

    /**
     * Generic API request method
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Request options (method, body, headers)
     * @returns {Promise} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: { ...this.headers, ...options.headers },
            ...options
        };

        // Remove body from config object but keep it for JSON.stringify
        const { body, ...fetchConfig } = config;
        
        if (config.method !== 'GET' && body) {
            fetchConfig.body = JSON.stringify(body);
        }

        try {
            console.log(`🔄 API Request: ${config.method} ${url}`);
            const response = await fetch(url, fetchConfig);
            
            console.log(`📡 API Response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📦 API Data:', data);
            return data;
        } catch (error) {
            console.error(`❌ API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // ===== DATABASE API METHODS =====
    
    /**
     * Get database statistics and table information
     * @returns {Promise} Database stats including table counts and sizes
     */
    async getDatabaseStats() {
        return this.request('/api/settings/database/stats');
    }

    /**
     * Clear all data from a specific table
     * @param {string} tableName - Name of table to clear
     * @returns {Promise} Operation result
     */
    async clearTable(tableName) {
        return this.request('/api/settings/database/clear-table', {
            method: 'POST',
            body: { tableName }
        });
    }

    // ===== EBAY API METHODS =====
    
    /**
     * Test eBay API connection and credentials
     * @returns {Promise} Connection test result
     */
    async testEbayConnection() {
        return this.request('/api/settings/ebay/test');
    }

    /**
     * Start eBay OAuth authentication flow
     * @returns {Promise} OAuth URL and instructions
     */
    async startEbayOAuth() {
        return this.request('/api/settings/ebay/oauth/start', {
            method: 'POST'
        });
    }

    /**
     * Get current eBay user profile information
     * @returns {Promise} User profile data
     */
    async getEbayProfile() {
        return this.request('/api/settings/ebay/profile');
    }

    /**
     * Sync data from eBay API
     * @returns {Promise} Sync operation result
     */
    async syncEbayData() {
        return this.request('/api/settings/ebay/sync', {
            method: 'POST'
        });
    }

    /**
     * Clear eBay authentication tokens
     * @returns {Promise} Clear operation result
     */
    async clearEbayAuth() {
        return this.request('/api/settings/ebay/auth', {
            method: 'DELETE'
        });
    }

    // ===== GENERAL SETTINGS =====
    
    /**
     * Get application configuration
     * @returns {Promise} Current app configuration
     */
    async getConfig() {
        return this.request('/api/settings/config');
    }

    // ===== PURCHASES API =====
    
    /**
     * Get all purchases
     * @returns {Promise} List of purchases
     */
    async getPurchases() {
        return this.request('/api/purchases');
    }

    /**
     * Add a new purchase
     * @param {Object} purchase - Purchase data
     * @returns {Promise} Created purchase
     */
    async addPurchase(purchase) {
        return this.request('/api/purchases', {
            method: 'POST',
            body: purchase
        });
    }

    /**
     * Update an existing purchase
     * @param {string} id - Purchase ID
     * @param {Object} purchase - Updated purchase data
     * @returns {Promise} Updated purchase
     */
    async updatePurchase(id, purchase) {
        return this.request(`/api/purchases/${id}`, {
            method: 'PUT',
            body: purchase
        });
    }

    /**
     * Delete a purchase
     * @param {string} id - Purchase ID
     * @returns {Promise} Deletion result
     */
    async deletePurchase(id) {
        return this.request(`/api/purchases/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== SALES API =====
    
    /**
     * Get all sales
     * @returns {Promise} List of sales
     */
    async getSales() {
        return this.request('/api/sales');
    }

    /**
     * Add a new sale
     * @param {Object} sale - Sale data
     * @returns {Promise} Created sale
     */
    async addSale(sale) {
        return this.request('/api/sales', {
            method: 'POST',
            body: sale
        });
    }

    /**
     * Update an existing sale
     * @param {string} id - Sale ID
     * @param {Object} sale - Updated sale data
     * @returns {Promise} Updated sale
     */
    async updateSale(id, sale) {
        return this.request(`/api/sales/${id}`, {
            method: 'PUT',
            body: sale
        });
    }

    /**
     * Delete a sale
     * @param {string} id - Sale ID
     * @returns {Promise} Deletion result
     */
    async deleteSale(id) {
        return this.request(`/api/sales/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== INVENTORY API =====
    
    /**
     * Get all inventory items
     * @returns {Promise} List of inventory items
     */
    async getInventory() {
        return this.request('/api/inventory');
    }

    /**
     * Add a new inventory item
     * @param {Object} item - Inventory item data
     * @returns {Promise} Created inventory item
     */
    async addInventoryItem(item) {
        return this.request('/api/inventory', {
            method: 'POST',
            body: item
        });
    }

    /**
     * Update an existing inventory item
     * @param {string} id - Inventory item ID
     * @param {Object} item - Updated item data
     * @returns {Promise} Updated inventory item
     */
    async updateInventoryItem(id, item) {
        return this.request(`/api/inventory/${id}`, {
            method: 'PUT',
            body: item
        });
    }

    /**
     * Delete an inventory item
     * @param {string} id - Inventory item ID
     * @returns {Promise} Deletion result
     */
    async deleteInventoryItem(id) {
        return this.request(`/api/inventory/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== CONSUMABLES API =====
    
    /**
     * Get all consumables
     * @returns {Promise} List of consumables
     */
    async getConsumables() {
        return this.request('/api/consumables');
    }

    /**
     * Add a new consumable
     * @param {Object} consumable - Consumable data
     * @returns {Promise} Created consumable
     */
    async addConsumable(consumable) {
        return this.request('/api/consumables', {
            method: 'POST',
            body: consumable
        });
    }

    /**
     * Update an existing consumable
     * @param {string} id - Consumable ID
     * @param {Object} consumable - Updated consumable data
     * @returns {Promise} Updated consumable
     */
    async updateConsumable(id, consumable) {
        return this.request(`/api/consumables/${id}`, {
            method: 'PUT',
            body: consumable
        });
    }

    /**
     * Delete a consumable
     * @param {string} id - Consumable ID
     * @returns {Promise} Deletion result
     */
    async deleteConsumable(id) {
        return this.request(`/api/consumables/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== REPORTS API =====
    
    /**
     * Get available reports
     * @returns {Promise} List of available reports
     */
    async getReports() {
        return this.request('/api/reports');
    }

    /**
     * Get profit and loss report
     * @param {Object} dateRange - Date range filter
     * @returns {Promise} P&L report data
     */
    async getProfitLossReport(dateRange) {
        return this.request(`/api/reports/profit-loss?${new URLSearchParams(dateRange)}`);
    }

    /**
     * Get sales performance report
     * @param {Object} filters - Report filters
     * @returns {Promise} Sales performance data
     */
    async getSalesReport(filters) {
        return this.request(`/api/reports/sales?${new URLSearchParams(filters)}`);
    }

    /**
     * Get inventory report
     * @param {Object} filters - Report filters
     * @returns {Promise} Inventory report data
     */
    async getInventoryReport(filters) {
        return this.request(`/api/reports/inventory?${new URLSearchParams(filters)}`);
    }

    // ===== EMAIL IMPORT API =====
    
    /**
     * Import data from email
     * @param {Object} emailData - Email import configuration
     * @returns {Promise} Import result
     */
    async importFromEmail(emailData) {
        return this.request('/api/email-import', {
            method: 'POST',
            body: emailData
        });
    }

    /**
     * Get email import status
     * @returns {Promise} Current import status
     */
    async getEmailImportStatus() {
        return this.request('/api/email-import/status');
    }

    /**
     * Get email import history
     * @returns {Promise} Import history data
     */
    async getEmailImportHistory() {
        return this.request('/api/email-import/history');
    }

    // ===== EBAY SPECIFIC METHODS =====
    
    /**
     * Get eBay orders (purchases)
     * @param {number} limit - Number of orders to retrieve
     * @returns {Promise} eBay purchase orders
     */
    async getEbayOrders(limit = 10) {
        return this.request(`https://delightful-liberation-production.up.railway.app/purchases?limit=${limit}`);
    }

    /**
     * Get eBay orders for purchases (alias)
     * @param {number} limit - Number of orders to retrieve
     * @returns {Promise} eBay purchase orders
     */
    async getEbayOrdersForPurchases(limit = 10) {
        return this.getEbayOrders(limit);
    }

    /**
     * Get eBay sales data
     * @param {number} limit - Number of sales to retrieve
     * @returns {Promise} eBay sales data
     */
    async getEbaySales(limit = 10) {
        return this.request(`https://delightful-liberation-production.up.railway.app/sales?limit=${limit}`);
    }

    /**
     * Get eBay account summary
     * @returns {Promise} eBay account data
     */
    async getEbayAccountSummary() {
        return this.request('https://delightful-liberation-production.up.railway.app/health');
    }

    /**
     * Test eBay service connection
     * @returns {Promise} eBay service test result
     */
    async testEbayService() {
        return this.request('https://delightful-liberation-production.up.railway.app/health');
    }

    // ===== UTILITY METHODS =====
    
    /**
     * Health check endpoint
     * @returns {Promise} Server health status
     */
    async healthCheck() {
        return this.request('/api/health');
    }

    /**
     * Get server status
     * @returns {Promise} Server status information
     */
    async getServerStatus() {
        return this.request('/api/status');
    }

    /**
     * Format currency value
     * @param {number} value - Numeric value
     * @param {string} currency - Currency code (default: GBP)
     * @returns {string} Formatted currency string
     */
    formatCurrency(value, currency = 'GBP') {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency
        }).format(value);
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format date and time for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date and time string
     */
    formatDateTime(date) {
        return new Date(date).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate phone number (UK format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid phone number
     */
    validatePhone(phone) {
        const re = /^(\+44|0)[1-9]\d{8,9}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    /**
     * Calculate percentage
     * @param {number} value - Value
     * @param {number} total - Total
     * @returns {number} Percentage
     */
    calculatePercentage(value, total) {
        return total > 0 ? (value / total) * 100 : 0;
    }

    /**
     * Generate random ID
     * @returns {string} Random ID
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} Is empty
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    /**
     * Get query parameter from URL
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value
     */
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Set query parameter in URL
     * @param {string} param - Parameter name
     * @param {string} value - Parameter value
     */
    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    }

    /**
     * Show loading indicator
     * @param {string} elementId - Element ID to show loading in
     */
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    }

    /**
     * Hide loading indicator
     * @param {string} elementId - Element ID to hide loading from
     */
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const loading = element.querySelector('.loading');
            if (loading) {
                loading.remove();
            }
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {string} elementId - Element ID to show error in
     */
    showError(message, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    /**
     * Clear cache (placeholder for future implementation)
     */
    clearCache() {
        console.log('🗑️ Cache cleared');
    }
}

// Create global instance
const autorestockAPI = new AutoRestockAPI();

// Make API available globally
window.autorestockAPI = autorestockAPI;

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AutoRestockAPI, autorestockAPI };
}

// Initialize API when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AutoRestock API ready');
    console.log('📡 Available methods:', Object.getOwnPropertyNames(AutoRestockAPI.prototype).filter(name => name !== 'constructor'));
});

// Debug helper
window.debugAutoRestockAPI = function() {
    console.log('🔍 AutoRestock API Debug Info:');
    console.log('- API Instance:', autorestockAPI);
    console.log('- Available Methods:', Object.getOwnPropertyNames(AutoRestockAPI.prototype).filter(name => name !== 'constructor'));
    console.log('- Base URL:', autorestockAPI.baseURL);
    console.log('- Headers:', autorestockAPI.headers);
};