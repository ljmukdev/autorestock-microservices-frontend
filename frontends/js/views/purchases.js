/**
 * AutoRestock Purchases View
 * Handles OAuth completion and purchase loading
 */

import { oauthService } from '../services/auth/oauth.js';
import { purchaseService } from '../services/purchases/index.js';

class PurchasesView {
  constructor() {
    this.purchaseService = purchaseService;
    this.oauthService = oauthService;
    this.container = null; // Will be set by init()
    window.addEventListener('oauth-completed', this.handleOAuthComplete.bind(this));
  }

  async init(container) {
    console.log('[PurchasesView] Initializing...');
    this.container = container || document.getElementById('tab-purchases');
    const isConnected = await this.oauthService.checkConnection();
    if (isConnected) {
      await this.loadPurchases();
    } else {
      this.showConnectPrompt();
    }
  }

  async handleOAuthComplete(event) {
    console.log('[PurchasesView] OAuth completed, loading purchases...');
    setTimeout(async () => {
      await this.loadPurchases();
    }, 1000);
  }

  async loadPurchases() {
    try {
      this.showLoadingState();
      const response = await this.purchaseService.getPurchases({ limit: 100 });
      if (response.success && response.purchases && response.purchases.length > 0) {
        this.renderPurchases(response.purchases);
      } else {
        this.showEmptyState();
      }
    } catch (error) {
      console.error('[PurchasesView] Error loading purchases:', error);
      if (error.message && error.message.includes('No access token')) {
        this.showConnectPrompt();
      } else {
        this.showErrorState(error.message || 'Failed to load purchases');
      }
    }
  }

  showConnectPrompt() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:60px 20px;">
        <div class="empty-icon" style="font-size:80px;margin-bottom:24px;">🛒</div>
        <h2 style="font-size:28px;font-weight:bold;color:#1e3a5f;margin-bottom:16px;">Connect Your eBay Account</h2>
        <p style="font-size:16px;color:#6b7280;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;">Connect your eBay account to automatically sync and track your purchase history</p>
        <button id="connect-ebay-btn" class="btn btn-primary" style="background:#3b82f6;color:white;padding:12px 32px;border-radius:8px;border:none;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          Connect eBay Account
        </button>
      </div>
    `;
    const connectBtn = document.getElementById('connect-ebay-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        console.log('[PurchasesView] Starting OAuth flow...');
        this.oauthService.startOAuthFlow();
      });
    }
  }

  showLoadingState() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="loading-state" style="text-align:center;padding:60px 20px;">
        <div class="spinner" style="width:48px;height:48px;border:4px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;margin:0 auto 24px;animation:spin 1s linear infinite;"></div>
        <p style="font-size:16px;color:#6b7280;">Loading your eBay purchases...</p>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
  }

  showEmptyState() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:60px 20px;">
        <div class="empty-icon" style="font-size:80px;margin-bottom:24px;">📦</div>
        <h2 style="font-size:28px;font-weight:bold;color:#1e3a5f;margin-bottom:16px;">No Purchases Found</h2>
        <p style="font-size:16px;color:#6b7280;margin-bottom:32px;">No eBay purchases found in the last 90 days</p>
        <button id="sync-now-btn" class="btn btn-secondary" style="background:#10b981;color:white;padding:12px 32px;border-radius:8px;border:none;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          Sync Now
        </button>
      </div>
    `;
    const syncBtn = document.getElementById('sync-now-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.syncPurchases());
    }
  }

  showErrorState(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="error-state" style="text-align:center;padding:60px 20px;">
        <div class="error-icon" style="font-size:80px;margin-bottom:24px;">⚠️</div>
        <h2 style="font-size:28px;font-weight:bold;color:#ef4444;margin-bottom:16px;">Error Loading Purchases</h2>
        <p style="font-size:16px;color:#6b7280;margin-bottom:32px;">${message}</p>
        <button id="retry-btn" class="btn btn-primary" style="background:#3b82f6;color:white;padding:12px 32px;border-radius:8px;border:none;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          Retry
        </button>
      </div>
    `;
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadPurchases());
    }
  }

  async syncPurchases() {
    try {
      this.showLoadingState();
      await this.purchaseService.syncPurchases({ days: 7, limit: 100 });
      setTimeout(() => this.loadPurchases(), 2000);
    } catch (error) {
      console.error('[PurchasesView] Sync error:', error);
      this.showErrorState(error.message || 'Failed to sync purchases');
    }
  }

  renderPurchases(purchases) {
    console.log('[PurchasesView] Rendering', purchases.length, 'purchases');
    if (!this.container) return;
    
    // Calculate dashboard stats
    const stats = this.calculateStats(purchases);
    
    this.container.innerHTML = `
      <div class="dashboard-container" style="background: #7c3aed; min-height: 100vh; padding: 32px;">
        <div class="dashboard-frame" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); padding: 32px; max-width: 1200px; margin: 0 auto;">
          
          <!-- Header -->
          <div class="dashboard-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 18px;">📦</span>
              </div>
              <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 0;">eBay Purchases Dashboard</h1>
            </div>
            
            <!-- Account Menu -->
            <div class="account-menu" style="position: relative;">
              <button id="account-btn" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #10b981; color: white; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">
                <span>👤</span>
                <span>Account</span>
              </button>
              <div id="account-dropdown" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 200px; background: white; border-radius: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; z-index: 50;">
                <button id="switch-account-btn" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; text-align: left; width: 100%; border: none; background: none; cursor: pointer; border-bottom: 1px solid #e5e7eb;">
                  <span>⚙️</span>
                  <span>Switch eBay Account</span>
                </button>
                <button id="sync-btn" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; text-align: left; width: 100%; border: none; background: none; cursor: pointer;">
                  <span>🔄</span>
                  <span>Manual Sync</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Welcome Message -->
          <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">
            Welcome to your eBay purchase management dashboard. Track orders, monitor spending, and manage your purchase history.
          </p>

          <!-- Dashboard Stats -->
          <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 32px;">
            <div class="stat-card" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 24px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">${stats.totalPurchases}</div>
              <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL PURCHASES</div>
            </div>
            
            <div class="stat-card" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 24px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: #10b981; margin-bottom: 8px;">£${stats.totalSpent.toFixed(2)}</div>
              <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL SPENT</div>
            </div>
            
            <div class="stat-card" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 24px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: #f59e0b; margin-bottom: 8px;">${stats.itemsShipped}</div>
              <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">ITEMS SHIPPED</div>
            </div>
            
            <div class="stat-card" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 24px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: #14b8a6; margin-bottom: 8px;">£${stats.averageOrderValue.toFixed(2)}</div>
              <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">AVG ORDER VALUE</div>
            </div>
          </div>

          <!-- Filters Section -->
          <div class="filters-section" style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">Search & Filters</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div style="position: relative;">
                <input type="text" id="search-input" placeholder="Search items or sellers..." style="width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
              </div>
              <select id="status-filter" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <option value="all">All Statuses</option>
                <option value="Despatched">Despatched</option>
                <option value="Delivered">Delivered</option>
                <option value="In Transit">In Transit</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select id="date-filter" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                <option value="all">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>

          <!-- Results Count -->
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; color: #6b7280;">Showing ${purchases.length} purchases</p>
      </div>

          <!-- Purchases Grid -->
          <div class="purchases-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        ${purchases.map(p => `
              <div class="purchase-card" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 24px; transition: box-shadow 0.2s;">
                <div style="margin-bottom: 16px;">
                  <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; line-height: 1.4;">${p.title}</h3>
                  <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Seller:</span>
                      <span style="font-weight: 500; color: #1f2937;">${p.sellerUserID}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Date:</span>
                      <span style="font-weight: 500; color: #1f2937;">${new Date(p.transactionDate).toLocaleDateString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Total:</span>
                      <span style="font-weight: bold; color: #1f2937;">£${(p.price + (p.shippingCost || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                ${p.trackingNumber ? `
                  <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span style="color: #6b7280; font-size: 12px;">Tracking:</span>
                      <button onclick="navigator.clipboard.writeText('${p.trackingNumber}')" style="background: none; border: none; color: #9ca3af; cursor: pointer;">📋</button>
                    </div>
                    <span style="font-family: monospace; font-size: 12px; color: #1f2937;">${p.trackingNumber}</span>
                  </div>
                ` : ''}
                
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 20px; ${
                    p.itemStatus === 'Despatched' ? 'background: #dcfce7; color: #166534;' :
                    p.itemStatus === 'Delivered' ? 'background: #dbeafe; color: #1e40af;' :
                    p.itemStatus === 'In Transit' ? 'background: #fef3c7; color: #92400e;' :
                    p.itemStatus === 'Cancelled' ? 'background: #fee2e2; color: #991b1b;' :
                    'background: #f3f4f6; color: #374151;'
                  }">${p.itemStatus}</span>
                  <div style="display: flex; gap: 8px;">
                    <button onclick="navigator.clipboard.writeText('${p.itemId}')" style="padding: 4px; background: none; border: none; color: #9ca3af; cursor: pointer;" title="Copy Item ID">📋</button>
                    <a href="https://www.ebay.co.uk/itm/${p.itemId}" target="_blank" style="padding: 4px; color: #9ca3af;" title="View on eBay">🔗</a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.addEventListeners();
  }

  calculateStats(purchases) {
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.price + (p.shippingCost || 0), 0);
    const itemsShipped = purchases.filter(p => p.itemStatus === 'Despatched' || p.itemStatus === 'Delivered').length;
    const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    return {
      totalPurchases,
      totalSpent,
      itemsShipped,
      averageOrderValue
    };
  }

  addEventListeners() {
    // Account menu toggle
    const accountBtn = document.getElementById('account-btn');
    const accountDropdown = document.getElementById('account-dropdown');
    
    if (accountBtn && accountDropdown) {
      accountBtn.addEventListener('click', () => {
        accountDropdown.style.display = accountDropdown.style.display === 'none' ? 'block' : 'none';
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!accountBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
          accountDropdown.style.display = 'none';
        }
      });
    }

    // Switch account button
    const switchAccountBtn = document.getElementById('switch-account-btn');
    if (switchAccountBtn) {
      switchAccountBtn.addEventListener('click', () => {
        console.log('[PurchasesView] Starting OAuth flow...');
        this.oauthService.startOAuthFlow();
      });
    }

    // Sync button
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        this.syncPurchases();
      });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterPurchases(e.target.value);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterByStatus(e.target.value);
      });
    }

    // Date filter
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => {
        this.filterByDate(e.target.value);
      });
    }
  }

  filterPurchases(searchTerm) {
    // This would filter the displayed purchases based on search term
    console.log('[PurchasesView] Filtering by search term:', searchTerm);
    // Implementation would filter the current purchases array
  }

  filterByStatus(status) {
    console.log('[PurchasesView] Filtering by status:', status);
    // Implementation would filter by status
  }

  filterByDate(days) {
    console.log('[PurchasesView] Filtering by date:', days);
    // Implementation would filter by date range
  }
}

// Create and export an instance
const purchasesView = new PurchasesView();

// Export as named export to match existing imports
export { purchasesView };