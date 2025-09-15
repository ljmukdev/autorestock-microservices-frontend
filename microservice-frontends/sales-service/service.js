/**
 * StockPilot Sales Service Frontend
 * Service-specific functionality for the sales microservice
 */

class SalesServiceFrontend {
    constructor() {
        this.apiClient = new SalesApiClient('http://localhost:3002');
        this.sales = [];
    }

    /**
     * Initialize the sales service frontend
     */
    init() {
        this.setupEventListeners();
        this.loadSales();
    }

    /**
     * Setup event listeners specific to sales service
     */
    setupEventListeners() {
        // Sales tab specific events
        const refreshBtn = document.getElementById('refresh-sales');
        const addBtn = document.getElementById('add-sale');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadSales());
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddSaleModal());
        }

        // API test endpoint
        const testBtn = document.getElementById('test-endpoint');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testSelectedEndpoint());
        }
    }

    /**
     * Load sales from API
     */
    async loadSales() {
        const salesList = document.getElementById('sales-list');
        if (!salesList) return;

        try {
            salesList.innerHTML = '<div class="loading">Loading sales...</div>';

            const response = await this.apiClient.getSales();
            
            if (response.ok) {
                this.sales = response.data.data || [];
                this.displaySales();
                microserviceUtils.log(`Loaded ${this.sales.length} sales`, 'info');
            } else {
                throw new Error(response.data.error || 'Failed to load sales');
            }
        } catch (error) {
            salesList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading sales: ${error.message}</p>
                    <button class="btn btn-primary" onclick="salesService.loadSales()">
                        <i class="fas fa-retry"></i> Retry
                    </button>
                </div>
            `;
            microserviceUtils.log('Error loading sales: ' + error.message, 'error');
        }
    }

    /**
     * Display sales in the list
     */
    displaySales() {
        const salesList = document.getElementById('sales-list');
        if (!salesList) return;

        if (this.sales.length === 0) {
            salesList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-chart-line"></i>
                    <p>No sales found</p>
                    <button class="btn btn-primary" onclick="salesService.showAddSaleModal()">
                        <i class="fas fa-plus"></i> Add First Sale
                    </button>
                </div>
            `;
            return;
        }

        salesList.innerHTML = this.sales.map(sale => `
            <div class="sale-item" data-id="${sale._id || sale.id}">
                <div class="sale-header">
                    <div class="sale-title">
                        <h4>${sale.product_name || 'Unknown Product'}</h4>
                        <span class="sale-customer">${sale.customer || 'Unknown Customer'}</span>
                    </div>
                    <div class="sale-amount">
                        <span class="amount-value">£${(sale.amount || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div class="sale-details">
                    <div class="detail-item">
                        <span class="detail-label">Platform:</span>
                        <span class="detail-value">${sale.platform || 'Unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${this.formatDate(sale.date || sale.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${sale.status || 'completed'}</span>
                    </div>
                </div>
                <div class="sale-actions">
                    <button class="btn btn-secondary btn-sm" onclick="salesService.viewSale('${sale._id || sale.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="salesService.editSale('${sale._id || sale.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="salesService.deleteSale('${sale._id || sale.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show add sale modal
     */
    showAddSaleModal() {
        microserviceUtils.log('Add sale modal - Feature coming soon', 'info');
        alert('Add sale functionality coming soon!');
    }

    /**
     * View sale details
     */
    viewSale(saleId) {
        const sale = this.sales.find(s => (s._id || s.id) === saleId);
        if (sale) {
            const details = `
                <h4>${sale.product_name || 'Unknown Product'}</h4>
                <p><strong>Customer:</strong> ${sale.customer || 'Unknown'}</p>
                <p><strong>Amount:</strong> £${(sale.amount || 0).toFixed(2)}</p>
                <p><strong>Platform:</strong> ${sale.platform || 'Unknown'}</p>
                <p><strong>Status:</strong> ${sale.status || 'completed'}</p>
                <p><strong>Date:</strong> ${this.formatDate(sale.date || sale.createdAt)}</p>
            `;
            alert(details);
        }
    }

    /**
     * Edit sale
     */
    editSale(saleId) {
        microserviceUtils.log(`Edit sale ${saleId} - Feature coming soon`, 'info');
        alert('Edit functionality coming soon!');
    }

    /**
     * Delete sale
     */
    async deleteSale(saleId) {
        if (!confirm('Are you sure you want to delete this sale?')) {
            return;
        }

        try {
            const response = await this.apiClient.deleteSale(saleId);
            
            if (response.ok) {
                microserviceUtils.log('Sale deleted successfully', 'info');
                this.loadSales();
                alert('Sale deleted successfully!');
            } else {
                throw new Error(response.data.error || 'Failed to delete sale');
            }
        } catch (error) {
            microserviceUtils.log('Error deleting sale: ' + error.message, 'error');
            alert('Error deleting sale: ' + error.message);
        }
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
        if (path.includes(':id')) {
            const testId = prompt('Enter ID for testing:');
            if (!testId) return;
            testPath = path.replace(':id', testId);
        }

        try {
            let response;
            switch (method) {
                case 'GET':
                    response = await this.apiClient.get(testPath);
                    break;
                case 'POST':
                    const sampleData = {
                        product_name: 'Test Product',
                        customer: 'Test Customer',
                        amount: 25.00,
                        platform: 'test',
                        status: 'completed'
                    };
                    response = await this.apiClient.createSale(sampleData);
                    break;
                case 'PUT':
                    const updateData = {
                        status: 'completed',
                        notes: 'Updated via API test'
                    };
                    response = await this.apiClient.put(testPath, updateData);
                    break;
                case 'DELETE':
                    response = await this.apiClient.delete(testPath);
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
            { method: 'GET', path: '/api/sales' },
            { method: 'POST', path: '/api/sales' },
            { method: 'GET', path: '/api/sales/:id' },
            { method: 'PUT', path: '/api/sales/:id' },
            { method: 'DELETE', path: '/api/sales/:id' }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.salesService = new SalesServiceFrontend();
    window.salesService.init();
    
    // Override the default endpoints in utils
    if (window.microserviceUtils) {
        window.microserviceUtils.getDefaultEndpoints = () => window.salesService.getDefaultEndpoints();
    }
});
