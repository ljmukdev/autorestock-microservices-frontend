/**
 * StockPilot Purchases View
 * Coordinates purchases service with UI
 */

import { purchasesService } from '../services/purchases/index.js';
import { router } from '../core/router.js';
import { $, $all, debugLog } from '../core/utils.js';
import { showSuccess, showError } from '../components/toasts.js';

class PurchasesView {
  constructor() {
    this.isInitialized = false;
    this.container = null;
  }

  /**
   * Initialize purchases view
   * @param {Element} container - Container element
   */
  async init(container) {
    this.container = container;
    debugLog('Initializing purchases view');

    try {
      // Load purchases data
      await purchasesService.loadPurchases();
      
      // Render UI
      this.render();
      
      // Bind events
      this.bindEvents();
      
      this.isInitialized = true;
      debugLog('Purchases view initialized');
    } catch (error) {
      debugLog('Error initializing purchases view', error);
      this.showError(error.message);
    }
  }

  /**
   * Render purchases view
   */
  render() {
    if (!this.container) {
      debugLog('No container for purchases view');
      return;
    }

    purchasesService.renderPurchases(this.container, {
      showStatusBar: true,
      showHistory: true,
      showActions: true
    });

    debugLog('Purchases view rendered');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.container) return;

    // Refresh button
    const refreshBtn = this.container.querySelector('#btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Add purchase button
    const addBtn = this.container.querySelector('#btn-add-purchase');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAddPurchase());
    }

    // eBay sync button
    const syncBtn = this.container.querySelector('#btn-ebay-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.handleEbaySync());
    }

    // Purchase card actions
    this.container.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('button[data-action]');
      if (actionBtn) {
        const action = actionBtn.getAttribute('data-action');
        const purchaseId = actionBtn.getAttribute('data-id');
        this.handlePurchaseAction(action, purchaseId);
        return;
      }

      // Purchase card click
      const purchaseCard = e.target.closest('.purchase-card');
      if (purchaseCard) {
        const purchaseId = purchaseCard.getAttribute('data-id');
        this.handlePurchaseClick(purchaseId);
      }
    });

    debugLog('Purchases view events bound');
  }

  /**
   * Handle refresh action
   */
  async handleRefresh() {
    debugLog('Handling refresh');
    
    try {
      showInfo('Refreshing purchases...');
      await purchasesService.loadPurchases();
      this.render();
      showSuccess('Purchases refreshed successfully');
    } catch (error) {
      debugLog('Error refreshing purchases', error);
      showError(`Failed to refresh: ${error.message}`);
    }
  }

  /**
   * Handle add purchase action
   */
  handleAddPurchase() {
    debugLog('Handling add purchase');
    showInfo('Add purchase functionality coming soon...');
    // TODO: Implement add purchase modal
  }

  /**
   * Handle eBay sync action
   */
  async handleEbaySync() {
    debugLog('Handling eBay sync');
    
    try {
      showInfo('Syncing with eBay...');
      await purchasesService.syncPurchases();
      this.render();
      showSuccess('eBay sync completed successfully');
    } catch (error) {
      debugLog('Error syncing with eBay', error);
      showError(`Sync failed: ${error.message}`);
    }
  }

  /**
   * Handle purchase action
   * @param {string} action - Action type
   * @param {string} purchaseId - Purchase ID
   */
  handlePurchaseAction(action, purchaseId) {
    debugLog(`Handling purchase action: ${action}`, { purchaseId });

    switch (action) {
      case 'stage':
        this.handleStagePurchase(purchaseId);
        break;
      case 'split':
        this.handleSplitPurchase(purchaseId);
        break;
      case 'inventory':
        this.handleMoveToInventory(purchaseId);
        break;
      case 'delete':
        this.handleDeletePurchase(purchaseId);
        break;
      default:
        debugLog(`Unknown purchase action: ${action}`);
    }
  }

  /**
   * Handle stage purchase
   * @param {string} purchaseId - Purchase ID
   */
  handleStagePurchase(purchaseId) {
    debugLog(`Staging purchase: ${purchaseId}`);
    showInfo('Staging purchase...');
    // TODO: Implement staging logic
  }

  /**
   * Handle split purchase
   * @param {string} purchaseId - Purchase ID
   */
  handleSplitPurchase(purchaseId) {
    debugLog(`Splitting purchase: ${purchaseId}`);
    showInfo('Splitting purchase...');
    // TODO: Implement split logic
  }

  /**
   * Handle move to inventory
   * @param {string} purchaseId - Purchase ID
   */
  handleMoveToInventory(purchaseId) {
    debugLog(`Moving to inventory: ${purchaseId}`);
    showSuccess('Added to inventory');
    // TODO: Implement inventory move logic
  }

  /**
   * Handle delete purchase
   * @param {string} purchaseId - Purchase ID
   */
  handleDeletePurchase(purchaseId) {
    debugLog(`Deleting purchase: ${purchaseId}`);
    
    if (confirm('Are you sure you want to delete this purchase?')) {
      showInfo('Deleting purchase...');
      // TODO: Implement delete logic
      showSuccess('Purchase deleted');
      this.render();
    }
  }

  /**
   * Handle purchase card click
   * @param {string} purchaseId - Purchase ID
   */
  handlePurchaseClick(purchaseId) {
    debugLog(`Purchase clicked: ${purchaseId}`);
    showInfo('Purchase details coming soon...');
    // TODO: Implement purchase details modal
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message) {
    if (!this.container) return;
    
    purchasesService.showError(this.container, message, () => this.handleRefresh());
  }

  /**
   * Show loading state
   * @param {string} message - Loading message
   */
  showLoading(message = 'Loading purchases...') {
    if (!this.container) return;
    
    purchasesService.showLoading(this.container, message);
  }

  /**
   * Refresh view
   */
  async refresh() {
    if (!this.isInitialized) return;
    
    debugLog('Refreshing purchases view');
    await this.handleRefresh();
  }

  /**
   * Destroy view
   */
  destroy() {
    if (this.container) {
      // Remove event listeners
      this.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    debugLog('Purchases view destroyed');
  }
}

// Create and export view instance
export const purchasesView = new PurchasesView();

// Export class for testing
export { PurchasesView };
