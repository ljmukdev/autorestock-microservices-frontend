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
   * Check if user is authenticated
   */
  async checkAuthStatus() {
    try {
      // Try to make a simple request to check auth status
      const response = await fetch(`${API_ENDPOINTS.PURCHASES}?limit=1`);
      const isAuthenticated = response.ok;
      
      debugLog('Auth status check', { authenticated: isAuthenticated, status: response.status });
      return isAuthenticated;
    } catch (error) {
      debugLog('Auth status check failed', error);
      return false;
    }
  }

  /**
   * Handle authentication failure - automatically redirect to OAuth
   */
  async handleAuthFailure(failedUrl) {
    if (this.isAuthenticating) {
      debugLog('Already authenticating, waiting for current process');
      return this.authPromise;
    }

    debugLog('Handling auth failure, starting OAuth flow', { failedUrl });
    
    // Show user-friendly message
    this.showAuthMessage('Session expired. Redirecting to eBay sign-in...');
    
    // Start OAuth flow
    return this.startOAuthFlow();
  }

  /**
   * Start OAuth authentication flow
   */
  async startOAuthFlow() {
    if (this.isAuthenticating) {
      return this.authPromise;
    }

    this.isAuthenticating = true;
    
    this.authPromise = new Promise((resolve, reject) => {
      try {
        debugLog('Starting OAuth flow');
        
        // Build OAuth URL
        const oauthUrl = API_ENDPOINTS.AUTH;
        const returnUrl = window.location.href;
        const fullOAuthUrl = `${oauthUrl}?return_url=${encodeURIComponent(returnUrl)}`;
        
        debugLog('Opening OAuth window', { url: fullOAuthUrl });
        
        // Open OAuth in popup window
        this.authWindow = window.open(
          fullOAuthUrl,
          'ebay_oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes,status=yes'
        );

        if (!this.authWindow) {
          throw new Error('Popup blocked. Please allow popups and try again.');
        }

        // Monitor the popup window
        const checkClosed = setInterval(() => {
          if (this.authWindow.closed) {
            clearInterval(checkClosed);
            this.isAuthenticating = false;
            
            // Check if authentication was successful
            setTimeout(async () => {
              const isAuth = await this.checkAuthStatus();
              if (isAuth) {
                debugLog('OAuth completed successfully');
                this.hideAuthMessage();
                resolve(true);
                // Refresh the page to reload with new auth
                window.location.reload();
              } else {
                debugLog('OAuth window closed without successful auth');
                this.showAuthMessage('Authentication cancelled or failed. Please try again.');
                resolve(false);
              }
            }, 1000);
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (this.authWindow && !this.authWindow.closed) {
            this.authWindow.close();
            clearInterval(checkClosed);
            this.isAuthenticating = false;
            this.showAuthMessage('Authentication timed out. Please try again.');
            reject(new Error('OAuth timeout'));
          }
        }, 300000);

      } catch (error) {
        this.isAuthenticating = false;
        this.showAuthMessage(`Authentication error: ${error.message}`);
        reject(error);
      }
    });

    return this.authPromise;
  }

  /**
   * Manually trigger OAuth flow
   */
  async authenticate() {
    debugLog('Manual authentication triggered');
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