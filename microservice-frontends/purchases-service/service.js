/**
 * StockPilot Purchases Service Frontend
 * Service-specific functionality for the purchases microservice
 */

class PurchasesServiceFrontend {
    constructor() {
        // Get Railway URL from configuration
        const railwayUrl = RailwayConfig ? RailwayConfig.getRailwayServiceUrl('purchases-service') : 'http://localhost:3001';
        this.apiClient = new PurchasesApiClient(railwayUrl);
        this.purchases = [];
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalPages = 1;
        this.filters = {
            status: '',
            supplier: ''
        };
    }

    /**
     * Initialize the purchases service frontend
     */
    init() {
        this.setupEventListeners();
        this.loadPurchases();
        this.setupModalHandlers();
    }

    /**
     * Setup event listeners specific to purchases service
     */
    setupEventListeners() {
        // Purchases tab specific events
        const refreshBtn = document.getElementById('refresh-purchases');
        const addBtn = document.getElementById('add-purchase');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadPurchases());
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddPurchaseModal());
        }

        // Filter events
        const statusFilter = document.getElementById('status-filter');
        const supplierFilter = document.getElementById('supplier-filter');
        const pageSizeSelect = document.getElementById('page-size');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadPurchases();
            });
        }

        if (supplierFilter) {
            supplierFilter.addEventListener('input', (e) => {
                this.filters.supplier = e.target.value;
                this.currentPage = 1;
                // Debounce the search
                clearTimeout(this.supplierTimeout);
                this.supplierTimeout = setTimeout(() => {
                    this.loadPurchases();
                }, 500);
            });
        }

        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadPurchases();
            });
        }

        // API test endpoint
        const testBtn = document.getElementById('test-endpoint');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testSelectedEndpoint());
        }

        // Add purchase form
        const addForm = document.getElementById('add-purchase-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddPurchase(e));
        }

        // Auto-calculate total price
        const quantityInput = document.getElementById('quantity');
        const unitPriceInput = document.getElementById('unit-price');
        const totalPriceInput = document.getElementById('total-price');

        if (quantityInput && unitPriceInput && totalPriceInput) {
            const calculateTotal = () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                const unitPrice = parseFloat(unitPriceInput.value) || 0;
                totalPriceInput.value = (quantity * unitPrice).toFixed(2);
            };

            quantityInput.addEventListener('input', calculateTotal);
            unitPriceInput.addEventListener('input', calculateTotal);
        }
    }

    /**
     * Setup modal handlers
     */
    setupModalHandlers() {
        const modal = document.getElementById('add-purchase-modal');
        const closeBtns = modal.querySelectorAll('.modal-close');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.hideAddPurchaseModal());
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAddPurchaseModal();
            }
        });
    }

    /**
     * Load purchases from API
     */
    async loadPurchases() {
        const purchasesList = document.getElementById('purchases-list');
        if (!purchasesList) return;

        try {
            purchasesList.innerHTML = '<div class="loading">Loading purchases...</div>';

            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.filters
            };

            const response = await this.apiClient.getPurchases(params);
            
            if (response.ok) {
                this.purchases = response.data.purchases || [];
                this.totalPages = response.data.totalPages || 1;
                
                this.displayPurchases();
                this.updatePagination();
                microserviceUtils.log(`Loaded ${this.purchases.length} purchases`, 'info');
            } else {
                throw new Error(response.data.error || 'Failed to load purchases');
            }
        } catch (error) {
            purchasesList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading purchases: ${error.message}</p>
                    <button class="btn btn-primary" onclick="purchasesService.loadPurchases()">
                        <i class="fas fa-retry"></i> Retry
                    </button>
                </div>
            `;
            microserviceUtils.log('Error loading purchases: ' + error.message, 'error');
        }
    }

    /**
     * Display purchases in the list
     */
    displayPurchases() {
        const purchasesList = document.getElementById('purchases-list');
        if (!purchasesList) return;

        if (this.purchases.length === 0) {
            purchasesList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No purchases found</p>
                    <button class="btn btn-primary" onclick="purchasesService.showAddPurchaseModal()">
                        <i class="fas fa-plus"></i> Add First Purchase
                    </button>
                </div>
            `;
            return;
        }

        purchasesList.innerHTML = this.purchases.map(purchase => `
            <div class="purchase-item" data-id="${purchase._id || purchase.id}">
                <div class="purchase-header">
                    <div class="purchase-title">
                        <h4>${purchase.product_name || 'Unknown Product'}</h4>
                        <span class="purchase-supplier">${purchase.supplier || 'Unknown Supplier'}</span>
                    </div>
                    <div class="purchase-status">
                        <span class="status-badge status-${purchase.status || 'pending'}">
                            ${(purchase.status || 'pending').toUpperCase()}
                        </span>
                    </div>
                </div>
                <div class="purchase-details">
                    <div class="detail-item">
                        <span class="detail-label">Quantity:</span>
                        <span class="detail-value">${purchase.quantity || 0}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Unit Price:</span>
                        <span class="detail-value">£${(purchase.unit_price || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">£${(purchase.total_price || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${this.formatDate(purchase.createdAt || purchase.date)}</span>
                    </div>
                </div>
                <div class="purchase-actions">
                    <button class="btn btn-secondary btn-sm" onclick="purchasesService.viewPurchase('${purchase._id || purchase.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="purchasesService.editPurchase('${purchase._id || purchase.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="purchasesService.deletePurchase('${purchase._id || purchase.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="btn btn-secondary btn-sm" onclick="purchasesService.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="btn btn-secondary btn-sm" onclick="purchasesService.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentPage ? 'btn-primary' : 'btn-secondary';
            paginationHTML += `
                <button class="btn ${isActive} btn-sm" onclick="purchasesService.goToPage(${i})">${i}</button>
            `;
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="btn btn-secondary btn-sm" onclick="purchasesService.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }

        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `
                <button class="btn btn-secondary btn-sm" onclick="purchasesService.goToPage(${this.currentPage + 1})">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHTML += '</div>';
        pagination.innerHTML = paginationHTML;
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        this.currentPage = page;
        this.loadPurchases();
    }

    /**
     * Show add purchase modal
     */
    showAddPurchaseModal() {
        const modal = document.getElementById('add-purchase-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide add purchase modal
     */
    hideAddPurchaseModal() {
        const modal = document.getElementById('add-purchase-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetAddPurchaseForm();
        }
    }

    /**
     * Reset add purchase form
     */
    resetAddPurchaseForm() {
        const form = document.getElementById('add-purchase-form');
        if (form) {
            form.reset();
        }
    }

    /**
     * Handle add purchase form submission
     */
    async handleAddPurchase(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const purchaseData = {
            product_name: formData.get('product-name') || document.getElementById('product-name').value,
            supplier: formData.get('supplier') || document.getElementById('supplier').value,
            quantity: parseInt(formData.get('quantity') || document.getElementById('quantity').value),
            unit_price: parseFloat(formData.get('unit-price') || document.getElementById('unit-price').value),
            total_price: parseFloat(formData.get('total-price') || document.getElementById('total-price').value),
            status: formData.get('status') || document.getElementById('status').value,
            notes: formData.get('notes') || document.getElementById('notes').value
        };

        try {
            const response = await this.apiClient.createPurchase(purchaseData);
            
            if (response.ok) {
                microserviceUtils.log('Purchase created successfully', 'info');
                this.hideAddPurchaseModal();
                this.loadPurchases();
                alert('Purchase created successfully!');
            } else {
                throw new Error(response.data.error || 'Failed to create purchase');
            }
        } catch (error) {
            microserviceUtils.log('Error creating purchase: ' + error.message, 'error');
            alert('Error creating purchase: ' + error.message);
        }
    }

    /**
     * View purchase details
     */
    viewPurchase(purchaseId) {
        const purchase = this.purchases.find(p => (p._id || p.id) === purchaseId);
        if (purchase) {
            const details = `
                <h4>${purchase.product_name || 'Unknown Product'}</h4>
                <p><strong>Supplier:</strong> ${purchase.supplier || 'Unknown'}</p>
                <p><strong>Quantity:</strong> ${purchase.quantity || 0}</p>
                <p><strong>Unit Price:</strong> £${(purchase.unit_price || 0).toFixed(2)}</p>
                <p><strong>Total Price:</strong> £${(purchase.total_price || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> ${purchase.status || 'pending'}</p>
                <p><strong>Created:</strong> ${this.formatDate(purchase.createdAt)}</p>
                ${purchase.notes ? `<p><strong>Notes:</strong> ${purchase.notes}</p>` : ''}
            `;
            alert(details);
        }
    }

    /**
     * Edit purchase
     */
    editPurchase(purchaseId) {
        microserviceUtils.log(`Edit purchase ${purchaseId} - Feature coming soon`, 'info');
        alert('Edit functionality coming soon!');
    }

    /**
     * Delete purchase
     */
    async deletePurchase(purchaseId) {
        if (!confirm('Are you sure you want to delete this purchase?')) {
            return;
        }

        try {
            const response = await this.apiClient.deletePurchase(purchaseId);
            
            if (response.ok) {
                microserviceUtils.log('Purchase deleted successfully', 'info');
                this.loadPurchases();
                alert('Purchase deleted successfully!');
            } else {
                throw new Error(response.data.error || 'Failed to delete purchase');
            }
        } catch (error) {
            microserviceUtils.log('Error deleting purchase: ' + error.message, 'error');
            alert('Error deleting purchase: ' + error.message);
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
                    if (path.includes('test')) {
                        response = await this.apiClient.testPurchase();
                    } else {
                        // For testing POST with sample data
                        const sampleData = {
                            product_name: 'Test Product',
                            supplier: 'Test Supplier',
                            quantity: 1,
                            unit_price: 10.00,
                            total_price: 10.00,
                            status: 'pending'
                        };
                        response = await this.apiClient.createPurchase(sampleData);
                    }
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
                responseTime: 0, // Would need to measure this
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
            { method: 'GET', path: '/ping' },
            { method: 'GET', path: '/' },
            { method: 'GET', path: '/api/purchases' },
            { method: 'POST', path: '/api/purchases/test' },
            { method: 'POST', path: '/api/purchases' },
            { method: 'GET', path: '/api/purchases/:id' },
            { method: 'PUT', path: '/api/purchases/:id' },
            { method: 'DELETE', path: '/api/purchases/:id' }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.purchasesService = new PurchasesServiceFrontend();
    window.purchasesService.init();
    
    // Override the default endpoints in utils
    if (window.microserviceUtils) {
        window.microserviceUtils.getDefaultEndpoints = () => window.purchasesService.getDefaultEndpoints();
    }
});
