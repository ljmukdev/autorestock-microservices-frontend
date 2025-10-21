/**
 * AutoRestock Purchases View
 * Handles OAuth completion and purchase loading
 */

import oauthService from '../services/auth/oauth.js';
import purchaseService from '../services/purchases/index.js';

class PurchasesView {
  constructor() {
    this.purchaseService = purchaseService;
    this.oauthService = oauthService;
    this.container = document.getElementById('purchases-container');
    window.addEventListener('oauth-completed', this.handleOAuthComplete.bind(this));
    this.init();
  }

  async init() {
    console.log('[PurchasesView] Initializing...');
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
    this.container.innerHTML = `
      <div class="purchases-header" style="margin-bottom:24px;">
        <h2 style="font-size:24px;font-weight:bold;color:#1e3a5f;">eBay Purchases</h2>
        <p style="color:#6b7280;">Showing ${purchases.length} purchases</p>
      </div>
      <div class="purchases-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
        ${purchases.map(p => `
          <div class="purchase-card" style="background:white;border-radius:8px;padding:20px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;color:#1e3a5f;">${p.title}</h3>
            <p style="font-size:14px;color:#6b7280;margin-bottom:4px;">Seller: ${p.sellerUserID}</p>
            <p style="font-size:14px;color:#6b7280;margin-bottom:4px;">Price: £${p.price}</p>
            <p style="font-size:14px;color:#6b7280;margin-bottom:4px;">Date: ${new Date(p.transactionDate).toLocaleDateString()}</p>
            <span style="display:inline-block;padding:4px 12px;border-radius:12px;background:#10b981;color:white;font-size:12px;font-weight:600;margin-top:8px;">${p.itemStatus}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

export default PurchasesView;