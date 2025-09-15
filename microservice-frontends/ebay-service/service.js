/**
 * StockPilot eBay Service Frontend
 * Service-specific functionality for the eBay microservice
 */

class EbayServiceFrontend {
    constructor() {
        this.apiClient = new EbayApiClient('http://localhost:3003');
        this.currentUserId = 'test-user';
        this.oauthStatus = 'unknown';
    }

    /**
     * Initialize the eBay service frontend
     */
    init() {
        this.setupEventListeners();
        this.checkOAuthStatus();
    }

    /**
     * Setup event listeners specific to eBay service
     */
    setupEventListeners() {
        // OAuth events
        const startOAuthBtn = document.getElementById('start-oauth');
        const refreshTokenBtn = document.getElementById('refresh-token');
        
        if (startOAuthBtn) {
            startOAuthBtn.addEventListener('click', () => this.startOAuthLogin());
        }
        
        if (refreshTokenBtn) {
            refreshTokenBtn.addEventListener('click', () => this.refreshOAuthToken());
        }

        // Data fetching events
        const fetchSalesBtn = document.getElementById('fetch-sales');
        const fetchPurchasesBtn = document.getElementById('fetch-purchases');
        const fetchInventoryBtn = document.getElementById('fetch-inventory');
        
        if (fetchSalesBtn) {
            fetchSalesBtn.addEventListener('click', () => this.fetchEbayData('sales'));
        }
        
        if (fetchPurchasesBtn) {
            fetchPurchasesBtn.addEventListener('click', () => this.fetchEbayData('purchases'));
        }
        
        if (fetchInventoryBtn) {
            fetchInventoryBtn.addEventListener('click', () => this.fetchEbayData('inventory'));
        }

        // User ID input
        const userIdInput = document.getElementById('user-id-input');
        if (userIdInput) {
            userIdInput.addEventListener('change', (e) => {
                this.currentUserId = e.target.value;
            });
        }

        // API test endpoint
        const testBtn = document.getElementById('test-endpoint');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testSelectedEndpoint());
        }
    }

    /**
     * Start OAuth login process
     */
    async startOAuthLogin() {
        try {
            microserviceUtils.log('Starting eBay OAuth login...', 'info');
            
            const response = await this.apiClient.startOAuthLogin();
            
            if (response.ok) {
                // OAuth typically redirects to eBay, so we'll show a message
                microserviceUtils.log('OAuth login initiated. Please complete authentication on eBay.', 'info');
                alert('OAuth login initiated. Please complete authentication on eBay.');
            } else {
                throw new Error(response.data.error || 'Failed to start OAuth login');
            }
        } catch (error) {
            microserviceUtils.log('Error starting OAuth login: ' + error.message, 'error');
            alert('Error starting OAuth login: ' + error.message);
        }
    }

    /**
     * Refresh OAuth token
     */
    async refreshOAuthToken() {
        try {
            microserviceUtils.log('Refreshing OAuth token...', 'info');
            
            const response = await this.apiClient.refreshOAuthToken();
            
            if (response.ok) {
                microserviceUtils.log('OAuth token refreshed successfully', 'info');
                this.checkOAuthStatus();
                alert('OAuth token refreshed successfully!');
            } else {
                throw new Error(response.data.error || 'Failed to refresh OAuth token');
            }
        } catch (error) {
            microserviceUtils.log('Error refreshing OAuth token: ' + error.message, 'error');
            alert('Error refreshing OAuth token: ' + error.message);
        }
    }

    /**
     * Check OAuth status
     */
    async checkOAuthStatus() {
        try {
            // This would typically check if we have a valid token
            // For demo purposes, we'll simulate the status
            this.oauthStatus = 'authenticated';
            this.updateOAuthStatus();
        } catch (error) {
            this.oauthStatus = 'unauthenticated';
            this.updateOAuthStatus();
        }
    }

    /**
     * Update OAuth status display
     */
    updateOAuthStatus() {
        const authStatus = document.getElementById('auth-status');
        const tokenExpires = document.getElementById('token-expires');
        const userId = document.getElementById('user-id');

        if (authStatus) {
            authStatus.textContent = this.oauthStatus;
            authStatus.className = `status-value ${this.oauthStatus === 'authenticated' ? 'success' : 'error'}`;
        }

        if (tokenExpires) {
            tokenExpires.textContent = this.oauthStatus === 'authenticated' ? 'In 1 hour' : 'N/A';
        }

        if (userId) {
            userId.textContent = this.currentUserId;
        }
    }

    /**
     * Fetch eBay data
     */
    async fetchEbayData(dataType) {
        const dataResults = document.getElementById('data-results');
        if (!dataResults) return;

        try {
            dataResults.innerHTML = '<div class="loading">Fetching eBay data...</div>';

            let response;
            switch (dataType) {
                case 'sales':
                    response = await this.apiClient.getEbaySales(this.currentUserId);
                    break;
                case 'purchases':
                    response = await this.apiClient.getEbayPurchases(this.currentUserId);
                    break;
                case 'inventory':
                    response = await this.apiClient.getEbayInventory(this.currentUserId);
                    break;
                default:
                    throw new Error('Unknown data type: ' + dataType);
            }

            if (response.ok) {
                this.displayEbayData(dataType, response.data);
                microserviceUtils.log(`Fetched eBay ${dataType} data`, 'info');
            } else {
                throw new Error(response.data.error || `Failed to fetch eBay ${dataType} data`);
            }
        } catch (error) {
            dataResults.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error fetching eBay ${dataType} data: ${error.message}</p>
                    <button class="btn btn-primary" onclick="ebayService.fetchEbayData('${dataType}')">
                        <i class="fas fa-retry"></i> Retry
                    </button>
                </div>
            `;
            microserviceUtils.log(`Error fetching eBay ${dataType} data: ` + error.message, 'error');
        }
    }

    /**
     * Display eBay data
     */
    displayEbayData(dataType, data) {
        const dataResults = document.getElementById('data-results');
        if (!dataResults) return;

        if (!data || (Array.isArray(data) && data.length === 0)) {
            dataResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-database"></i>
                    <p>No ${dataType} data found</p>
                </div>
            `;
            return;
        }

        const items = Array.isArray(data) ? data : [data];
        
        dataResults.innerHTML = `
            <div class="data-header">
                <h4>eBay ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data</h4>
                <span class="data-count">${items.length} items</span>
            </div>
            <div class="data-list">
                ${items.map(item => `
                    <div class="data-item">
                        <div class="data-content">
                            <h5>${item.title || item.product_name || 'Unknown Item'}</h5>
                            <div class="data-details">
                                <span class="data-price">£${(item.price || item.amount || 0).toFixed(2)}</span>
                                <span class="data-status">${item.status || 'Unknown'}</span>
                                <span class="data-date">${this.formatDate(item.date || item.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Test selected endpoint
     */
    async testSelectedEndpoint() {
        const selector = document.getElementById('endpoint-select');
        if (!selector || !selector.value) {
            alert('Please select an endpoint to test');
            return;
        }

        const [method, path] = selector.value.split(':');
        let testPath = path;

        // Handle dynamic paths
        if (path.includes(':userId')) {
            testPath = path.replace(':userId', this.currentUserId);
        }

        try {
            let response;
            switch (method) {
                case 'GET':
                    if (path.includes('oauth/login')) {
                        response = await this.apiClient.startOAuthLogin();
                    } else if (path.includes('sales')) {
                        response = await this.apiClient.getEbaySales(this.currentUserId);
                    } else if (path.includes('purchases')) {
                        response = await this.apiClient.getEbayPurchases(this.currentUserId);
                    } else if (path.includes('fees')) {
                        response = await this.apiClient.getEbayFees(this.currentUserId);
                    } else if (path.includes('inventory')) {
                        response = await this.apiClient.getEbayInventory(this.currentUserId);
                    } else if (path.includes('account-summary')) {
                        response = await this.apiClient.getEbayAccountSummary(this.currentUserId);
                    } else if (path.includes('profile')) {
                        response = await this.apiClient.getEbayProfile(this.currentUserId);
                    } else {
                        response = await this.apiClient.get(testPath);
                    }
                    break;
                case 'POST':
                    if (path.includes('oauth/refresh')) {
                        response = await this.apiClient.refreshOAuthToken();
                    } else {
                        response = await this.apiClient.post(testPath);
                    }
                    break;
                default:
                    throw new Error('Unsupported method: ' + method);
            }

            this.addTestResult({
                method,
                path: testPath,
                status: response.status,
                statusText: response.statusText,
                responseTime: 0,
                data: response.data,
                success: response.ok
            });

        } catch (error) {
            this.addTestResult({
                method,
                path: testPath,
                status: 0,
                statusText: 'Network Error',
                responseTime: 0,
                data: error.message,
                success: false
            });
        }
    }

    /**
     * Add test result (reuse from utils)
     */
    addTestResult(result) {
        microserviceUtils.addTestResult(result);
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    }

    /**
     * Override the default endpoints for this service
     */
    getDefaultEndpoints() {
        return [
            { method: 'GET', path: '/health' },
            { method: 'GET', path: '/' },
            { method: 'GET', path: '/oauth/login' },
            { method: 'GET', path: '/oauth/callback' },
            { method: 'POST', path: '/oauth/refresh' },
            { method: 'GET', path: '/api/ebay/:userId/sales' },
            { method: 'GET', path: '/api/ebay/:userId/purchases' },
            { method: 'GET', path: '/api/ebay/:userId/fees' },
            { method: 'GET', path: '/api/ebay/:userId/postage' },
            { method: 'GET', path: '/api/ebay/:userId/inventory' },
            { method: 'GET', path: '/api/ebay/:userId/account-summary' },
            { method: 'GET', path: '/api/ebay/:userId/profile' }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ebayService = new EbayServiceFrontend();
    window.ebayService.init();
    
    // Override the default endpoints in utils
    if (window.microserviceUtils) {
        window.microserviceUtils.getDefaultEndpoints = () => window.ebayService.getDefaultEndpoints();
    }
});
