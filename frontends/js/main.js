/**
 * AutoRestock SPA Main Entry Point
 * Bootstraps the modular single-page application
 */

import { router } from './core/router.js';
import { debugLog, validateConfig } from './core/config.js';
import { delegate } from './core/dom.js';
import { homeView } from './views/home.js';
import { purchasesView } from './views/purchases.js';
import { inventoryService } from './services/inventory/index.js';
import { salesService } from './services/sales/index.js';
import { consumablesService } from './services/consumables/index.js';
import { logSaleService } from './services/log-sale/index.js';
import { emailImportService } from './services/email-import/index.js';
import { reportsService } from './services/reports/index.js';
import { settingsService } from './services/settings/index.js';
import { oauthService } from './services/auth/oauth.js';

class AutoRestockApp {
  constructor() {
    this.isInitialized = false;
    this.views = new Map();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      debugLog('Initializing AutoRestock SPA');
      
      // Validate configuration
      if (!validateConfig()) {
        console.warn('Configuration validation failed, continuing with warnings');
      }

      // Initialize OAuth first
      await this.initializeOAuth();
      
      // Initialize views
      await this.initializeViews();
      
      // Setup routing
      this.setupRouting();
      
      this.isInitialized = true;
      debugLog('AutoRestock SPA initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AutoRestock SPA:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Initialize all views
   */
  async initializeViews() {
    debugLog('Initializing views');

    // Initialize home view
    const homeContainer = document.getElementById('tab-home');
    if (homeContainer) {
      await homeView.init(homeContainer);
      this.views.set('home', homeView);
    }

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

    // Initialize consumables view (placeholder)
    const consumablesContainer = document.getElementById('tab-consumables');
    if (consumablesContainer) {
      consumablesService.renderConsumables(consumablesContainer);
      this.views.set('consumables', consumablesService);
    }

    // Initialize log sale view (placeholder)
    const logSaleContainer = document.getElementById('tab-log-sale');
    if (logSaleContainer) {
      logSaleService.renderLogSale(logSaleContainer);
      this.views.set('log-sale', logSaleService);
    }

    // Initialize sales view (placeholder)
    const salesContainer = document.getElementById('tab-sales');
    if (salesContainer) {
      salesService.renderSales(salesContainer);
      this.views.set('sales', salesService);
    }

    // Initialize email import view (placeholder)
    const emailImportContainer = document.getElementById('tab-email-import');
    if (emailImportContainer) {
      emailImportService.renderEmailImport(emailImportContainer);
      this.views.set('email-import', emailImportService);
    }

    // Initialize reports view (placeholder)
    const reportsContainer = document.getElementById('tab-reports');
    if (reportsContainer) {
      reportsService.renderReports(reportsContainer);
      this.views.set('reports', reportsService);
    }

    // Initialize settings view (placeholder)
    const settingsContainer = document.getElementById('tab-settings');
    if (settingsContainer) {
      settingsService.renderSettings(settingsContainer);
      this.views.set('settings', settingsService);
    }

    debugLog('Views initialized', { count: this.views.size });
  }

  /**
   * Setup routing
   */
  setupRouting() {
    debugLog('Setting up routing');

    // Register tab handlers for all tabs
    const tabHandlers = {
      'home': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.refresh === 'function') {
          await view.refresh();
        }
      },
      'purchases': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.refresh === 'function') {
          await view.refresh();
        }
      },
      'inventory': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadInventory === 'function') {
          await view.loadInventory();
        }
      },
      'consumables': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadConsumables === 'function') {
          await view.loadConsumables();
        }
      },
      'log-sale': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadLogSale === 'function') {
          await view.loadLogSale();
        }
      },
      'sales': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadSales === 'function') {
          await view.loadSales();
        }
      },
      'email-import': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadEmailImport === 'function') {
          await view.loadEmailImport();
        }
      },
      'reports': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadReports === 'function') {
          await view.loadReports();
        }
      },
      'settings': async (tabName) => {
        debugLog(`Tab activated: ${tabName}`);
        const view = this.views.get(tabName);
        if (view && typeof view.loadSettings === 'function') {
          await view.loadSettings();
        }
      }
    };

    // Register all tab handlers
    Object.entries(tabHandlers).forEach(([tabName, handler]) => {
      router.onTabActivate(tabName, handler);
    });

    debugLog('Routing setup complete');
  }

  /**
   * Initialize OAuth service
   */
  async initializeOAuth() {
    try {
      debugLog('Initializing OAuth service');
      
      // Initialize OAuth service
      await oauthService.init();
      
      // Check if user is already authenticated
      const authStatus = oauthService.getAuthStatus();
      const isAuthenticated = authStatus.authenticated;
      
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
    
    console.error('AutoRestock Error:', message);
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
    const app = new AutoRestockApp();
    await app.init();
    
    // Make app globally available for debugging
    window.AutoRestockApp = app;
    
    debugLog('AutoRestock SPA ready');
  } catch (error) {
    console.error('Critical error during app initialization:', error);
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  debugLog('AutoRestock SPA unloading');
});

// Export for testing
export { AutoRestockApp };
