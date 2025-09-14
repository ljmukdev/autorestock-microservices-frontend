/**
 * Professional OAuth Handler for StockPilot
 * Handles eBay OAuth redirects and token validation
 */

class OAuthHandler {
    constructor() {
        this.oauthUrl = 'https://stockpilot-ebay-oauth-production.up.railway.app/ebay-oauth/login';
        this.testUrl = 'https://stockpilot-ebay-oauth-production.up.railway.app/api/ebay/default_user/test';
        this.callbackUrl = 'https://stockpilot-ebay-oauth-production.up.railway.app/ebay-oauth/callback';
        this.isAuthenticating = false;
        this.authWindow = null;
    }

    /**
     * Check if OAuth authentication is required
     * @returns {Promise<Object>} Authentication status
     */
    async checkAuthStatus() {
        try {
            const response = await fetch(this.testUrl);
            const data = await response.json();
            
            return {
                authenticated: data.success === true,
                oauthRequired: data.oauth_required === true,
                redirectRequired: data.redirect_required === true,
                oauthUrl: data.oauth_url || this.oauthUrl,
                message: data.message,
                tokenStatus: data.token_status
            };
        } catch (error) {
            console.error('Auth check failed:', error);
            return {
                authenticated: false,
                oauthRequired: true,
                redirectRequired: true,
                oauthUrl: this.oauthUrl,
                message: 'Unable to verify authentication status',
                error: error.message
            };
        }
    }

    /**
     * Show professional OAuth modal
     * @param {Object} options - Modal options
     */
    showOAuthModal(options = {}) {
        const {
            title = 'eBay Authentication Required',
            message = 'Your eBay authentication has expired or is missing. Please re-authenticate to continue.',
            showAutoRedirect = true
        } = options;

        // Remove existing modal if present
        this.removeOAuthModal();

        // Create modal HTML
        const modalHTML = `
            <div id="oauth-modal" class="oauth-modal-overlay">
                <div class="oauth-modal">
                    <div class="oauth-modal-header">
                        <h2>${title}</h2>
                        <button id="oauth-modal-close" class="oauth-modal-close">&times;</button>
                    </div>
                    <div class="oauth-modal-body">
                        <div class="oauth-icon">🔐</div>
                        <p class="oauth-message">${message}</p>
                        <div class="oauth-actions">
                            <button id="oauth-authenticate-btn" class="oauth-btn oauth-btn-primary">
                                <span class="oauth-btn-icon">🔗</span>
                                Authenticate with eBay
                            </button>
                            <button id="oauth-cancel-btn" class="oauth-btn oauth-btn-secondary">
                                Cancel
                            </button>
                        </div>
                        ${showAutoRedirect ? `
                            <div class="oauth-auto-redirect">
                                <p class="oauth-countdown">Redirecting automatically in <span id="oauth-countdown">10</span> seconds...</p>
                                <button id="oauth-stop-redirect" class="oauth-link">Stop auto-redirect</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add styles if not already present
        this.addOAuthStyles();

        // Set up event listeners
        this.setupModalEvents(showAutoRedirect);
    }

    /**
     * Set up modal event listeners
     */
    setupModalEvents(showAutoRedirect) {
        const modal = document.getElementById('oauth-modal');
        const closeBtn = document.getElementById('oauth-modal-close');
        const authBtn = document.getElementById('oauth-authenticate-btn');
        const cancelBtn = document.getElementById('oauth-cancel-btn');
        const stopRedirectBtn = document.getElementById('oauth-stop-redirect');

        // Close modal
        const closeModal = () => this.removeOAuthModal();
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Authenticate button
        authBtn.addEventListener('click', () => {
            this.startOAuthFlow();
            closeModal();
        });

        // Auto-redirect functionality
        if (showAutoRedirect) {
            this.startAutoRedirect(stopRedirectBtn);
        }
    }

    /**
     * Start auto-redirect countdown
     */
    startAutoRedirect(stopBtn) {
        let countdown = 10;
        const countdownEl = document.getElementById('oauth-countdown');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.startOAuthFlow();
                this.removeOAuthModal();
            }
        }, 1000);

        // Stop auto-redirect
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                clearInterval(countdownInterval);
                stopBtn.textContent = 'Auto-redirect stopped';
                stopBtn.disabled = true;
            });
        }
    }

    /**
     * Start OAuth flow
     */
    startOAuthFlow() {
        if (this.isAuthenticating) {
            console.log('OAuth flow already in progress');
            return;
        }

        this.isAuthenticating = true;
        
        // Show loading notification
        this.showNotification('🔐 Opening eBay authentication...', 'info');

        // Open OAuth window
        this.authWindow = window.open(
            this.oauthUrl,
            'eBayOAuth',
            'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        if (!this.authWindow) {
            this.showNotification('❌ Popup blocked. Please allow popups and try again.', 'error');
            this.isAuthenticating = false;
            return;
        }

        // Monitor for completion
        this.monitorOAuthCompletion();
    }

    /**
     * Monitor OAuth completion
     */
    monitorOAuthCompletion() {
        const checkInterval = setInterval(async () => {
            try {
                // Check if window is closed
                if (this.authWindow.closed) {
                    clearInterval(checkInterval);
                    this.isAuthenticating = false;
                    this.showNotification('⚠️ Authentication window was closed', 'warning');
                    return;
                }

                // Check auth status
                const authStatus = await this.checkAuthStatus();
                if (authStatus.authenticated) {
                    clearInterval(checkInterval);
                    this.isAuthenticating = false;
                    this.authWindow.close();
                    this.showNotification('✅ eBay authentication successful!', 'success');
                    
                    // Trigger success callback
                    this.onAuthSuccess(authStatus);
                }
            } catch (error) {
                console.error('OAuth monitoring error:', error);
            }
        }, 2000);

        // Stop monitoring after 5 minutes
        setTimeout(() => {
            clearInterval(checkInterval);
            this.isAuthenticating = false;
            if (this.authWindow && !this.authWindow.closed) {
                this.authWindow.close();
                this.showNotification('⏰ Authentication timeout. Please try again.', 'warning');
            }
        }, 300000);
    }

    /**
     * Handle successful authentication
     */
    onAuthSuccess(authStatus) {
        // Dispatch custom event
        const event = new CustomEvent('oauthSuccess', {
            detail: { authStatus }
        });
        document.dispatchEvent(event);

        // Refresh page or reload data
        if (typeof window.refreshData === 'function') {
            window.refreshData();
        } else {
            // Default: reload page
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    /**
     * Remove OAuth modal
     */
    removeOAuthModal() {
        const modal = document.getElementById('oauth-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (typeof window.showMessage === 'function') {
            window.showMessage(message, type);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `oauth-notification oauth-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('oauth-notification-show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('oauth-notification-show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Add OAuth modal styles
     */
    addOAuthStyles() {
        if (document.getElementById('oauth-styles')) return;

        const styles = `
            <style id="oauth-styles">
                .oauth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    backdrop-filter: blur(4px);
                }

                .oauth-modal {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: oauth-modal-slide-in 0.3s ease-out;
                }

                @keyframes oauth-modal-slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .oauth-modal-header {
                    padding: 24px 24px 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: 24px;
                }

                .oauth-modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .oauth-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .oauth-modal-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                .oauth-modal-body {
                    padding: 0 24px 24px 24px;
                    text-align: center;
                }

                .oauth-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .oauth-message {
                    font-size: 1.1rem;
                    color: #4b5563;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }

                .oauth-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .oauth-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .oauth-btn-primary {
                    background: #2563eb;
                    color: white;
                }

                .oauth-btn-primary:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                .oauth-btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .oauth-btn-secondary:hover {
                    background: #e5e7eb;
                }

                .oauth-auto-redirect {
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .oauth-countdown {
                    margin: 0 0 8px 0;
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                .oauth-link {
                    background: none;
                    border: none;
                    color: #2563eb;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-decoration: underline;
                }

                .oauth-link:hover {
                    color: #1d4ed8;
                }

                .oauth-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10001;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }

                .oauth-notification-show {
                    transform: translateX(0);
                }

                .oauth-notification-info {
                    background: #3b82f6;
                }

                .oauth-notification-success {
                    background: #10b981;
                }

                .oauth-notification-warning {
                    background: #f59e0b;
                }

                .oauth-notification-error {
                    background: #ef4444;
                }

                @media (max-width: 640px) {
                    .oauth-modal {
                        width: 95%;
                        margin: 20px;
                    }

                    .oauth-actions {
                        flex-direction: column;
                    }

                    .oauth-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Global OAuth handler instance
window.oauthHandler = new OAuthHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthHandler;
}

