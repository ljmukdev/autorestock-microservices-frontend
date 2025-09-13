/**
 * OAuth API Wrapper for StockPilot
 * Automatically handles OAuth redirects for eBay API calls
 */

class OAuthApiWrapper {
    constructor() {
        this.baseUrl = 'https://stockpilot-ebay-oauth-production.up.railway.app';
        this.oauthHandler = window.oauthHandler;
        this.pendingRequests = new Map();
    }

    /**
     * Make an API request with automatic OAuth handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @param {Object} oauthOptions - OAuth-specific options
     * @returns {Promise} API response
     */
    async request(endpoint, options = {}, oauthOptions = {}) {
        const {
            showOAuthModal = true,
            autoRedirect = true,
            retryOnAuth = true,
            maxRetries = 1
        } = oauthOptions;

        const requestId = this.generateRequestId();
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            const data = await response.json();

            // Check if OAuth is required
            if (data.oauth_required || data.redirect_required) {
                if (showOAuthModal && !this.oauthHandler.isAuthenticating) {
                    this.showOAuthModal(data, requestId);
                }

                // Return OAuth required response
                return {
                    success: false,
                    oauth_required: true,
                    oauth_url: data.oauth_url,
                    message: data.message,
                    error: data.error,
                    data: null
                };
            }

            // Return successful response
            return {
                success: true,
                oauth_required: false,
                data: data,
                response: response
            };

        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                oauth_required: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Show OAuth modal with context
     */
    showOAuthModal(apiResponse, requestId) {
        const message = this.getOAuthMessage(apiResponse);
        
        this.oauthHandler.showOAuthModal({
            title: 'eBay Authentication Required',
            message: message,
            showAutoRedirect: true
        });

        // Store pending request
        this.pendingRequests.set(requestId, {
            endpoint: apiResponse.endpoint,
            options: apiResponse.options,
            timestamp: Date.now()
        });

        // Listen for OAuth success to retry request
        document.addEventListener('oauthSuccess', (event) => {
            this.retryPendingRequest(requestId);
        });
    }

    /**
     * Get appropriate OAuth message
     */
    getOAuthMessage(apiResponse) {
        if (apiResponse.error === 'Token expired') {
            return 'Your eBay authentication has expired. Please re-authenticate to continue syncing your purchase data.';
        } else if (apiResponse.error === 'No tokens found') {
            return 'eBay authentication is required to sync your purchase data. Please authenticate with your eBay account to continue.';
        } else {
            return 'Your eBay authentication is required to continue. Please re-authenticate to access your purchase data.';
        }
    }

    /**
     * Retry pending request after OAuth success
     */
    async retryPendingRequest(requestId) {
        const pendingRequest = this.pendingRequests.get(requestId);
        if (!pendingRequest) return;

        // Wait a moment for tokens to be processed
        setTimeout(async () => {
            try {
                const result = await this.request(
                    pendingRequest.endpoint,
                    pendingRequest.options,
                    { showOAuthModal: false, retryOnAuth: false }
                );

                if (result.success) {
                    // Dispatch success event with data
                    const event = new CustomEvent('apiRequestSuccess', {
                        detail: { requestId, data: result.data }
                    });
                    document.dispatchEvent(event);
                }

                // Clean up
                this.pendingRequests.delete(requestId);
            } catch (error) {
                console.error('Retry request failed:', error);
                this.pendingRequests.delete(requestId);
            }
        }, 2000);
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get eBay purchases with OAuth handling
     */
    async getPurchases(options = {}) {
        const { limit = 50, offset = 0, startDate, endDate } = options;
        let endpoint = `/api/ebay/default_user/purchases?limit=${limit}&offset=${offset}`;
        
        if (startDate) endpoint += `&startDate=${startDate}`;
        if (endDate) endpoint += `&endDate=${endDate}`;

        return this.request(endpoint, { method: 'GET' }, {
            showOAuthModal: true,
            autoRedirect: true
        });
    }

    /**
     * Test eBay connection with OAuth handling
     */
    async testConnection() {
        return this.request('/api/ebay/default_user/test', { method: 'GET' }, {
            showOAuthModal: true,
            autoRedirect: true
        });
    }

    /**
     * Get eBay sales with OAuth handling
     */
    async getSales(options = {}) {
        const { limit = 50, offset = 0 } = options;
        const endpoint = `/api/ebay/default_user/sales?limit=${limit}&offset=${offset}`;

        return this.request(endpoint, { method: 'GET' }, {
            showOAuthModal: true,
            autoRedirect: true
        });
    }

    /**
     * Check authentication status
     */
    async checkAuthStatus() {
        return this.request('/api/ebay/default_user/test', { method: 'GET' }, {
            showOAuthModal: false
        });
    }
}

// Global API wrapper instance
window.oauthApiWrapper = new OAuthApiWrapper();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthApiWrapper;
}
