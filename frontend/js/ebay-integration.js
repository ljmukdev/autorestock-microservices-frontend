/**
 * eBay Integration for Frontend
 * Handles OAuth flow and data synchronization in the browser
 */

class EbayIntegration {
  constructor() {
    this.baseUrl = 'https://stockpilot-ebay-oauth-production.up.railway.app';
    this.isAuthenticated = false;
    this.tokenStatus = null;
    this.syncInterval = null;
    this.autoSyncEnabled = false;
  }

  /**
   * Initialize eBay integration
   */
  async initialize() {
    console.log('🚀 Initializing eBay Integration...');
    
    try {
      // Check current authentication status
      const status = await this.checkAuthenticationStatus();
      
      if (status.authenticated) {
        console.log('✅ eBay integration is authenticated');
        this.isAuthenticated = true;
        this.tokenStatus = status;
        return { success: true, message: 'Already authenticated' };
      } else {
        console.log('⚠️  eBay integration needs authentication');
        return { success: false, message: 'Authentication required' };
      }
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthenticationStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ebay/default_user/test`);
      const data = await response.json();
      
      return {
        authenticated: !data.token_status.is_expired,
        expiresAt: data.token_status.expires_at,
        needsRefresh: data.token_status.is_expired
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false, needsRefresh: true };
    }
  }

  /**
   * Start OAuth flow
   */
  async startOAuthFlow() {
    console.log('🔐 Starting eBay OAuth flow...');
    
    try {
      // Open OAuth URL in new window
      const oauthUrl = `${this.baseUrl}/ebay-oauth/login`;
      const oauthWindow = window.open(
        oauthUrl,
        'eBayOAuth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (oauthWindow.closed) {
            clearInterval(checkClosed);
            // Check if authentication was successful
            this.checkAuthenticationStatus().then(status => {
              if (status.authenticated) {
                this.isAuthenticated = true;
                this.tokenStatus = status;
                resolve({ success: true, message: 'OAuth completed successfully' });
              } else {
                reject(new Error('OAuth was cancelled or failed'));
              }
            });
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!oauthWindow.closed) {
            oauthWindow.close();
          }
          reject(new Error('OAuth timeout'));
        }, 300000);
      });
    } catch (error) {
      console.error('OAuth flow error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get recent purchases
   */
  async getRecentPurchases(limit = 10) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please complete OAuth flow first.');
    }

    try {
      console.log(`📦 Fetching ${limit} recent purchases...`);
      
      const response = await fetch(`${this.baseUrl}/api/ebay/default_user/purchases?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data,
          summary: data.data.summary || {}
        };
      } else {
        throw new Error('Failed to fetch purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sales data
   */
  async getSalesData(limit = 10) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please complete OAuth flow first.');
    }

    try {
      console.log(`💰 Fetching ${limit} recent sales...`);
      
      const response = await fetch(`${this.baseUrl}/api/ebay/default_user/sales?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data,
          summary: data.data.summary || {}
        };
      } else {
        throw new Error('Failed to fetch sales');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get account summary
   */
  async getAccountSummary() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please complete OAuth flow first.');
    }

    try {
      console.log('👤 Fetching account summary...');
      
      const response = await fetch(`${this.baseUrl}/api/ebay/default_user/account-summary`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        throw new Error('Failed to fetch account summary');
      }
    } catch (error) {
      console.error('Error fetching account summary:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync all eBay data
   */
  async syncAllData() {
    console.log('🔄 Syncing all eBay data...');
    
    const results = {
      purchases: null,
      sales: null,
      account: null,
      success: false,
      errors: []
    };

    try {
      // Check authentication first
      const authStatus = await this.checkAuthenticationStatus();
      
      if (!authStatus.authenticated) {
        throw new Error('Authentication required. Please complete OAuth flow.');
      }

      // Fetch all data
      const [purchasesResult, salesResult, accountResult] = await Promise.allSettled([
        this.getRecentPurchases(50),
        this.getSalesData(50),
        this.getAccountSummary()
      ]);

      // Process results
      if (purchasesResult.status === 'fulfilled' && purchasesResult.value.success) {
        results.purchases = purchasesResult.value;
        console.log(`✅ Purchases: ${purchasesResult.value.summary.total_purchases || 0} items`);
      } else {
        const error = purchasesResult.reason?.message || 'Unknown error';
        results.errors.push(`Purchases: ${error}`);
        console.log(`❌ Purchases failed: ${error}`);
      }

      if (salesResult.status === 'fulfilled' && salesResult.value.success) {
        results.sales = salesResult.value;
        console.log(`✅ Sales: ${salesResult.value.summary.total_sales || 0} items`);
      } else {
        const error = salesResult.reason?.message || 'Unknown error';
        results.errors.push(`Sales: ${error}`);
        console.log(`❌ Sales failed: ${error}`);
      }

      if (accountResult.status === 'fulfilled' && accountResult.value.success) {
        results.account = accountResult.value;
        console.log('✅ Account data retrieved');
      } else {
        const error = accountResult.reason?.message || 'Unknown error';
        results.errors.push(`Account: ${error}`);
        console.log(`❌ Account failed: ${error}`);
      }

      results.success = results.purchases || results.sales || results.account;

      console.log(`\n📊 Sync completed: ${results.success ? 'Success' : 'Failed'}`);
      if (results.errors.length > 0) {
        console.log('⚠️  Errors:', results.errors);
      }

      return results;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      results.errors.push(`Sync: ${error.message}`);
      return results;
    }
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(intervalMinutes = 30) {
    if (this.autoSyncEnabled) {
      console.log('⚠️  Auto-sync is already enabled');
      return;
    }

    console.log(`🔄 Starting auto-sync every ${intervalMinutes} minutes...`);
    
    this.autoSyncEnabled = true;
    this.syncInterval = setInterval(async () => {
      console.log(`⏰ Auto-sync triggered at ${new Date().toLocaleString()}`);
      await this.syncAllData();
    }, intervalMinutes * 60 * 1000);

    console.log('✅ Auto-sync started');
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.autoSyncEnabled = false;
      console.log('⏹️  Auto-sync stopped');
    }
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      authenticated: this.isAuthenticated,
      autoSyncEnabled: this.autoSyncEnabled,
      tokenStatus: this.tokenStatus,
      lastSync: this.lastSync || 'Never'
    };
  }

  /**
   * Format purchase data for display
   */
  formatPurchaseData(purchaseData) {
    if (!purchaseData || !purchaseData.orders) {
      return { summary: 'No data available', items: [] };
    }

    const orders = purchaseData.orders;
    const summary = purchaseData.summary || {};

    return {
      summary: {
        totalPurchases: summary.total_purchases || 0,
        totalSpent: summary.total_spent || 0,
        averagePrice: summary.average_price || 0
      },
      items: orders.map(order => ({
        orderId: order.orderId,
        date: order.creationTime,
        status: order.orderStatus,
        total: order.total,
        items: order.lineItems || []
      }))
    };
  }

  /**
   * Show authentication prompt
   */
  showAuthPrompt() {
    const modal = document.createElement('div');
    modal.className = 'ebay-auth-modal';
    modal.innerHTML = `
      <div class="ebay-auth-content">
        <h3>🔐 eBay Authentication Required</h3>
        <p>To sync your eBay data, you need to authenticate with eBay.</p>
        <button id="start-oauth-btn" class="btn btn-primary">Connect to eBay</button>
        <button id="cancel-auth-btn" class="btn btn-secondary">Cancel</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .ebay-auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .ebay-auth-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .btn {
        padding: 0.5rem 1rem;
        margin: 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-primary {
        background: #007bff;
        color: white;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Handle button clicks
    document.getElementById('start-oauth-btn').onclick = async () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
      await this.startOAuthFlow();
    };

    document.getElementById('cancel-auth-btn').onclick = () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    };
  }
}

// Create global instance
const ebayIntegration = new EbayIntegration();

// Make available globally
window.ebayIntegration = ebayIntegration;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 eBay Integration loaded');
  
  // Check if we're on a page that needs eBay data
  if (document.querySelector('[data-ebay-integration]')) {
    const initResult = await ebayIntegration.initialize();
    
    if (!initResult.success) {
      console.log('⚠️  eBay integration needs authentication');
      // You can show a prompt or button to start OAuth
    }
  }
});

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EbayIntegration, ebayIntegration };
}
