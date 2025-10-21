/**
 * AutoRestock Centralized OAuth Service
 * Manages authentication state across all microservices
 */

import { debugLog } from '../../core/config.js';

class OAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.userId = null;
    this.lastChecked = null;
    this.checkInterval = null;
    this.authCallbacks = new Set();
  }

  /**
   * Initialize OAuth service
   */
  async init() {
    debugLog('Initializing OAuth service');
    
    // Check initial auth status
    await this.checkAuthStatus();
    
    // Set up periodic auth checks
    this.startPeriodicCheck();
    
    // Check for OAuth callback parameters
    this.handleOAuthCallback();
  }

  /**
   * Check authentication status
   * @returns {Promise<Object>} Auth status
   */
  async checkAuthStatus() {
    try {
      const response = await fetch('https://delightful-liberation-production.up.railway.app/oauth/status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const wasAuthenticated = this.isAuthenticated;
        
        this.isAuthenticated = data.authenticated || false;
        this.userId = data.userId || null;
        this.lastChecked = new Date();
        
        // Notify callbacks if auth status changed
        if (wasAuthenticated !== this.isAuthenticated) {
          this.notifyAuthCallbacks();
        }
        
        debugLog('OAuth status checked', { 
          authenticated: this.isAuthenticated, 
          userId: this.userId 
        });
        
        return {
          authenticated: this.isAuthenticated,
          userId: this.userId,
          message: data.message || 'OAuth status checked'
        };
      } else {
        this.isAuthenticated = false;
        this.userId = null;
        return {
          authenticated: false,
          userId: null,
          message: 'OAuth service unavailable'
        };
      }
    } catch (error) {
      debugLog('Error checking OAuth status', error);
      this.isAuthenticated = false;
      this.userId = null;
      return {
        authenticated: false,
        userId: null,
        message: 'Failed to check OAuth status'
      };
    }
  }

  /**
   * Start periodic authentication checks
   */
  startPeriodicCheck() {
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic authentication checks
   */
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Handle OAuth callback from URL parameters
   */
  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const ebayConnected = urlParams.get('ebay_connected');
    const ebayError = urlParams.get('ebay_error');
    const userId = urlParams.get('user_id');
    
    if (ebayConnected === 'true') {
      debugLog('OAuth callback detected - eBay connected', { userId });
      this.isAuthenticated = true;
      this.userId = userId;
      this.notifyAuthCallbacks();
      
      // Clean up URL
      this.cleanupUrl();
    } else if (ebayError) {
      debugLog('OAuth callback detected - eBay error', { error: ebayError });
      this.isAuthenticated = false;
      this.userId = null;
      this.notifyAuthCallbacks();
      
      // Clean up URL
      this.cleanupUrl();
    }
  }

  /**
   * Clean up URL parameters after OAuth callback
   */
  cleanupUrl() {
    const url = new URL(window.location);
    url.searchParams.delete('ebay_connected');
    url.searchParams.delete('ebay_error');
    url.searchParams.delete('user_id');
    
    // Update URL without page reload
    window.history.replaceState({}, '', url);
  }

  /**
   * Initiate OAuth login
   * @param {string} service - Service name (e.g., 'ebay')
   * @returns {Promise<void>}
   */
  async initiateLogin(service = 'ebay') {
    debugLog(`Initiating OAuth login for ${service}`);
    
    const loginUrls = {
      ebay: 'https://delightful-liberation-production.up.railway.app/oauth/login'
    };
    
    const loginUrl = loginUrls[service];
    if (!loginUrl) {
      throw new Error(`No OAuth URL configured for service: ${service}`);
    }
    
    // Use popup window instead of redirect
    return this.openOAuthPopup(loginUrl, service);
  }

  /**
   * Open OAuth popup window and handle the flow
   * @param {string} loginUrl - OAuth login URL
   * @param {string} service - Service name
   * @returns {Promise<boolean>} Success status
   */
  openOAuthPopup(loginUrl, service) {
    return new Promise((resolve, reject) => {
      // Calculate popup position (center on screen)
      const width = 600;
      const height = 700;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      // Open popup window
      const popup = window.open(
        loginUrl,
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }
      
      // Focus the popup
      popup.focus();
      
      // Add message listener for popup communication
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data && event.data.type === 'oauth-complete') {
          debugLog('Received OAuth completion message from popup');
          clearInterval(pollTimer);
          popup.close();
          
          if (event.data.success) {
            this.isAuthenticated = true;
            this.userId = event.data.userId;
            this.notifyAuthCallbacks();
            resolve(true);
          } else {
            reject(new Error(event.data.error || 'OAuth failed'));
          }
          
          window.removeEventListener('message', messageHandler);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Poll for popup closure or completion
      const pollTimer = setInterval(() => {
        try {
          // Check if popup is closed
          if (popup.closed) {
            clearInterval(pollTimer);
            debugLog('OAuth popup closed');
            
            // Check for callback parameters in the main window URL
            const urlParams = new URLSearchParams(window.location.search);
            const ebayConnected = urlParams.get('ebay_connected');
            const ebayError = urlParams.get('ebay_error');
            const userId = urlParams.get('user_id');
            
            debugLog('Popup closed, checking URL params:', { ebayConnected, ebayError, userId });
            
            if (ebayConnected === 'true') {
              debugLog('OAuth completed successfully via URL params');
              this.isAuthenticated = true;
              this.userId = userId;
              this.notifyAuthCallbacks();
              
              // Clean up URL parameters
              this.cleanupUrlParams();
              
              resolve(true);
            } else if (ebayError) {
              debugLog('OAuth failed via URL params:', ebayError);
              this.cleanupUrlParams();
              reject(new Error(`OAuth failed: ${ebayError}`));
            } else {
              // Popup closed without clear result, check auth status
              debugLog('No URL params found, checking auth status with service');
              this.checkAuthStatus().then(() => {
                debugLog('Auth status check result:', this.isAuthenticated);
                resolve(this.isAuthenticated);
              }).catch(reject);
            }
            return;
          }
          
          // Check if we can access the popup's location (means it's still on our domain)
          try {
            const popupUrl = popup.location.href;
            
            // If popup is on our domain, check for callback parameters
            if (popupUrl.includes(window.location.origin)) {
              const urlParams = new URLSearchParams(popup.location.search);
              const ebayConnected = urlParams.get('ebay_connected');
              const ebayError = urlParams.get('ebay_error');
              
              if (ebayConnected === 'true' || ebayError) {
                clearInterval(pollTimer);
                popup.close();
                
                if (ebayConnected === 'true') {
                  debugLog('OAuth completed successfully via popup URL');
                  this.isAuthenticated = true;
                  this.userId = urlParams.get('user_id');
                  this.notifyAuthCallbacks();
                  resolve(true);
                } else {
                  debugLog('OAuth failed via popup URL:', ebayError);
                  reject(new Error(`OAuth failed: ${ebayError}`));
                }
              }
            }
          } catch (e) {
            // Cross-origin access blocked, continue polling
            // This is normal when the popup is on the OAuth provider's domain
          }
        } catch (error) {
          debugLog('Error polling popup:', error);
        }
      }, 1000);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(pollTimer);
          popup.close();
          reject(new Error('OAuth timeout - please try again'));
        }
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Clean up URL parameters after OAuth callback
   */
  cleanupUrlParams() {
    const url = new URL(window.location);
    url.searchParams.delete('ebay_connected');
    url.searchParams.delete('ebay_error');
    url.searchParams.delete('user_id');
    
    // Update URL without reloading page
    window.history.replaceState({}, document.title, url.toString());
  }

  /**
   * Logout from OAuth service
   * @param {string} service - Service name (e.g., 'ebay')
   * @returns {Promise<void>}
   */
  async logout(service = 'ebay') {
    debugLog(`Logging out from ${service}`);
    
    try {
      const response = await fetch('https://delightful-liberation-production.up.railway.app/oauth/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        this.isAuthenticated = false;
        this.userId = null;
        this.notifyAuthCallbacks();
        debugLog('Logout successful');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      debugLog('Error during logout', error);
      // Force local logout even if server call fails
      this.isAuthenticated = false;
      this.userId = null;
      this.notifyAuthCallbacks();
    }
  }

  /**
   * Register callback for auth status changes
   * @param {Function} callback - Callback function
   */
  onAuthChange(callback) {
    this.authCallbacks.add(callback);
  }

  /**
   * Unregister callback for auth status changes
   * @param {Function} callback - Callback function
   */
  offAuthChange(callback) {
    this.authCallbacks.delete(callback);
  }

  /**
   * Notify all registered callbacks of auth status change
   */
  notifyAuthCallbacks() {
    this.authCallbacks.forEach(callback => {
      try {
        callback({
          authenticated: this.isAuthenticated,
          userId: this.userId,
          lastChecked: this.lastChecked
        });
      } catch (error) {
        debugLog('Error in auth callback', error);
      }
    });
  }

  /**
   * Get current authentication status
   * @returns {Object} Current auth status
   */
  getAuthStatus() {
    return {
      authenticated: this.isAuthenticated,
      userId: this.userId,
      lastChecked: this.lastChecked
    };
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Get current user ID
   * @returns {string|null} User ID
   */
  getCurrentUserId() {
    return this.userId;
  }

  /**
   * Make authenticated API request
   * @param {string} url - API URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async authenticatedRequest(url, options = {}) {
    if (!this.isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    return fetch(url, { ...defaultOptions, ...options });
  }
}

// Create and export singleton instance
export const oauthService = new OAuthService();

// Export class for testing
export { OAuthService };