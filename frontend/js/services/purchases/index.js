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
      viewMode = 'list',
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
                <button id="btn-add-purchase" class="btn btn-primary btn-small">➕ Add Purchase</button>
                <button id="btn-ebay-sync" class="btn btn-info btn-small">🛒 Sync eBay</button>
                <button id="btn-ebay-login" class="btn btn-warning btn-small">🔐 eBay Login</button>
                <button id="btn-refresh" class="btn btn-secondary btn-small">🔄 Refresh</button>
              </div>
            </div>
            <div id="purchaseHistoryContent">
              ${renderEmptyState(emptyMessage, emptyType)}
            </div>
          </div>
        `;
      } else {
        html += renderPurchaseHistory(this.currentPurchases, { ...renderOptions, viewMode });
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
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
      {
        _id: 'sample_1',
        identifier: 'SAMPLE-APPLE-AIRPODS-20250101-001',
        platform: 'eBay',
        brand: 'Apple',
        model: 'AirPods Pro',
        product_name: 'Apple AirPods 3rd Generation Wireless In-Ear Headset - White',
        product_id: 'AIRPODS_PRO_2',
        condition: 'New',
        purchase_price: 10.71,
        total_paid: 13.65,
        totalAmount: 13.65,
        shipping_cost: 2.45,
        fees: 0.00,
        tax: 0.49,
        vat: 0.49,
        discount: 0.00,
        delivery_status: 'Delivered',
        seller_username: 'tech_deals_uk',
        seller_id: 'tech_deals_uk_123',
        seller_rating: '99.8%',
        order_id: '02-13587-96908',
        transaction_id: 'TXN_001_APPLE',
        payment_status: 'Paid',
        payment_method: 'Master Card credit card ending in 2589',
        card_ending: '2589',
        payment_name: 'Jacob Loynes',
        tracking_ref: 'H05QTA0085226061',
        carrier: 'Royal Mail',
        shipping_method: 'Standard tracked delivery',
        delivery_address: 'Lisa Husband\n6 Papyrus Villas, Newton Kyme\nTadcaster, North Yorkshire LS24 9LX\nUnited Kingdom',
        delivery_name: 'Lisa Husband',
        shipping_address: '6 Papyrus Villas, Newton Kyme, Tadcaster, North Yorkshire LS24 9LX, United Kingdom',
        billing_address: '6 Papyrus Villas, Newton Kyme, Tadcaster, North Yorkshire LS24 9LX, United Kingdom',
        item_number: '286807902770',
        returns_accepted: false,
        expected_delivery: 'Thu 18 Sep',
        delivery_progress: 'The courier has the package',
        country: 'United Kingdom',
        currency: 'GBP',
        language: 'en',
        orderDate: twoDaysAgo.toISOString(),
        purchase_date: twoDaysAgo.toISOString().split('T')[0],
        payment_date: twoDaysAgo.toISOString(),
        shipped_date: new Date(twoDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivered_date: new Date(twoDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'ebay-oauth',
        created_at: twoDaysAgo.toISOString(),
        updatedAt: new Date(twoDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        category: 'Electronics',
        api_version: 'v1.0',
        last_synced: new Date().toISOString(),
        data_quality_score: '95%',
        items: [{
          productName: 'Apple AirPods 3rd Generation Wireless In-Ear Headset - White',
          sku: 'AIRPODS_3RD_GEN',
          quantity: 1,
          unitPrice: 10.71,
          totalPrice: 10.71,
          description: 'Apple AirPods 3rd Generation Wireless In-Ear Headset - White'
        }],
        notes: 'Sample purchase data for testing - high quality item from trusted seller'
      },
      {
        _id: 'sample_2',
        identifier: 'SAMPLE-SAMSUNG-PHONE-20250101-002',
        platform: 'eBay',
        brand: 'Samsung',
        model: 'Galaxy S21',
        product_name: 'Samsung Galaxy S21 128GB',
        product_id: 'GALAXY_S21_128',
        condition: 'Refurbished',
        purchase_price: 299.99,
        total_paid: 309.99,
        totalAmount: 309.99,
        shipping_cost: 5.99,
        fees: 2.50,
        tax: 1.51,
        discount: 0.00,
        delivery_status: 'Delivered',
        seller_username: 'mobile_mania',
        seller_id: 'mobile_mania_456',
        seller_rating: '98.5%',
        order_id: 'SAMPLE_ORDER_002',
        transaction_id: 'TXN_002_SAMSUNG',
        payment_status: 'Paid',
        payment_method: 'Credit Card',
        tracking_ref: 'TRK987654321',
        carrier: 'DPD',
        shipping_method: 'Express Delivery',
        shipping_address: '456 Oak Avenue, Manchester, M1 1AA',
        billing_address: '456 Oak Avenue, Manchester, M1 1AA',
        country: 'United Kingdom',
        currency: 'GBP',
        language: 'en',
        orderDate: fiveDaysAgo.toISOString(),
        purchase_date: fiveDaysAgo.toISOString().split('T')[0],
        payment_date: fiveDaysAgo.toISOString(),
        shipped_date: new Date(fiveDaysAgo.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivered_date: new Date(fiveDaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'ebay-oauth',
        created_at: fiveDaysAgo.toISOString(),
        updatedAt: new Date(fiveDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        category: 'Electronics',
        api_version: 'v1.0',
        last_synced: new Date().toISOString(),
        data_quality_score: '92%',
        items: [{
          productName: 'Samsung Galaxy S21 128GB',
          sku: 'GALAXY_S21_128',
          quantity: 1,
          unitPrice: 299.99,
          totalPrice: 299.99,
          description: 'Android smartphone with 128GB storage, excellent condition'
        }],
        notes: 'Sample purchase data for testing - refurbished phone in great condition'
      },
      {
        _id: 'sample_3',
        identifier: 'SAMPLE-NINTENDO-SWITCH-20250101-003',
        platform: 'eBay',
        brand: 'Nintendo',
        model: 'Switch OLED',
        product_name: 'Nintendo Switch OLED Model',
        product_id: 'SWITCH_OLED',
        condition: 'New',
        purchase_price: 249.99,
        total_paid: 259.99,
        totalAmount: 259.99,
        shipping_cost: 4.99,
        fees: 2.00,
        tax: 3.01,
        discount: 0.00,
        delivery_status: 'Shipped',
        seller_username: 'gaming_paradise',
        seller_id: 'gaming_paradise_789',
        seller_rating: '99.2%',
        order_id: 'SAMPLE_ORDER_003',
        transaction_id: 'TXN_003_NINTENDO',
        payment_status: 'Paid',
        payment_method: 'PayPal',
        tracking_ref: 'TRK456789123',
        carrier: 'Hermes',
        shipping_method: 'Standard Delivery',
        shipping_address: '789 Pine Road, Birmingham, B1 1AA',
        billing_address: '789 Pine Road, Birmingham, B1 1AA',
        country: 'United Kingdom',
        currency: 'GBP',
        language: 'en',
        orderDate: oneWeekAgo.toISOString(),
        purchase_date: oneWeekAgo.toISOString().split('T')[0],
        payment_date: oneWeekAgo.toISOString(),
        shipped_date: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivered_date: null,
        source: 'ebay-oauth',
        created_at: oneWeekAgo.toISOString(),
        updatedAt: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Shipped',
        category: 'Gaming',
        api_version: 'v1.0',
        last_synced: new Date().toISOString(),
        data_quality_score: '98%',
        items: [{
          productName: 'Nintendo Switch OLED Model',
          sku: 'SWITCH_OLED',
          quantity: 1,
          unitPrice: 249.99,
          totalPrice: 249.99,
          description: 'Latest Nintendo Switch with OLED display'
        }],
        notes: 'Sample purchase data for testing - brand new gaming console'
      }
    ];
  }
}

// Create and export service instance
export const purchasesService = new PurchasesService();

// Export class for testing
export { PurchasesService };


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

                <button id="btn-add-purchase" class="btn btn-primary btn-small">➕ Add Purchase</button>

                <button id="btn-ebay-sync" class="btn btn-info btn-small">🛒 Sync eBay</button>

                <button id="btn-ebay-login" class="btn btn-warning btn-small">🔐 eBay Login</button>

                <button id="btn-refresh" class="btn btn-secondary btn-small">🔄 Refresh</button>

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

                <button id="btn-add-purchase" class="btn btn-primary btn-small">➕ Add Purchase</button>

                <button id="btn-ebay-sync" class="btn btn-info btn-small">🛒 Sync eBay</button>

                <button id="btn-ebay-login" class="btn btn-warning btn-small">🔐 eBay Login</button>

                <button id="btn-refresh" class="btn btn-secondary btn-small">🔄 Refresh</button>

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


