/**
 * StockPilot SPA Main Entry Point
 * Bootstraps the modular single-page application
 */

import { router } from './core/router.js';
import { debugLog, validateConfig } from './core/config.js';
import { purchasesView } from './views/purchases.js';
import { inventoryService } from './services/inventory/index.js';
import { salesService } from './services/sales/index.js';
import { oauthService } from './services/auth/oauth.js';

class StockPilotApp {
  constructor() {
    this.isInitialized = false;
    this.views = new Map();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      debugLog('Initializing StockPilot SPA');
      
      // Validate configuration
      if (!validateConfig()) {
        console.warn('Configuration validation failed, continuing with warnings');
      }

      // Initialize views
      await this.initializeViews();
      
      // Setup routing
      this.setupRouting();
      
      // Initialize OAuth
      await this.initializeOAuth();
      
      this.isInitialized = true;
      debugLog('StockPilot SPA initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize StockPilot SPA:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Initialize all views
   */
  async initializeViews() {
    debugLog('Initializing views');

    // Initialize purchases view
    const purchasesContainer = document.getElementById('tab-purchases');
    if (purchasesContainer) {
      await purchasesView.init(purchasesContainer);
      this.views.set('purchases', purchasesView);
    }

    // Initialize inventory view (placeholder)
    const inventoryContainer = document.getElementById('tab-inventory');
    if (inventoryContainer) {
      inventoryService.renderInventory(inventoryContainer);
      this.views.set('inventory', inventoryService);
    }

    // Initialize sales view (placeholder)
    const salesContainer = document.getElementById('tab-sales');
    if (salesContainer) {
      salesService.renderSales(salesContainer);
      this.views.set('sales', salesService);
    }

    debugLog('Views initialized', { count: this.views.size });
  }

  /**
   * Setup routing
   */
  setupRouting() {
    debugLog('Setting up routing');

    // Register tab handlers
    router.onTabActivate('purchases', async (tabName) => {
      debugLog(`Tab activated: ${tabName}`);
      const view = this.views.get(tabName);
      if (view && typeof view.refresh === 'function') {
        await view.refresh();
      }
    });

    router.onTabActivate('inventory', async (tabName) => {
      debugLog(`Tab activated: ${tabName}`);
      const view = this.views.get(tabName);
      if (view && typeof view.loadInventory === 'function') {
        await view.loadInventory();
      }
    });

    router.onTabActivate('sales', async (tabName) => {
      debugLog(`Tab activated: ${tabName}`);
      const view = this.views.get(tabName);
      if (view && typeof view.loadSales === 'function') {
        await view.loadSales();
      }
    });

    debugLog('Routing setup complete');
  }

  /**
   * Initialize OAuth service
   */
  async initializeOAuth() {
    try {
      debugLog('Initializing OAuth service');
      
      // Check if user is already authenticated
      const isAuthenticated = await oauthService.checkAuthStatus();
      
      if (!isAuthenticated) {
        debugLog('User not authenticated, OAuth modal may be shown when needed');
      } else {
        debugLog('User is authenticated');
      }
      
    } catch (error) {
      debugLog('OAuth initialization error', error);
      // Don't fail the entire app if OAuth fails
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const statusBar = document.getElementById('spa-status-bar');
    if (statusBar) {
      statusBar.innerHTML = `
        <div class="spa-status-item">
          <span>❌</span>
          <span>${message}</span>
        </div>
      `;
    }
    
    console.error('StockPilot Error:', message);
  }

  /**
   * Get application status
   * @returns {Object} Application status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      views: Array.from(this.views.keys()),
      currentTab: router.getCurrentTab()
    };
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new StockPilotApp();
    await app.init();
    
    // Make app globally available for debugging
    window.StockPilotApp = app;
    
    debugLog('StockPilot SPA ready');
  } catch (error) {
    console.error('Critical error during app initialization:', error);
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  debugLog('StockPilot SPA unloading');
});

// Export for testing
export { StockPilotApp };
