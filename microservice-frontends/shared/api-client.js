/**
 * StockPilot Microservice API Client
 * Shared API client for all microservice frontends
 */

class MicroserviceApiClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Set base URL for API calls
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    /**
     * Set default headers
     */
    setHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.text();
            
            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                parsedData = data;
            }

            return {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                data: parsedData,
                headers: response.headers
            };
        } catch (error) {
            return {
                ok: false,
                status: 0,
                statusText: 'Network Error',
                data: error.message,
                error: error
            };
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request(endpoint, {
            method: 'POST',
            headers: {
                // Don't set Content-Type for FormData, let browser set it with boundary
            },
            body: formData
        });
    }

    /**
     * Check service health
     */
    async checkHealth() {
        return this.get('/health');
    }

    /**
     * Get service info
     */
    async getServiceInfo() {
        return this.get('/');
    }

    /**
     * Get API documentation
     */
    async getApiDocs() {
        return this.get('/api-docs');
    }
}

/**
 * Service-specific API clients
 */
class PurchasesApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Get all purchases
     */
    async getPurchases(params = {}) {
        return this.get('/api/purchases', params);
    }

    /**
     * Get purchase by ID
     */
    async getPurchase(id) {
        return this.get(`/api/purchases/${id}`);
    }

    /**
     * Create purchase
     */
    async createPurchase(data) {
        return this.post('/api/purchases', data);
    }

    /**
     * Update purchase
     */
    async updatePurchase(id, data) {
        return this.put(`/api/purchases/${id}`, data);
    }

    /**
     * Delete purchase
     */
    async deletePurchase(id) {
        return this.delete(`/api/purchases/${id}`);
    }

    /**
     * Test purchase endpoint
     */
    async testPurchase() {
        return this.post('/api/purchases/test');
    }
}

class SalesApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Get all sales
     */
    async getSales(params = {}) {
        return this.get('/api/sales', params);
    }

    /**
     * Get sale by ID
     */
    async getSale(id) {
        return this.get(`/api/sales/${id}`);
    }

    /**
     * Create sale
     */
    async createSale(data) {
        return this.post('/api/sales', data);
    }

    /**
     * Update sale
     */
    async updateSale(id, data) {
        return this.put(`/api/sales/${id}`, data);
    }

    /**
     * Delete sale
     */
    async deleteSale(id) {
        return this.delete(`/api/sales/${id}`);
    }
}

class InventoryApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Get inventory items
     */
    async getInventory(params = {}) {
        return this.get('/api/inventory', params);
    }

    /**
     * Get inventory item by ID
     */
    async getInventoryItem(id) {
        return this.get(`/api/inventory/${id}`);
    }

    /**
     * Create inventory item
     */
    async createInventoryItem(data) {
        return this.post('/api/inventory', data);
    }

    /**
     * Update inventory item
     */
    async updateInventoryItem(id, data) {
        return this.put(`/api/inventory/${id}`, data);
    }

    /**
     * Delete inventory item
     */
    async deleteInventoryItem(id) {
        return this.delete(`/api/inventory/${id}`);
    }
}

class EbayApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Start OAuth login
     */
    async startOAuthLogin() {
        return this.get('/oauth/login');
    }

    /**
     * Refresh OAuth token
     */
    async refreshOAuthToken() {
        return this.post('/oauth/refresh');
    }

    /**
     * Get eBay sales data
     */
    async getEbaySales(userId) {
        return this.get(`/api/ebay/${userId}/sales`);
    }

    /**
     * Get eBay purchases
     */
    async getEbayPurchases(userId) {
        return this.get(`/api/ebay/${userId}/purchases`);
    }

    /**
     * Get eBay fees
     */
    async getEbayFees(userId) {
        return this.get(`/api/ebay/${userId}/fees`);
    }

    /**
     * Get eBay inventory
     */
    async getEbayInventory(userId) {
        return this.get(`/api/ebay/${userId}/inventory`);
    }

    /**
     * Get eBay account summary
     */
    async getEbayAccountSummary(userId) {
        return this.get(`/api/ebay/${userId}/account-summary`);
    }

    /**
     * Get eBay profile
     */
    async getEbayProfile(userId) {
        return this.get(`/api/ebay/${userId}/profile`);
    }
}

class VintedApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Check scraper health
     */
    async checkScraperHealth() {
        return this.get('/scrape/health');
    }

    /**
     * Get scraper status
     */
    async getScraperStatus() {
        return this.get('/scrape/status');
    }

    /**
     * Scrape sold items
     */
    async scrapeSoldItems(username = '') {
        return this.get('/scrape/sold', { username });
    }

    /**
     * Scrape bought items
     */
    async scrapeBoughtItems(username = '') {
        return this.get('/scrape/bought', { username });
    }

    /**
     * Scrape user profile
     */
    async scrapeUserProfile(username) {
        return this.get(`/scrape/profile/${username}`);
    }

    /**
     * Set cookies for scraping
     */
    async setCookies(cookies) {
        return this.post('/scrape/cookies', { cookies });
    }

    /**
     * Get email transactions
     */
    async getEmailTransactions() {
        return this.get('/scrape/email/transactions');
    }

    /**
     * Get email transactions by type
     */
    async getEmailTransactionsByType(type) {
        return this.get(`/scrape/email/transactions/${type}`);
    }

    /**
     * Get financial summary
     */
    async getFinancialSummary() {
        return this.get('/scrape/email/financial-summary');
    }
}

class MediaApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Get media items
     */
    async getMedia(params = {}) {
        return this.get('/api/v1/media', params);
    }

    /**
     * Get media by ID
     */
    async getMediaById(id) {
        return this.get(`/api/v1/media/${id}`);
    }

    /**
     * Upload media file
     */
    async uploadMedia(file, metadata = {}) {
        return this.uploadFile('/api/v1/media/upload', file, metadata);
    }

    /**
     * Upload multiple media files
     */
    async uploadMultipleMedia(files, metadata = {}) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return this.request('/api/v1/media/upload-multiple', {
            method: 'POST',
            body: formData
        });
    }

    /**
     * Update media
     */
    async updateMedia(id, data) {
        return this.put(`/api/v1/media/${id}`, data);
    }

    /**
     * Delete media
     */
    async deleteMedia(id) {
        return this.delete(`/api/v1/media/${id}`);
    }

    /**
     * Download media
     */
    async downloadMedia(id) {
        return this.get(`/api/v1/media/${id}/download`);
    }

    /**
     * Get media thumbnail
     */
    async getMediaThumbnail(id) {
        return this.get(`/api/v1/media/${id}/thumbnail`);
    }

    /**
     * Add tags to media
     */
    async addTagsToMedia(id, tags) {
        return this.post(`/api/v1/media/${id}/tags`, { tags });
    }

    /**
     * Remove tags from media
     */
    async removeTagsFromMedia(id, tags) {
        return this.delete(`/api/v1/media/${id}/tags`, { tags });
    }

    /**
     * Share media
     */
    async shareMedia(id, userId) {
        return this.post(`/api/v1/media/${id}/share`, { userId });
    }

    /**
     * Get media analytics
     */
    async getMediaAnalytics(id) {
        return this.get(`/api/v1/media/${id}/analytics`);
    }
}

class EmailApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Get emails
     */
    async getEmails(params = {}) {
        return this.get('/api/v1/emails', params);
    }

    /**
     * Get email by ID
     */
    async getEmail(id) {
        return this.get(`/api/v1/emails/${id}`);
    }

    /**
     * Create email
     */
    async createEmail(data) {
        return this.post('/api/v1/emails', data);
    }

    /**
     * Update email
     */
    async updateEmail(id, data) {
        return this.put(`/api/v1/emails/${id}`, data);
    }

    /**
     * Delete email
     */
    async deleteEmail(id) {
        return this.delete(`/api/v1/emails/${id}`);
    }

    /**
     * Get email statistics
     */
    async getEmailStats(params = {}) {
        return this.get('/api/v1/emails/stats', params);
    }

    /**
     * Mark email as read
     */
    async markEmailAsRead(id) {
        return this.post(`/api/v1/emails/${id}/mark-read`);
    }

    /**
     * Mark email as unread
     */
    async markEmailAsUnread(id) {
        return this.post(`/api/v1/emails/${id}/mark-unread`);
    }

    /**
     * Archive email
     */
    async archiveEmail(id) {
        return this.post(`/api/v1/emails/${id}/archive`);
    }

    /**
     * Unarchive email
     */
    async unarchiveEmail(id) {
        return this.post(`/api/v1/emails/${id}/unarchive`);
    }

    /**
     * Add tag to email
     */
    async addTagToEmail(id, tag) {
        return this.post(`/api/v1/emails/${id}/tags`, { tag });
    }

    /**
     * Remove tag from email
     */
    async removeTagFromEmail(id, tag) {
        return this.delete(`/api/v1/emails/${id}/tags/${tag}`);
    }

    /**
     * Categorize email
     */
    async categorizeEmail(id, category) {
        return this.post(`/api/v1/emails/${id}/categorize`, { category });
    }

    /**
     * Set email priority
     */
    async setEmailPriority(id, priority) {
        return this.post(`/api/v1/emails/${id}/priority`, { priority });
    }

    /**
     * Get email thread
     */
    async getEmailThread(id) {
        return this.get(`/api/v1/emails/${id}/thread`);
    }
}

class ReportingApiClient extends MicroserviceApiClient {
    constructor(baseUrl = '') {
        super(baseUrl);
    }

    /**
     * Get reports
     */
    async getReports(params = {}) {
        return this.get('/api/reports', params);
    }

    /**
     * Get report by ID
     */
    async getReport(id) {
        return this.get(`/api/reports/${id}`);
    }

    /**
     * Create report
     */
    async createReport(data) {
        return this.post('/api/reports', data);
    }

    /**
     * Update report
     */
    async updateReport(id, data) {
        return this.put(`/api/reports/${id}`, data);
    }

    /**
     * Delete report
     */
    async deleteReport(id) {
        return this.delete(`/api/reports/${id}`);
    }

    /**
     * Get analytics summary
     */
    async getAnalyticsSummary() {
        return this.get('/api/reports/analytics/summary');
    }

    /**
     * Get trend data
     */
    async getTrendData() {
        return this.get('/api/reports/analytics/trends');
    }
}

// Export API clients
window.MicroserviceApiClient = MicroserviceApiClient;
window.PurchasesApiClient = PurchasesApiClient;
window.SalesApiClient = SalesApiClient;
window.InventoryApiClient = InventoryApiClient;
window.EbayApiClient = EbayApiClient;
window.VintedApiClient = VintedApiClient;
window.MediaApiClient = MediaApiClient;
window.EmailApiClient = EmailApiClient;
window.ReportingApiClient = ReportingApiClient;
