/**
 * StockPilot OAuth Service with Auto-Redirect
 */

import { API_ENDPOINTS, debugLog } from '../../core/config.js';
import { setOAuthRedirectHandler } from '../../core/http.js';

class OAuthService {
  constructor() {
    this.isAuthenticating = false;
    this.authWindow = null;
    this.authPromise = null;
    
    // Register this service as the OAuth redirect handler
    setOAuthRedirectHandler((failedUrl) => this.handleAuthFailure(failedUrl));
  }

  /**
   * Check if user is authenticated by testing actual data response
   */
  async checkAuthStatus() {
    try {
      debugLog('Checking eBay OAuth authentication status...');
      
      const response = await fetch(`${API_ENDPOINTS.PURCHASES}?limit=1`);
      
      if (!response.ok) {
        debugLog('Auth status check - HTTP error', { status: response.status });
        return false;
      }
      
      const data = await response.json();
      debugLog('Auth check response data:', data);
      
      // Check if we have actual purchase orders or if it's an auth issue
      const hasOrders = data.data && (data.data.orders?.length > 0 || data.data.recentPurchases?.length > 0);
      const hasValidResponse = data.success === true;
      
      // If no orders but response is successful, check if it's due to no purchases vs auth failure
      if (!hasOrders && hasValidResponse) {
        // Look for indicators that suggest auth is working but no purchases exist
        const hasValidUserData = data.data && (
          data.data.summary || 
          data.data.user || 
          data.data.orderSummary ||
          Object.keys(data.data).length > 2
        );
        
        if (!hasValidUserData) {
          debugLog('No valid user data found - likely auth issue');
          return false;
        }
      }
      
      const isAuthenticated = hasValidResponse;
      debugLog('Auth status determined', { 
        authenticated: isAuthenticated,
        hasOrders,
        hasValidResponse,
        dataKeys: data.data ? Object.keys(data.data) : []
      });
      
      return isAuthenticated;
    } catch (error) {
      debugLog('Auth status check failed', error);
      return false;
    }
  }

  /**
   * Handle authentication failure - automatically redirect to OAuth (silent)
   */
  async handleAuthFailure(failedUrl) {
    if (this.isAuthenticating) {
      debugLog('Already authenticating, waiting for current process');
      return this.authPromise;
    }

    debugLog('Handling auth failure, starting silent OAuth flow', { failedUrl });
    
    // No visible message - silent authentication
    return this.startOAuthFlow();
  }

  /**
   * Start OAuth authentication flow (silent)
   */
  async startOAuthFlow() {
    if (this.isAuthenticating) {
      return this.authPromise;
    }

    this.isAuthenticating = true;
    
    this.authPromise = new Promise((resolve, reject) => {
      try {
        debugLog('Starting silent OAuth flow');
        
        // Build OAuth URL - force fresh authentication
        const oauthUrl = API_ENDPOINTS.AUTH;
        const returnUrl = window.location.href;
        const fullOAuthUrl = `${oauthUrl}?return_url=${encodeURIComponent(returnUrl)}&force_reauth=1`;
        
        debugLog('Opening OAuth in hidden iframe', { url: fullOAuthUrl });
        
        // Create hidden iframe for silent OAuth
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
          position: fixed;
          top: -1000px;
          left: -1000px;
          width: 1px;
          height: 1px;
          border: none;
          opacity: 0;
          pointer-events: none;
        `;
        iframe.src = fullOAuthUrl;
        iframe.name = 'ebay_oauth_silent';
        
        document.body.appendChild(iframe);
        this.authWindow = iframe;

        // Monitor for OAuth completion via postMessage
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'oauth_complete') {
            debugLog('OAuth completed via postMessage', event.data);
            cleanup();
            
            if (event.data.success) {
              debugLog('Silent OAuth completed successfully');
              resolve(true);
              // Refresh the page to reload with new auth
              setTimeout(() => window.location.reload(), 500);
            } else {
              debugLog('Silent OAuth failed');
              resolve(false);
            }
          }
        };

        window.addEventListener('message', messageHandler);

        const cleanup = () => {
          this.isAuthenticating = false;
          window.removeEventListener('message', messageHandler);
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        };

        // Fallback: check auth status periodically
        let checkCount = 0;
        const maxChecks = 30; // 30 seconds
        const checkInterval = setInterval(async () => {
          checkCount++;
          
          if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            cleanup();
            debugLog('Silent OAuth timeout');
            resolve(false);
            return;
          }

          const isAuth = await this.checkAuthStatus();
          if (isAuth) {
            clearInterval(checkInterval);
            cleanup();
            debugLog('Silent OAuth completed successfully (fallback check)');
            resolve(true);
            setTimeout(() => window.location.reload(), 500);
          }
        }, 1000);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          cleanup();
          debugLog('Silent OAuth timeout');
          resolve(false);
        }, 120000);

      } catch (error) {
        this.isAuthenticating = false;
        debugLog('Silent OAuth error', error);
        reject(error);
      }
    });

    return this.authPromise;
  }

  /**
   * Manually trigger OAuth flow - forces new token (silent)
   */
  async authenticate() {
    debugLog('Manual authentication triggered - forcing new token');
    
    // No visible message - silent authentication
    return this.startOAuthFlow();
  }

  /**
   * Show authentication message to user
   */
  showAuthMessage(message) {
    const existingMessage = document.getElementById('oauth-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.id = 'oauth-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      border-left: 4px solid #3b82f6;
    `;
    
    messageDiv.innerHTML = `
      <div style="margin-bottom: 10px; font-size: 16px; color: #1a365d;">
        🔐 eBay Authentication
      </div>
      <div style="color: #4a5568;">
        ${message}
      </div>
    `;

    document.body.appendChild(messageDiv);
  }

  /**
   * Hide authentication message
   */
  hideAuthMessage() {
    const existingMessage = document.getElementById('oauth-message');
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  /**
   * Test what the eBay service actually returns (for debugging)
   */
  async testEbayResponse() {
    try {
      const response = await fetch(`${API_ENDPOINTS.PURCHASES}?limit=1`);
      const data = await response.json();
      
      console.log('=== EBAY SERVICE RAW RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', data);
      console.log('Data keys:', data.data ? Object.keys(data.data) : 'No data object');
      console.log('================================');
      
      return data;
    } catch (error) {
      console.error('eBay test failed:', error);
    }
  }

  /**
   * Get authentication status
   */
  isAuthenticated() {
    return this.checkAuthStatus();
  }
}

// Create and export service instance
export const oauthService = new OAuthService();

// Export class for testing
export { OAuthService };