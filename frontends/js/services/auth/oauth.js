/**
 * AutoRestock Centralized OAuth Service
 * Manages authentication state across all microservices
 */

import { debugLog } from '../core/config.js';

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
    
    // Redirect to OAuth service
    window.location.href = loginUrl;
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