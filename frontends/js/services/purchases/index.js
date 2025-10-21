/**
 * AutoRestock Purchases Service
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
        message: `❌ ${errorInfo.message}`, 
        type: 'error' 
      });
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Sync purchases from eBay
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync result
   */
  async syncPurchases(options = {}) {
    const { days = 7, limit = 100 } = options;
    
    debugLog('Starting purchase sync', { days, limit });
    updateStatusBar({ message: 'Syncing purchases from eBay...', type: 'info' });
    
    try {
      const response = await syncPurchases({ days, limit });
      
      if (response.success) {
        // Reload purchases after sync
        await this.loadPurchases({ limit, showLoading: false });
        
        updateStatusBar({ 
          message: `✅ Sync complete (${this.currentPurchases.length} purchases)`, 
          type: 'success' 
        });
        
        return response;
      } else {
        throw new Error(response.message || 'Sync failed');
      }
    } catch (error) {
      debugLog('Error syncing purchases', error);
      
      updateStatusBar({ 
        message: `❌ Sync failed: ${error.message}`, 
        type: 'error' 
      });
      
      throw error;
    }
  }

  /**
   * Get sample purchases for testing
   * @returns {Array} Sample purchases
   */
  getSamplePurchases() {
    return [
      {
        _id: 'sample-1',
        platform: 'eBay',
        product_name: 'iPhone 15 Pro Max 256GB',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        purchase_price: 1199.99,
        seller_username: 'techstore_uk',
        purchase_date: '2024-01-15',
        delivery_status: 'Delivered',
        source: 'sample'
      },
      {
        _id: 'sample-2',
        platform: 'eBay',
        product_name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        purchase_price: 1299.99,
        seller_username: 'mobile_deals',
        purchase_date: '2024-01-10',
        delivery_status: 'Shipped',
        source: 'sample'
      },
      {
        _id: 'sample-3',
        platform: 'eBay',
        product_name: 'Nintendo Switch OLED',
        brand: 'Nintendo',
        model: 'Switch OLED',
        purchase_price: 349.99,
        seller_username: 'gaming_central',
        purchase_date: '2024-01-05',
        delivery_status: 'Delivered',
        source: 'sample'
      }
    ];
  }

  /**
   * Get current purchases
   * @returns {Array} Current purchases
   */
  getCurrentPurchases() {
    return this.currentPurchases;
  }

  /**
   * Get last sync time
   * @returns {Date} Last sync time
   */
  getLastSync() {
    return this.lastSync;
  }

  /**
   * Check if currently loading
   * @returns {boolean} Loading state
   */
  isLoadingPurchases() {
    return this.isLoading;
  }
}

// Create and export service instance
export const purchasesService = new PurchasesService();

// Export class for testing
export { PurchasesService };