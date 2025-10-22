/**
 * AutoRestock Frontend OAuth Service
 * Handles OAuth callback detection and purchase loading
 */

class OAuthService {
  constructor() {
    this.ebayApiBase = 'https://delightful-liberation-production.up.railway.app';
    this.checkOAuthCallback();
  }

  checkOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthStatus = urlParams.get('oauth');
    const synced = urlParams.get('synced');
    const errorMessage = urlParams.get('message');

    if (oauthStatus === 'success') {
      console.log('[OAuth] ✅ Authentication successful');
      this.showSuccessToast('eBay account connected successfully!');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      if (synced === 'true') {
        console.log('[OAuth] Triggering purchase load...');
        this.triggerPurchaseLoad();
      }
      return { success: true };
    } else if (oauthStatus === 'error') {
      console.error('[OAuth] ❌ Authentication failed:', errorMessage);
      const displayMessage = errorMessage || 'Authentication failed';
      this.showErrorToast(`Failed to connect eBay: ${displayMessage}`);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return { success: false, error: displayMessage };
    }
    return null;
  }

  showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `<div class="toast-content"><span class="toast-icon">✅</span><span class="toast-message">${message}</span></div>`;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:9999;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500;opacity:0;transition:opacity 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 100);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `<div class="toast-content"><span class="toast-icon">❌</span><span class="toast-message">${message}</span></div>`;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:9999;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500;opacity:0;transition:opacity 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 100);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  triggerPurchaseLoad() {
    window.dispatchEvent(new CustomEvent('oauth-completed', { detail: { success: true } }));
  }

  startOAuthFlow() {
    const oauthUrl = `${this.ebayApiBase}/oauth/login`;
    console.log('[OAuth] Starting OAuth flow:', oauthUrl);
    window.location.href = oauthUrl;
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.ebayApiBase}/oauth/status`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return data.connected === true;
    } catch (error) {
      console.error('[OAuth] Connection check failed:', error);
      return false;
    }
  }

  /**
   * Initialize the OAuth service
   */
  async init() {
    try {
      console.log('[OAuth] Initializing OAuth service');
      // Check for OAuth callback on initialization
      const callbackResult = this.checkOAuthCallback();
      return callbackResult;
    } catch (error) {
      console.error('[OAuth] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current authentication status
   * @returns {Object} Authentication status object
   */
  getAuthStatus() {
    try {
      // Check if we have any stored auth data or if we're in a callback state
      const urlParams = new URLSearchParams(window.location.search);
      const oauthStatus = urlParams.get('oauth');
      
      if (oauthStatus === 'success') {
        return {
          authenticated: true,
          status: 'connected',
          message: 'eBay account connected successfully'
        };
      } else if (oauthStatus === 'error') {
        return {
          authenticated: false,
          status: 'error',
          message: urlParams.get('message') || 'Authentication failed'
        };
      }
      
      // Default status - not authenticated
      return {
        authenticated: false,
        status: 'disconnected',
        message: 'Not connected to eBay'
      };
    } catch (error) {
      console.error('[OAuth] Error getting auth status:', error);
      return {
        authenticated: false,
        status: 'error',
        message: 'Error checking authentication status'
      };
    }
  }
}

// Create and export the OAuth service instance
export const oauthService = new OAuthService();

// Debug: Log that the service is being created and exported
console.log('[OAuth] Service instance created and exported:', typeof oauthService);