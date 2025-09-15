/**
 * StockPilot Inventory Service Frontend
 * Service-specific functionality for the inventory microservice
 */

class InventoryServiceFrontend {
    constructor() {
        this.apiClient = new InventoryApiClient('http://localhost:3004');
        this.inventory = [];
    }

    /**
     * Initialize the inventory service frontend
     */
    init() {
        this.setupEventListeners();
        this.loadInventory();
    }

    /**
     * Setup event listeners specific to inventory service
     */
    setupEventListeners() {
        // Inventory tab specific events
        const refreshBtn = document.getElementById('refresh-inventory');
        const addBtn = document.getElementById('add-item');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadInventory());
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddItemModal());
        }

        // API test endpoint
        const testBtn = document.getElementById('test-endpoint');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testSelectedEndpoint());
        }
    }

    /**
     * Load inventory from API
     */
    async loadInventory() {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;

        try {
            inventoryList.innerHTML = '<div class="loading">Loading inventory...</div>';

            const response = await this.apiClient.getInventory();
            
            if (response.ok) {
                this.inventory = response.data.items || [];
                this.displayInventory();
                microserviceUtils.log(`Loaded ${this.inventory.length} inventory items`, 'info');
            } else {
                throw new Error(response.data.error || 'Failed to load inventory');
            }
        } catch (error) {
            inventoryList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading inventory: ${error.message}</p>
                    <button class="btn btn-primary" onclick="inventoryService.loadInventory()">
                        <i class="fas fa-retry"></i> Retry
                    </button>
                </div>
            `;
            microserviceUtils.log('Error loading inventory: ' + error.message, 'error');
        }
    }

    /**
     * Display inventory in the list
     */
    displayInventory() {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;

        if (this.inventory.length === 0) {
            inventoryList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-boxes"></i>
                    <p>No inventory items found</p>
                    <button class="btn btn-primary" onclick="inventoryService.showAddItemModal()">
                        <i class="fas fa-plus"></i> Add First Item
                    </button>
                </div>
            `;
            return;
        }

        inventoryList.innerHTML = this.inventory.map(item => `
            <div class="inventory-item" data-id="${item._id || item.id}">
                <div class="item-header">
                    <div class="item-title">
                        <h4>${item.name || item.product_name || 'Unknown Item'}</h4>
                        <span class="item-sku">SKU: ${item.sku || 'N/A'}</span>
                    </div>
                    <div class="item-stock">
                        <span class="stock-level ${this.getStockLevelClass(item.stock_quantity)}">
                            ${item.stock_quantity || 0} in stock
                        </span>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${item.category || 'Uncategorized'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value">£${(item.price || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${item.location || 'Unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Updated:</span>
                        <span class="detail-value">${this.formatDate(item.updatedAt || item.last_updated)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="inventoryService.viewItem('${item._id || item.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="inventoryService.editItem('${item._id || item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="inventoryService.deleteItem('${item._id || item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Get stock level CSS class
     */
    getStockLevelClass(quantity) {
        if (!quantity || quantity <= 0) return 'out-of-stock';
        if (quantity <= 10) return 'low-stock';
        if (quantity <= 50) return 'medium-stock';
        return 'high-stock';
    }

    /**
     * Show add item modal
     */
    showAddItemModal() {
        microserviceUtils.log('Add item modal - Feature coming soon', 'info');
        alert('Add item functionality coming soon!');
    }

    /**
     * View item details
     */
    viewItem(itemId) {
        const item = this.inventory.find(i => (i._id || i.id) === itemId);
        if (item) {
            const details = `
                <h4>${item.name || item.product_name || 'Unknown Item'}</h4>
                <p><strong>SKU:</strong> ${item.sku || 'N/A'}</p>
                <p><strong>Category:</strong> ${item.category || 'Uncategorized'}</p>
                <p><strong>Stock Quantity:</strong> ${item.stock_quantity || 0}</p>
                <p><strong>Price:</strong> £${(item.price || 0).toFixed(2)}</p>
                <p><strong>Location:</strong> ${item.location || 'Unknown'}</p>
                <p><strong>Description:</strong> ${item.description || 'No description'}</p>
                <p><strong>Last Updated:</strong> ${this.formatDate(item.updatedAt || item.last_updated)}</p>
            `;
            alert(details);
        }
    }

    /**
     * Edit item
     */
    editItem(itemId) {
        microserviceUtils.log(`Edit item ${itemId} - Feature coming soon`, 'info');
        alert('Edit functionality coming soon!');
    }

    /**
     * Delete item
     */
    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await this.apiClient.deleteInventoryItem(itemId);
            
            if (response.ok) {
                microserviceUtils.log('Item deleted successfully', 'info');
                this.loadInventory();
                alert('Item deleted successfully!');
            } else {
                throw new Error(response.data.error || 'Failed to delete item');
            }
        } catch (error) {
            microserviceUtils.log('Error deleting item: ' + error.message, 'error');
            alert('Error deleting item: ' + error.message);
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
                        name: 'Test Item',
                        sku: 'TEST-001',
                        category: 'Test Category',
                        price: 25.00,
                        stock_quantity: 10,
                        location: 'Test Location',
                        description: 'Test item created via API'
                    };
                    response = await this.apiClient.createInventoryItem(sampleData);
                    break;
                case 'PUT':
                    const updateData = {
                        stock_quantity: 15,
                        description: 'Updated via API test'
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
            { method: 'GET', path: '/api/inventory' },
            { method: 'POST', path: '/api/inventory' },
            { method: 'GET', path: '/api/inventory/:id' },
            { method: 'PUT', path: '/api/inventory/:id' },
            { method: 'DELETE', path: '/api/inventory/:id' }
        ];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryService = new InventoryServiceFrontend();
    window.inventoryService.init();
    
    // Override the default endpoints in utils
    if (window.microserviceUtils) {
        window.microserviceUtils.getDefaultEndpoints = () => window.inventoryService.getDefaultEndpoints();
    }
});
