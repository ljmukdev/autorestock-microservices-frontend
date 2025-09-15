/**
 * StockPilot Microservice Frontend Utilities
 * Shared utility functions for all microservice frontends
 */

class MicroserviceUtils {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.autoRefreshInterval = null;
        this.refreshInterval = 30000; // 30 seconds default
    }

    /**
     * Initialize the microservice frontend
     */
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.startAutoRefresh();
        this.updateLastUpdated();
    }

    /**
     * Setup event listeners for common functionality
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings
        const saveSettingsBtn = document.getElementById('save-settings');
        const resetSettingsBtn = document.getElementById('reset-settings');
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
        
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }

        // Clear results
        const clearResultsBtn = document.getElementById('clear-results');
        if (clearResultsBtn) {
            clearResultsBtn.addEventListener('click', () => this.clearResults());
        }

        // Clear logs
        const clearLogsBtn = document.getElementById('clear-logs');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearLogs());
        }

        // Refresh logs
        const refreshLogsBtn = document.getElementById('refresh-logs');
        if (refreshLogsBtn) {
            refreshLogsBtn.addEventListener('click', () => this.refreshLogs());
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific content
        this.loadTabContent(tabName);
    }

    /**
     * Load content for specific tab
     */
    loadTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadOverview();
                break;
            case 'api-test':
                this.loadApiTest();
                break;
            case 'logs':
                this.loadLogs();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    /**
     * Load overview tab content
     */
    async loadOverview() {
        try {
            await this.checkHealth();
            await this.loadEndpoints();
            await this.loadStats();
        } catch (error) {
            this.log('Error loading overview: ' + error.message, 'error');
        }
    }

    /**
     * Load API test tab content
     */
    loadApiTest() {
        this.populateEndpointSelector();
    }

    /**
     * Load logs tab content
     */
    loadLogs() {
        this.displayLogs();
    }

    /**
     * Check service health
     */
    async checkHealth() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const healthInfo = document.getElementById('health-info');

        try {
            statusIndicator.className = 'status-indicator checking';
            statusText.textContent = 'Checking...';

            const response = await fetch('/health');
            const data = await response.json();

            if (response.ok) {
                statusIndicator.className = 'status-indicator healthy';
                statusText.textContent = 'Healthy';
                
                // Display health information
                healthInfo.innerHTML = `
                    <div class="health-item">
                        <span class="health-label">Status:</span>
                        <span class="health-value">${data.status}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Service:</span>
                        <span class="health-value">${data.service}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Uptime:</span>
                        <span class="health-value">${this.formatUptime(data.uptime)}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Memory:</span>
                        <span class="health-value">${this.formatBytes(data.memory?.heapUsed || 0)}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Database:</span>
                        <span class="health-value">${data.database || 'N/A'}</span>
                    </div>
                `;
            } else {
                throw new Error(data.message || 'Health check failed');
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator unhealthy';
            statusText.textContent = 'Unhealthy';
            
            healthInfo.innerHTML = `
                <div class="health-item">
                    <span class="health-label">Error:</span>
                    <span class="health-value" style="color: #f56565;">${error.message}</span>
                </div>
            `;
            
            this.log('Health check failed: ' + error.message, 'error');
        }
    }

    /**
     * Load available endpoints
     */
    async loadEndpoints() {
        const endpointsList = document.getElementById('endpoints-list');
        
        try {
            // Try to get API docs endpoint first
            let endpoints = [];
            try {
                const response = await fetch('/api-docs');
                const docs = await response.json();
                endpoints = docs.endpoints || [];
            } catch (error) {
                // Fallback to common endpoints
                endpoints = this.getDefaultEndpoints();
            }

            if (endpoints.length === 0) {
                endpointsList.innerHTML = '<div class="no-results">No endpoints found</div>';
                return;
            }

            endpointsList.innerHTML = endpoints.map(endpoint => `
                <div class="endpoint-item">
                    <span class="endpoint-method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                    <span class="endpoint-path">${endpoint.path}</span>
                </div>
            `).join('');
        } catch (error) {
            endpointsList.innerHTML = '<div class="no-results">Error loading endpoints</div>';
            this.log('Error loading endpoints: ' + error.message, 'error');
        }
    }

    /**
     * Get default endpoints for common microservices
     */
    getDefaultEndpoints() {
        return [
            { method: 'GET', path: '/health' },
            { method: 'GET', path: '/ping' },
            { method: 'GET', path: '/' }
        ];
    }

    /**
     * Load service statistics
     */
    async loadStats() {
        try {
            const response = await fetch('/health');
            const data = await response.json();

            if (response.ok) {
                document.getElementById('uptime').textContent = this.formatUptime(data.uptime);
                document.getElementById('memory').textContent = this.formatBytes(data.memory?.heapUsed || 0);
                document.getElementById('requests').textContent = data.requests || '--';
            }
        } catch (error) {
            this.log('Error loading stats: ' + error.message, 'error');
        }
    }

    /**
     * Populate endpoint selector for API testing
     */
    populateEndpointSelector() {
        const selector = document.getElementById('endpoint-select');
        if (!selector) return;

        const endpoints = this.getDefaultEndpoints();
        
        selector.innerHTML = '<option value="">Select an endpoint...</option>' +
            endpoints.map(endpoint => 
                `<option value="${endpoint.method}:${endpoint.path}">${endpoint.method} ${endpoint.path}</option>`
            ).join('');
    }

    /**
     * Test an API endpoint
     */
    async testEndpoint() {
        const selector = document.getElementById('endpoint-select');
        const testBtn = document.getElementById('test-endpoint');
        
        if (!selector || !testBtn) return;

        const selectedValue = selector.value;
        if (!selectedValue) {
            alert('Please select an endpoint to test');
            return;
        }

        const [method, path] = selectedValue.split(':');
        
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

        try {
            const startTime = Date.now();
            const response = await fetch(path, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const endTime = Date.now();
            
            const data = await response.text();
            let parsedData;
            
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                parsedData = data;
            }

            this.addTestResult({
                method,
                path,
                status: response.status,
                statusText: response.statusText,
                responseTime: endTime - startTime,
                data: parsedData,
                success: response.ok
            });

        } catch (error) {
            this.addTestResult({
                method,
                path,
                status: 0,
                statusText: 'Network Error',
                responseTime: 0,
                data: error.message,
                success: false
            });
        } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = '<i class="fas fa-play"></i> Test';
        }
    }

    /**
     * Add test result to the results container
     */
    addTestResult(result) {
        const container = document.getElementById('results-container');
        if (!container) return;

        const resultElement = document.createElement('div');
        resultElement.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        resultElement.innerHTML = `
            <div class="result-meta">
                <span class="result-status ${result.success ? 'success' : 'error'}">
                    ${result.status} ${result.statusText}
                </span>
                <span>${result.method} ${result.path} (${result.responseTime}ms)</span>
            </div>
            <div class="result-response">${JSON.stringify(result.data, null, 2)}</div>
        `;

        // Remove "no results" message if it exists
        const noResults = container.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }

        container.insertBefore(resultElement, container.firstChild);
        
        // Limit to 10 results
        const results = container.querySelectorAll('.result-item');
        if (results.length > 10) {
            results[results.length - 1].remove();
        }
    }

    /**
     * Clear test results
     */
    clearResults() {
        const container = document.getElementById('results-container');
        if (container) {
            container.innerHTML = '<div class="no-results">No tests run yet. Select an endpoint and click Test.</div>';
        }
    }

    /**
     * Add log entry
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message
        };

        this.logs.unshift(logEntry);
        
        // Limit logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Update display if logs tab is active
        if (document.getElementById('logs').classList.contains('active')) {
            this.displayLogs();
        }
    }

    /**
     * Display logs
     */
    displayLogs() {
        const logsContent = document.getElementById('logs-content');
        if (!logsContent) return;

        if (this.logs.length === 0) {
            logsContent.innerHTML = '<div class="no-results">No logs available</div>';
            return;
        }

        logsContent.innerHTML = this.logs.map(log => 
            `<div class="log-entry ${log.level}">[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}</div>`
        ).join('');
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
        this.displayLogs();
    }

    /**
     * Refresh logs
     */
    refreshLogs() {
        this.displayLogs();
        this.log('Logs refreshed', 'info');
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const settings = this.getSettings();
        
        const serviceUrl = document.getElementById('service-url');
        const autoRefresh = document.getElementById('auto-refresh');
        const logLevel = document.getElementById('log-level');

        if (serviceUrl) serviceUrl.value = settings.serviceUrl;
        if (autoRefresh) autoRefresh.value = settings.autoRefresh;
        if (logLevel) logLevel.value = settings.logLevel;
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = {
            serviceUrl: document.getElementById('service-url')?.value || '',
            autoRefresh: parseInt(document.getElementById('auto-refresh')?.value) || 30,
            logLevel: document.getElementById('log-level')?.value || 'info'
        };

        localStorage.setItem('microservice-settings', JSON.stringify(settings));
        this.refreshInterval = settings.autoRefresh * 1000;
        
        // Restart auto-refresh with new interval
        this.stopAutoRefresh();
        this.startAutoRefresh();
        
        this.log('Settings saved', 'info');
        alert('Settings saved successfully!');
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        localStorage.removeItem('microservice-settings');
        this.loadSettings();
        this.log('Settings reset to defaults', 'info');
    }

    /**
     * Get settings from localStorage
     */
    getSettings() {
        const defaultSettings = {
            serviceUrl: window.location.origin,
            autoRefresh: 30,
            logLevel: 'info'
        };

        try {
            const stored = localStorage.getItem('microservice-settings');
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        } catch (error) {
            return defaultSettings;
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            if (document.getElementById('overview').classList.contains('active')) {
                this.loadOverview();
            }
            this.updateLastUpdated();
        }, this.refreshInterval);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        }
    }

    /**
     * Format uptime in human readable format
     */
    formatUptime(seconds) {
        if (!seconds) return '--';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * Format bytes in human readable format
     */
    formatBytes(bytes) {
        if (!bytes) return '--';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Initialize utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.microserviceUtils = new MicroserviceUtils();
    window.microserviceUtils.init();
});

// Export for use in service-specific scripts
window.MicroserviceUtils = MicroserviceUtils;
