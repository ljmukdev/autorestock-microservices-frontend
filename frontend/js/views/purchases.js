/**
 * StockPilot Purchases View
 * Coordinates purchases service with UI
 */

import { purchasesService } from '../services/purchases/index.js';
import { router } from '../core/router.js';
import { $, $all, showModal } from '../core/utils.js';
import { debugLog } from '../core/config.js';
import { showSuccess, showError, showInfo } from '../components/toasts.js';
import { renderPurchaseDetailsModal } from '../services/purchases/ui.js';

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
      await purchasesService.loadPurchases({ limit: 100 });
      
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

    // eBay login button
    const ebayLoginBtn = this.container.querySelector("#btn-ebay-login");
    if (ebayLoginBtn) {
      ebayLoginBtn.addEventListener("click", () => this.handleEbayLogin());
    }

    // OAuth login button (legacy)
    const oauthBtn = this.container.querySelector("#oauth-login-btn");
    if (oauthBtn) {
      oauthBtn.addEventListener("click", () => this.handleOAuthLogin());
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

    // Purchase actions (both cards and list)
    this.container.addEventListener('click', (e) => {
      // Handle checkbox clicks
      if (e.target.type === 'checkbox' && e.target.classList.contains('purchase-checkbox')) {
        e.stopPropagation(); // Prevent row click when clicking checkbox
        
        if (e.target.id === 'select-all-purchases') {
          this.handleSelectAllChange(e.target);
        } else {
          this.handleCheckboxChange(e.target);
        }
        return;
      }

      const actionBtn = e.target.closest('button[data-action]');
      if (actionBtn) {
        const action = actionBtn.getAttribute('data-action');
        const purchaseId = actionBtn.getAttribute('data-id');
        this.handlePurchaseAction(action, purchaseId);
        return;
      }

      // Purchase card/row click (but not if clicking checkbox)
      const purchaseCard = e.target.closest('.purchase-card, .purchase-list-row');
      if (purchaseCard && !e.target.closest('.purchase-checkbox-cell')) {
        const purchaseId = purchaseCard.getAttribute('data-id');
        this.handlePurchaseClick(purchaseId);
      }
    });

    debugLog('Purchases view events bound');
  }

  /**
   * Handle eBay login action (silent)
   */
  async handleEbayLogin() {
    debugLog('Handling eBay login');
    
    try {
      // Show subtle loading state on the button
      const btn = this.container.querySelector('#btn-ebay-login');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Authenticating...';
        btn.disabled = true;
        
        const { oauthService } = await import("../services/auth/oauth.js");
        await oauthService.authenticate();
        
        // Restore button state
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    } catch (error) {
      debugLog('eBay login error', error);
      
      // Restore button state on error
      const btn = this.container.querySelector('#btn-ebay-login');
      if (btn) {
        btn.innerHTML = '🔐 eBay Login';
        btn.disabled = false;
      }
      
      // Only show error if it's not a silent failure
      if (error.message && !error.message.includes('timeout')) {
        showError(`eBay authentication failed: ${error.message}`);
      }
    }
  }

  async handleRefresh() {
    debugLog('Handling refresh');
    
    try {
      showInfo('Refreshing purchases...');
      await purchasesService.loadPurchases({ limit: 100 });
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
    
    // Find the purchase data
    const purchase = purchasesService.getCurrentPurchases().find(p => 
      (p._id || p.id) === purchaseId
    );
    
    if (!purchase) {
      showError('Purchase not found');
      return;
    }
    
    // Generate modal content
    const productName = purchase.product_name || purchase.items?.[0]?.productName || 'Unknown Item';
    const brand = purchase.brand || purchase.supplier || 'Unknown';
    const modalTitle = `${brand} ${productName}`;
    const modalContent = renderPurchaseDetailsModal(purchase);
    
    // Show modal
    showModal({
      title: modalTitle,
      content: modalContent,
      size: 'large',
      onClose: () => {
        debugLog('Purchase details modal closed');
      }
    });
  }

  /**
   * Handle select all checkbox change
   * @param {HTMLInputElement} selectAllCheckbox - Select all checkbox element
   */
  handleSelectAllChange(selectAllCheckbox) {
    const isChecked = selectAllCheckbox.checked;
    const allCheckboxes = this.container.querySelectorAll('.purchase-checkbox:not(#select-all-purchases)');
    
    debugLog(`Select all changed: ${isChecked}`);
    
    // Update all individual checkboxes
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    
    // Update selected count display
    this.updateSelectedCount();
  }

  /**
   * Handle checkbox change
   * @param {HTMLInputElement} checkbox - Checkbox element
   */
  handleCheckboxChange(checkbox) {
    const purchaseId = checkbox.getAttribute('data-purchase-id');
    const isChecked = checkbox.checked;
    
    debugLog(`Checkbox changed for purchase ${purchaseId}: ${isChecked}`);
    
    // Update select all checkbox state
    this.updateSelectAllState();
    
    // Update selected count display
    this.updateSelectedCount();
  }

  /**
   * Update select all checkbox state
   */
  updateSelectAllState() {
    const selectAllCheckbox = this.container.querySelector('#select-all-purchases');
    if (!selectAllCheckbox) return;

    const allCheckboxes = this.container.querySelectorAll('.purchase-checkbox:not(#select-all-purchases)');
    const checkedCheckboxes = this.container.querySelectorAll('.purchase-checkbox:not(#select-all-purchases):checked');
    
    if (checkedCheckboxes.length === 0) {
      selectAllCheckbox.indeterminate = false;
      selectAllCheckbox.checked = false;
    } else if (checkedCheckboxes.length === allCheckboxes.length) {
      selectAllCheckbox.indeterminate = false;
      selectAllCheckbox.checked = true;
    } else {
      selectAllCheckbox.indeterminate = true;
      selectAllCheckbox.checked = false;
    }
  }

  /**
   * Update selected count display
   */
  updateSelectedCount() {
    const checkedCheckboxes = this.container.querySelectorAll('.purchase-checkbox:not(#select-all-purchases):checked');
    const count = checkedCheckboxes.length;
    
    // Update status bar or add selected count display
    debugLog(`${count} purchases selected`);
    
    // You can add a selected count display here if needed
    if (count > 0) {
      showInfo(`${count} purchase${count > 1 ? 's' : ''} selected`);
    }
  }

  /**
   * Get selected purchase IDs
   * @returns {Array} Array of selected purchase IDs
   */
  getSelectedPurchases() {
    const checkedCheckboxes = this.container.querySelectorAll('.purchase-checkbox:not(#select-all-purchases):checked');
    return Array.from(checkedCheckboxes).map(cb => cb.getAttribute('data-purchase-id'));
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
  async handleOAuthLogin() {
    console.log("Manual OAuth login triggered");
    try {
      const { oauthService } = await import("../services/auth/oauth.js");
      await oauthService.authenticate();
    } catch (error) {
      console.error("OAuth login error", error);
    }
  }

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
