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

    debugLog('Handling auth failure, starting direct OAuth redirect', { failedUrl });
    
    // Use direct redirect instead of popup to avoid blocking
    const oauthUrl = API_ENDPOINTS.AUTH;
    const returnUrl = window.location.href;
    const fullOAuthUrl = `${oauthUrl}?return_url=${encodeURIComponent(returnUrl)}&force_reauth=1&user_id=ljmukdev`;
    
    debugLog('Redirecting to OAuth URL', { url: fullOAuthUrl });
    window.location.href = fullOAuthUrl;
    
    return false; // Will redirect, so return false
  }

  /**
   * Start OAuth authentication flow (popup window)
   */
  async startOAuthFlow() {
    if (this.isAuthenticating) {
      return this.authPromise;
    }

    this.isAuthenticating = true;
    
    this.authPromise = new Promise((resolve, reject) => {
      try {
        debugLog('Starting OAuth flow with popup window');
        
        // Build OAuth URL - force fresh authentication
        const oauthUrl = API_ENDPOINTS.AUTH;
        const returnUrl = window.location.href;
        const fullOAuthUrl = `${oauthUrl}?return_url=${encodeURIComponent(returnUrl)}&force_reauth=1&user_id=ljmukdev`;
        
        debugLog('Opening OAuth in popup window', { url: fullOAuthUrl });
        
        // Open OAuth in popup window
        const authWindow = window.open(
          fullOAuthUrl, 
          'ebay_oauth', 
          'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
        );
        
        if (!authWindow) {
          this.isAuthenticating = false;
          debugLog('Failed to open OAuth popup - popup blocked, trying direct redirect');
          // Instead of rejecting, try direct redirect
          window.location.href = fullOAuthUrl;
          reject(new Error('Popup blocked. Redirecting to OAuth page.'));
          return;
        }
        
        this.authWindow = authWindow;

        // Monitor for OAuth completion
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'oauth_complete') {
            debugLog('OAuth completed via postMessage', event.data);
            cleanup();
            
            if (event.data.success) {
              debugLog('OAuth completed successfully');
              resolve(true);
              // Refresh the page to reload with new auth
              setTimeout(() => window.location.reload(), 500);
            } else {
              debugLog('OAuth failed');
              resolve(false);
            }
          }
        };

        window.addEventListener('message', messageHandler);

        const cleanup = () => {
          this.isAuthenticating = false;
          window.removeEventListener('message', messageHandler);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        };

        // Monitor window close
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            cleanup();
            debugLog('OAuth window closed by user');
            resolve(false);
          }
        }, 1000);

        // Fallback: check auth status periodically
        let checkCount = 0;
        const maxChecks = 60; // 60 seconds
        const checkInterval = setInterval(async () => {
          checkCount++;
          
          if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            clearInterval(checkClosed);
            cleanup();
            debugLog('OAuth timeout');
            resolve(false);
            return;
          }

          const isAuth = await this.checkAuthStatus();
          if (isAuth) {
            clearInterval(checkInterval);
            clearInterval(checkClosed);
            cleanup();
            debugLog('OAuth completed successfully (fallback check)');
            resolve(true);
            setTimeout(() => window.location.reload(), 500);
          }
        }, 1000);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          clearInterval(checkClosed);
          cleanup();
          debugLog('OAuth timeout');
          resolve(false);
        }, 120000);

      } catch (error) {
        this.isAuthenticating = false;
        debugLog('OAuth error', error);
        reject(error);
      }
    });

    return this.authPromise;
  }

  /**
   * Manually trigger OAuth flow - forces new token
   */
  async authenticate() {
    debugLog('Manual authentication triggered - forcing new token');
    
    // Use direct redirect instead of popup to avoid blocking issues
    const oauthUrl = API_ENDPOINTS.AUTH;
    const returnUrl = window.location.href;
    const fullOAuthUrl = `${oauthUrl}?return_url=${encodeURIComponent(returnUrl)}&force_reauth=1&user_id=ljmukdev`;
    
    debugLog('Redirecting to OAuth URL', { url: fullOAuthUrl });
    window.location.href = fullOAuthUrl;
    
    return false; // Will redirect, so return false
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