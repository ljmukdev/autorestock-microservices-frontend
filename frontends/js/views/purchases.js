/**
 * File: purchases.js
 * Location: c:\development\Projects\autorestock\frontends\js\views\purchases.js
 * 
 * AutoRestock Purchases View
 * Handles OAuth completion and purchase loading
 * 
 * FIXES:
 * - Removed custom purple background/white frame styling (uses app's existing frame)
 * - Fixed OAuth flow to properly redirect to eBay
 * - Added proper error handling and connection checking
 * - Added account switching capability
 * - Integrates properly with main app styling
 */

import { oauthService } from '../services/auth/oauth.js';
import { purchaseService } from '../services/purchases/index.js';

class PurchasesView {
  constructor() {
    this.purchaseService = purchaseService;
    this.oauthService = oauthService;
    this.container = null;
    this.cachedPurchases = []; // Store purchases for filtering
    window.addEventListener('oauth-completed', this.handleOAuthComplete.bind(this));
  }

  async init(container) {
    console.log('[PurchasesView] Initializing...');
    this.container = container || document.getElementById('tab-purchases');
    
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oauth') === 'success') {
      console.log('[PurchasesView] OAuth success detected, loading purchases...');
      await this.loadPurchases();
      return;
    }
    
    // Check connection status
    const isConnected = await this.oauthService.checkConnection();
    if (isConnected) {
      await this.loadPurchases();
    } else {
      this.showConnectPrompt();
    }
  }

  async refresh() {
    console.log('[PurchasesView] Refreshing...');
    await this.init(this.container);
  }

  async handleOAuthComplete(event) {
    console.log('[PurchasesView] OAuth completed event received, loading purchases...');
    setTimeout(async () => {
      await this.loadPurchases();
    }, 1000);
  }

  async loadPurchases() {
    try {
      this.showLoadingState();
      console.log('[PurchasesView] Fetching purchases from API...');
      
      const response = await this.purchaseService.getPurchases({ limit: 100 });
      console.log('[PurchasesView] API response:', response);
      
      if (response.success && response.purchases && response.purchases.length > 0) {
        this.cachedPurchases = response.purchases;
        this.renderPurchases(response.purchases);
      } else {
        this.showEmptyState();
      }
    } catch (error) {
      console.error('[PurchasesView] Error loading purchases:', error);
      if (error.message && (error.message.includes('No access token') || error.message.includes('401'))) {
        this.showConnectPrompt();
      } else {
        this.showErrorState(error.message || 'Failed to load purchases');
      }
    }
  }

  showConnectPrompt() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="card" style="max-width: 600px; margin: 40px auto; text-align: center;">
        <div style="padding: 40px 20px;">
          <div style="font-size: 80px; margin-bottom: 24px;">🛒</div>
          <h2 style="font-size: 28px; font-weight: bold; color: #1a365d; margin-bottom: 16px;">Connect Your eBay Account</h2>
          <p style="font-size: 16px; color: #4a5568; margin-bottom: 32px; line-height: 1.6;">
            Connect your eBay account to automatically sync and track your purchase history.
            You can switch accounts anytime after connecting.
          </p>
          <button id="connect-ebay-btn" class="btn btn-primary" style="
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 14px 36px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s;
          ">
            Connect eBay Account
          </button>
        </div>
      </div>
    `;
    
    const connectBtn = document.getElementById('connect-ebay-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        console.log('[PurchasesView] Connect button clicked, starting OAuth flow...');
        console.log('[PurchasesView] OAuth service:', this.oauthService);
        
        // Show loading state
        connectBtn.disabled = true;
        connectBtn.innerHTML = 'Redirecting to eBay...';
        
        try {
          this.oauthService.startOAuthFlow();
        } catch (error) {
          console.error('[PurchasesView] Error starting OAuth flow:', error);
          connectBtn.disabled = false;
          connectBtn.innerHTML = 'Connect eBay Account';
          alert('Failed to start eBay authentication. Please try again.');
        }
      });
      
      // Add hover effect
      connectBtn.addEventListener('mouseenter', () => {
        connectBtn.style.transform = 'translateY(-2px)';
        connectBtn.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
      });
      connectBtn.addEventListener('mouseleave', () => {
        connectBtn.style.transform = 'translateY(0)';
        connectBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
      });
    }
  }

  showLoadingState() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="card" style="text-align: center; padding: 60px 20px;">
        <div class="spa-spinner" style="width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto 24px; animation: spin 1s linear infinite;"></div>
        <p style="font-size: 16px; color: #6b7280;">Loading your eBay purchases...</p>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
  }

  showEmptyState() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="card" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 80px; margin-bottom: 24px;">📦</div>
        <h2 style="font-size: 28px; font-weight: bold; color: #1a365d; margin-bottom: 16px;">No Purchases Found</h2>
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 32px;">No eBay purchases found in the last 90 days</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="sync-now-btn" class="btn btn-secondary" style="
            background: #10b981;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            Sync Now
          </button>
          <button id="switch-account-empty-btn" class="btn btn-secondary" style="
            background: #6b7280;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            Switch Account
          </button>
        </div>
      </div>
    `;
    
    const syncBtn = document.getElementById('sync-now-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.syncPurchases());
    }
    
    const switchBtn = document.getElementById('switch-account-empty-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        console.log('[PurchasesView] Starting OAuth flow from empty state...');
        this.oauthService.startOAuthFlow();
      });
    }
  }

  showErrorState(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="card" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 80px; margin-bottom: 24px;">⚠️</div>
        <h2 style="font-size: 28px; font-weight: bold; color: #ef4444; margin-bottom: 16px;">Error Loading Purchases</h2>
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 32px;">${message}</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="retry-btn" class="btn btn-primary" style="
            background: #3b82f6;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            Retry
          </button>
          <button id="switch-account-error-btn" class="btn btn-secondary" style="
            background: #6b7280;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            Switch Account
          </button>
        </div>
      </div>
    `;
    
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadPurchases());
    }
    
    const switchBtn = document.getElementById('switch-account-error-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        console.log('[PurchasesView] Starting OAuth flow from error state...');
        this.oauthService.startOAuthFlow();
      });
    }
  }

  async syncPurchases() {
    try {
      this.showLoadingState();
      await this.purchaseService.syncPurchases({ days: 90, limit: 100 });
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
    
    // IMPORTANT: This now renders within the existing app's styled container
    // No custom purple background - uses the app's existing styling in app.html
    this.container.innerHTML = `
      <!-- Header with Account Menu -->
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 18px;">📦</span>
            </div>
            <h2 style="font-size: 24px; font-weight: bold; color: #1a365d; margin: 0;">eBay Purchases Dashboard</h2>
          </div>
          
          <!-- Account Menu -->
          <div class="account-menu" style="position: relative;">
            <button id="account-btn" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #10b981; color: white; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s;">
              <span>👤</span>
              <span>Account</span>
            </button>
            <div id="account-dropdown" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 200px; background: white; border-radius: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; z-index: 50;">
              <button id="switch-account-btn" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; text-align: left; width: 100%; border: none; background: none; cursor: pointer; border-bottom: 1px solid #e5e7eb; transition: background 0.2s;">
                <span>🔄</span>
                <span>Switch eBay Account</span>
              </button>
              <button id="sync-btn" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; text-align: left; width: 100%; border: none; background: none; cursor: pointer; transition: background 0.2s;">
                <span>🔄</span>
                <span>Manual Sync</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Stats Cards -->
      <div class="card" style="margin-bottom: 20px;">
        <h3 class="section-title-small" style="margin-bottom: 16px;">Dashboard Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">${stats.totalPurchases}</div>
            <div style="font-size: 14px; opacity: 0.9;">Total Purchases</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">£${stats.totalSpent.toFixed(2)}</div>
            <div style="font-size: 14px; opacity: 0.9;">Total Spent</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">${stats.itemsShipped}</div>
            <div style="font-size: 14px; opacity: 0.9;">Items Shipped</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">£${stats.averageOrderValue.toFixed(2)}</div>
            <div style="font-size: 14px; opacity: 0.9;">Avg Order Value</div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #4a5568;">Search</label>
            <input id="search-input" type="text" placeholder="Search by title, seller, or item ID..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #4a5568;">Status</label>
            <select id="status-filter" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
              <option value="all">All Statuses</option>
              <option value="Despatched">Despatched</option>
              <option value="Delivered">Delivered</option>
              <option value="In Transit">In Transit</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #4a5568;">Date Range</label>
            <select id="date-filter" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div style="margin-bottom: 16px;">
        <p style="font-size: 14px; color: #6b7280; font-weight: 500;">Showing ${purchases.length} purchases</p>
      </div>

      <!-- Purchases Grid -->
      <div class="purchases-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
        ${purchases.map(p => `
          <div class="purchase-card card" style="transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px; line-height: 1.4; min-height: 40px;">${this.escapeHtml(p.title)}</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Seller:</span>
                  <span style="font-weight: 500; color: #1f2937;">${this.escapeHtml(p.sellerUserID)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Date:</span>
                  <span style="font-weight: 500; color: #1f2937;">${new Date(p.transactionDate).toLocaleDateString('en-GB')}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Price:</span>
                  <span style="font-weight: 500; color: #1f2937;">£${p.price.toFixed(2)}</span>
                </div>
                ${p.shippingCost ? `
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Shipping:</span>
                  <span style="font-weight: 500; color: #1f2937;">£${p.shippingCost.toFixed(2)}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-weight: 600;">Total:</span>
                  <span style="font-weight: bold; color: #1f2937; font-size: 16px;">£${(p.price + (p.shippingCost || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            ${p.trackingNumber ? `
              <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="color: #6b7280; font-size: 12px; font-weight: 500;">Tracking Number:</span>
                  <button onclick="navigator.clipboard.writeText('${p.trackingNumber}'); alert('Tracking number copied!');" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 16px;" title="Copy tracking number">📋</button>
                </div>
                <span style="font-family: 'Courier New', monospace; font-size: 12px; color: #1f2937; word-break: break-all;">${this.escapeHtml(p.trackingNumber)}</span>
              </div>
            ` : ''}
            
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 20px; ${
                p.itemStatus === 'Despatched' ? 'background: #dcfce7; color: #166534;' :
                p.itemStatus === 'Delivered' ? 'background: #dbeafe; color: #1e40af;' :
                p.itemStatus === 'In Transit' ? 'background: #fef3c7; color: #92400e;' :
                p.itemStatus === 'Cancelled' ? 'background: #fee2e2; color: #991b1b;' :
                'background: #f3f4f6; color: #374151;'
              }">${this.escapeHtml(p.itemStatus || 'Unknown')}</span>
              <div style="display: flex; gap: 8px;">
                <button onclick="navigator.clipboard.writeText('${p.itemId}'); alert('Item ID copied!');" style="padding: 6px; background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px;" title="Copy Item ID">📋</button>
                <a href="https://www.ebay.co.uk/itm/${p.itemId}" target="_blank" rel="noopener noreferrer" style="padding: 6px; color: #3b82f6; font-size: 16px; text-decoration: none;" title="View on eBay">🔗</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <style>
        .purchase-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        #account-dropdown button:hover {
          background: #f3f4f6;
        }
        #account-btn:hover {
          background: #059669;
        }
      </style>
    `;
    
    // Add event listeners
    this.addEventListeners();
  }

  calculateStats(purchases) {
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.price + (p.shippingCost || 0), 0);
    const itemsShipped = purchases.filter(p => 
      p.itemStatus === 'Despatched' || 
      p.itemStatus === 'Delivered' || 
      p.itemStatus === 'In Transit'
    ).length;
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
      accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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
        console.log('[PurchasesView] Starting OAuth flow to switch account...');
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
    if (!searchTerm.trim()) {
      this.renderPurchases(this.cachedPurchases);
      return;
    }

    const filtered = this.cachedPurchases.filter(p => {
      const term = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.sellerUserID?.toLowerCase().includes(term) ||
        p.itemId?.toString().includes(term)
      );
    });

    this.renderPurchases(filtered);
  }

  filterByStatus(status) {
    if (status === 'all') {
      this.renderPurchases(this.cachedPurchases);
      return;
    }

    const filtered = this.cachedPurchases.filter(p => p.itemStatus === status);
    this.renderPurchases(filtered);
  }

  filterByDate(days) {
    if (days === 'all') {
      this.renderPurchases(this.cachedPurchases);
      return;
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const filtered = this.cachedPurchases.filter(p => {
      const purchaseDate = new Date(p.transactionDate);
      return purchaseDate >= daysAgo;
    });

    this.renderPurchases(filtered);
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create and export an instance
const purchasesView = new PurchasesView();

// Export as named export to match existing imports
export { purchasesView };