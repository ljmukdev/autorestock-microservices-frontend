/**
 * StockPilot Purchases Service
 * Main controller for purchase-related functionality
 */

import { getPurchases, syncPurchases, handlePurchaseApiError } from './api.js';
import { mapEbayDataToPurchases } from './mapper.js';
import { renderPurchaseHistory, renderStatusBar, renderErrorState, renderLoadingState, renderEmptyState } from './ui.js';
import { FORCE_LIVE, USE_SAMPLE, debugLog } from '../../core/config.js';
import { updateStatusBar } from '../../core/utils.js';

class PurchasesService {
  constructor() {
    this.currentPurchases = [];
    this.isLoading = false;
    this.lastSync = new Date();
  }

  /**
   * Load purchases from API or sample data
   * @param {Object} options - Load options
   * @returns {Promise<Array>} Array of purchases
   */
  async loadPurchases(options = {}) {
    const { limit = 100, showLoading = true } = options;
    
    if (this.isLoading) {
      debugLog('Purchase load already in progress');
      return this.currentPurchases;
    }

    this.isLoading = true;
    
    if (showLoading) {
      updateStatusBar({ message: 'Loading purchases...', type: 'info' });
    }

    try {
      debugLog('Loading purchases', { FORCE_LIVE, USE_SAMPLE, limit });

      // Live data (default) - NO silent fallback to localStorage
      if (FORCE_LIVE || !USE_SAMPLE) {
        const response = await getPurchases({ limit });
        
        if (response.success && response.data) {
          // Check if we have actual purchase data
          const hasPurchases = response.data.orders?.length > 0 || 
                              response.data.recentPurchases?.length > 0 ||
                              response.data.summary?.totalPurchases > 0;
          
          if (hasPurchases) {
            const purchases = mapEbayDataToPurchases(response.data);
            this.currentPurchases = purchases;
            this.lastSync = new Date();
            
            debugLog(`Loaded ${purchases.length} live purchases`);
            updateStatusBar({ 
              message: `✅ Live data loaded (${purchases.length} purchases)`, 
              type: 'success' 
            });
            
            return purchases;
          } else {
            // No purchases due to auth failure or empty account
            this.currentPurchases = [];
            this.lastSync = new Date();
            
            debugLog('Live service returned no purchases (likely auth issue)');
            updateStatusBar({ 
              message: '⚠️ No purchases found. OAuth may need refresh.', 
              type: 'warning' 
            });
            
            return [];
          }
        }

        throw new Error('Live service returned invalid response.');
      }

      // Explicit sample mode
      if (USE_SAMPLE) {
        debugLog('Using sample data by request');
        const samplePurchases = this.getSamplePurchases();
        this.currentPurchases = samplePurchases;
        
        updateStatusBar({ 
          message: `🧪 Sample data loaded (${samplePurchases.length} purchases)`, 
          type: 'info' 
        });
        
        return samplePurchases;
      }

      throw new Error('No data source available');

    } catch (error) {
      debugLog('Error loading purchases', error);
      
      const errorInfo = handlePurchaseApiError(error);
      updateStatusBar({ 
        message: `❌ Error: ${errorInfo.message}`, 
        type: 'error' 
      });
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Sync purchases from eBay
   * @returns {Promise<Array>} Array of synced purchases
   */
  async syncPurchases() {
    if (this.isLoading) {
      debugLog('Sync already in progress');
      return this.currentPurchases;
    }

    this.isLoading = true;
    updateStatusBar({ message: 'Syncing purchases from eBay...', type: 'info' });

    try {
      const response = await syncPurchases({ limit: 100 });
      
      if (response.success && response.data) {
        const purchases = mapEbayDataToPurchases(response.data);
        this.currentPurchases = purchases;
        this.lastSync = new Date();
        
        debugLog(`Synced ${purchases.length} purchases`);
        updateStatusBar({ 
          message: `✅ Synced ${purchases.length} purchases`, 
          type: 'success' 
        });
        
        return purchases;
      }

      throw new Error('Sync returned no data.');

    } catch (error) {
      debugLog('Error syncing purchases', error);
      
      const errorInfo = handlePurchaseApiError(error);
      updateStatusBar({ 
        message: `❌ Sync failed: ${errorInfo.message}`, 
        type: 'error' 
      });
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get current purchases
   * @returns {Array} Current purchases array
   */
  getCurrentPurchases() {
    return this.currentPurchases;
  }

  /**
   * Get purchase statistics
   * @returns {Object} Statistics object
   */
  getPurchaseStats() {
    const purchases = this.currentPurchases;
    
    const totalInvestment = purchases.reduce((sum, p) => {
      if (p.totalAmount != null) return sum + Number(p.totalAmount || 0);
      if (p.total_paid != null) return sum + Number(p.total_paid || 0);
      return sum + Number(p.price_paid || 0) + Number(p.shipping_cost || 0) + Number(p.fees || 0);
    }, 0);
    
    const averagePurchase = purchases.length ? totalInvestment / purchases.length : 0;
    
    const manual = purchases.filter(p => (p.source === 'manual') || !p.source).length;
    const auto = purchases.length - manual;
    
    return {
      totalInvestment,
      purchaseCount: purchases.length,
      averagePurchase,
      lastSync: this.lastSync,
      sourceBreakdown: { manual, auto },
      monthlyChange: '+12%' // Placeholder
    };
  }

  /**
   * Render purchases UI
   * @param {Element} container - Container element
   * @param {Object} options - Render options
   */
  renderPurchases(container, options = {}) {
    if (!container) {
      debugLog('No container provided for rendering');
      return;
    }

    const {
      showStatusBar = true,
      showHistory = true,
      ...renderOptions
    } = options;

    let html = '';

    // Status bar
    if (showStatusBar) {
      const stats = this.getPurchaseStats();
      html += renderStatusBar(stats);
    }

    // Purchase history
    if (showHistory) {
      if (this.currentPurchases.length === 0) {
        // Check if this is likely an auth issue
        const stats = this.getPurchaseStats();
        const isAuthIssue = stats.purchaseCount === 0 && !USE_SAMPLE;
        const emptyMessage = isAuthIssue ? 
          'No purchases found. OAuth authentication may be required.' : 
          'No purchases found';
        const emptyType = isAuthIssue ? 'auth' : 'empty';
        
        html += `
          <div class="recent-activity">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h3 style="margin:0; color:#1a365d; font-size:18px; display:flex; align-items:center; gap:8px;">
                📊 Purchase History & Staging
                <span class="spa-status-badge">0 items</span>
              </h3>
              <div style="display:flex; gap:8px;">
                <button id="btn-add-purchase" class="btn btn-primary" style="padding:6px 12px; font-size:.8rem;">➕ Add Purchase</button>
                <button id="btn-ebay-sync" class="btn btn-info" style="padding:6px 12px; font-size:.8rem;">🛒 Sync eBay</button>
                <button id="btn-ebay-login" class="btn btn-warning" style="padding:6px 12px; font-size:.8rem;">🔐 eBay Login</button>
                <button id="btn-refresh" class="btn btn-secondary" style="padding:6px 12px; font-size:.8rem;">🔄 Refresh</button>
              </div>
            </div>
            <div id="purchaseHistoryContent">
              ${renderEmptyState(emptyMessage, emptyType)}
            </div>
          </div>
        `;
      } else {
        html += renderPurchaseHistory(this.currentPurchases, renderOptions);
      }
    }

    container.innerHTML = html;
    debugLog('Rendered purchases UI', { 
      purchaseCount: this.currentPurchases.length,
      showStatusBar,
      showHistory
    });
  }

  /**
   * Show loading state
   * @param {Element} container - Container element
   * @param {string} message - Loading message
   */
  showLoading(container, message = 'Loading purchases...') {
    if (!container) return;
    
    container.innerHTML = renderLoadingState(message);
    debugLog('Showing loading state', message);
  }

  /**
   * Show error state
   * @param {Element} container - Container element
   * @param {string} message - Error message
   * @param {Function} onRetry - Retry callback
   */
  showError(container, message, onRetry = null) {
    if (!container) return;
    
    container.innerHTML = '';
    container.appendChild(renderErrorState(message, onRetry));
    debugLog('Showing error state', message);
  }

  /**
   * Get sample purchases data
   * @returns {Array} Sample purchases
   */
  getSamplePurchases() {
    return [
      {
        _id: 'sample_1',
        identifier: 'SAMPLE-APPLE-AIRPODS-20250101-001',
        platform: 'eBay',
        brand: 'Apple',
        model: 'AirPods Pro',
        product_name: 'Apple AirPods Pro 2nd Generation',
        purchase_price: 89.99,
        total_paid: 94.98,
        totalAmount: 94.98,
        delivery_status: 'Delivered',
        seller_username: 'tech_deals_uk',
        order_id: 'SAMPLE_ORDER_001',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        purchase_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'ebay-oauth',
        created_at: new Date().toISOString(),
        status: 'Delivered',
        category: 'Electronics',
        items: [{
          productName: 'Apple AirPods Pro 2nd Generation',
          sku: 'AIRPODS_PRO_2',
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99
        }],
        notes: 'Sample purchase data for testing'
      },
      {
        _id: 'sample_2',
        identifier: 'SAMPLE-SAMSUNG-PHONE-20250101-002',
        platform: 'eBay',
        brand: 'Samsung',
        model: 'Galaxy S21',
        product_name: 'Samsung Galaxy S21 128GB',
        purchase_price: 299.99,
        total_paid: 309.99,
        totalAmount: 309.99,
        delivery_status: 'Delivered',
        seller_username: 'mobile_mania',
        order_id: 'SAMPLE_ORDER_002',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        purchase_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'ebay-oauth',
        created_at: new Date().toISOString(),
        status: 'Delivered',
        category: 'Electronics',
        items: [{
          productName: 'Samsung Galaxy S21 128GB',
          sku: 'GALAXY_S21_128',
          quantity: 1,
          unitPrice: 299.99,
          totalPrice: 299.99
        }],
        notes: 'Sample purchase data for testing'
      }
    ];
  }
}

// Create and export service instance
export const purchasesService = new PurchasesService();

// Export class for testing
export { PurchasesService };
