/**
 * StockPilot OAuth Service
 * Handles eBay OAuth authentication
 */

import { API_ENDPOINTS, debugLog } from '../../core/config.js';
import { updateStatusBar } from '../../core/utils.js';

class OAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.authToken = null;
    this.baseUrl = API_ENDPOINTS.AUTH.replace('/login', '');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isUserAuthenticated() {
    return this.isAuthenticated && this.authToken !== null;
  }

  /**
   * Initiate OAuth login
   * @returns {Promise<void>}
   */
  async initiateLogin() {
    debugLog('Initiating OAuth login');
    
    try {
      updateStatusBar({ message: 'Redirecting to eBay authentication...', type: 'info' });
      
      // Redirect to OAuth login URL
      window.location.href = API_ENDPOINTS.AUTH;
    } catch (error) {
      debugLog('Error initiating OAuth login', error);
      updateStatusBar({ 
        message: `❌ Login error: ${error.message}`, 
        type: 'error' 
      });
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   * @param {string} code - Authorization code
   * @returns {Promise<boolean>} Success status
   */
  async handleCallback(code) {
    debugLog('Handling OAuth callback', { code: code ? 'present' : 'missing' });
    
    if (!code) {
      throw new Error('No authorization code provided');
    }

    try {
      updateStatusBar({ message: 'Completing authentication...', type: 'info' });
      
      // Exchange code for token (placeholder)
      const response = await fetch(`${this.baseUrl}/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`OAuth callback failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.token;
      this.isAuthenticated = true;
      
      updateStatusBar({ 
        message: '✅ Authentication successful', 
        type: 'success' 
      });
      
      debugLog('OAuth authentication completed');
      return true;
    } catch (error) {
      debugLog('Error handling OAuth callback', error);
      updateStatusBar({ 
        message: `❌ Authentication failed: ${error.message}`, 
        type: 'error' 
      });
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    debugLog('Logging out user');
    
    try {
      if (this.authToken) {
        // Call logout endpoint (placeholder)
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          }
        });
      }
      
      this.authToken = null;
      this.isAuthenticated = false;
      
      updateStatusBar({ 
        message: 'Logged out successfully', 
        type: 'info' 
      });
      
      debugLog('User logged out');
    } catch (error) {
      debugLog('Error during logout', error);
      // Still clear local state even if server logout fails
      this.authToken = null;
      this.isAuthenticated = false;
    }
  }

  /**
   * Get authentication headers
   * @returns {Object} Headers with auth token
   */
  getAuthHeaders() {
    if (!this.isAuthenticated || !this.authToken) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${this.authToken}`
    };
  }

  /**
   * Check authentication status from server
   * @returns {Promise<boolean>} Authentication status
   */
  async checkAuthStatus() {
    try {
      const response = // await fetch(`${this.baseUrl}/status`, {
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isAuthenticated = data.authenticated;
        this.authToken = data.token || this.authToken;
        
        debugLog('Auth status checked', { 
          authenticated: this.isAuthenticated,
          hasToken: !!this.authToken
        });
        
        return this.isAuthenticated;
      }
      
      this.isAuthenticated = false;
      this.authToken = null;
      return false;
    } catch (error) {
      debugLog('Error checking auth status', error);
      this.isAuthenticated = false;
      this.authToken = null;
      return false;
    }
  }

  /**
   * Show OAuth modal
   * @param {string} message - Modal message
   */
  showOAuthModal(message = 'Authentication required') {
    // Create modal if it doesn't exist
    let modal = document.getElementById('oauth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'oauth-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">🔐 Authentication Required</h3>
            <button class="close-btn" id="oauth-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
            <p>Please click the button below to securely log in with eBay.</p>
            <button id="oauth-login-btn" class="btn btn-primary">🔑 Login with eBay</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Bind events
      document.getElementById('oauth-modal-close').onclick = () => this.hideOAuthModal();
      document.getElementById('oauth-login-btn').onclick = () => this.initiateLogin();
      modal.onclick = (e) => {
        if (e.target === modal) this.hideOAuthModal();
      };
    }
    
    modal.style.display = 'flex';
    debugLog('OAuth modal shown');
  }

  /**
   * Hide OAuth modal
   */
  hideOAuthModal() {
    const modal = document.getElementById('oauth-modal');
    if (modal) {
      modal.style.display = 'none';
      debugLog('OAuth modal hidden');
    }
  }
}

// Create and export service instance
export const oauthService = new OAuthService();

// Export class for testing
export { OAuthService };
