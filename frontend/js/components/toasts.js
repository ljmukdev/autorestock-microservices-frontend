/**
 * StockPilot Toast Component
 * Notification system for user feedback
 */

import { debugLog } from '../core/config.js';

class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    // Create toast container if it doesn't exist
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {Object} options - Toast options
   */
  show(message, type = 'info', options = {}) {
    const {
      duration = 5000,
      closable = true,
      position = 'top-right',
      id = null
    } = options;

    const toastId = id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const toast = {
      id: toastId,
      message,
      type,
      duration,
      closable,
      element: null
    };

    this.toasts.push(toast);
    this.renderToast(toast);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toastId);
      }, duration);
    }

    debugLog(`Toast shown: ${type}`, { message, duration });
  }

  /**
   * Render individual toast
   * @param {Object} toast - Toast object
   */
  renderToast(toast) {
    const toastElement = document.createElement('div');
    toastElement.id = toast.id;
    toastElement.className = `toast toast-${toast.type}`;
    toastElement.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid ${this.getTypeColor(toast.type)};
      max-width: 400px;
      pointer-events: auto;
      animation: slideInRight 0.3s ease-out;
      position: relative;
    `;

    const icon = this.getTypeIcon(toast.type);
    const closeButton = toast.closable ? 
      `<button class="toast-close" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">&times;</button>` : '';

    toastElement.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 20px; margin-top: 2px;">${icon}</div>
        <div style="flex: 1; font-size: 14px; line-height: 1.4; color: #333;">
          ${toast.message}
        </div>
        ${closeButton}
      </div>
    `;

    // Add close button event
    if (toast.closable) {
      const closeBtn = toastElement.querySelector('.toast-close');
      closeBtn.onclick = () => this.remove(toast.id);
    }

    this.container.appendChild(toastElement);
    toast.element = toastElement;

    // Add CSS animation if not already present
    this.addAnimationStyles();
  }

  /**
   * Remove toast
   * @param {string} toastId - Toast ID
   */
  remove(toastId) {
    const toastIndex = this.toasts.findIndex(t => t.id === toastId);
    if (toastIndex === -1) return;

    const toast = this.toasts[toastIndex];
    
    if (toast.element) {
      toast.element.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (toast.element && toast.element.parentNode) {
          toast.element.parentNode.removeChild(toast.element);
        }
      }, 300);
    }

    this.toasts.splice(toastIndex, 1);
    debugLog(`Toast removed: ${toastId}`);
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(toast => {
      if (toast.element && toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
    });
    this.toasts = [];
    debugLog('All toasts cleared');
  }

  /**
   * Get type color
   * @param {string} type - Toast type
   * @returns {string} Color hex code
   */
  getTypeColor(type) {
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    return colors[type] || colors.info;
  }

  /**
   * Get type icon
   * @param {string} type - Toast type
   * @returns {string} Icon emoji
   */
  getTypeIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Add animation styles
   */
  addAnimationStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Create and export toast manager instance
export const toast = new ToastManager();

// Convenience methods
export const showSuccess = (message, options) => toast.show(message, 'success', options);
export const showError = (message, options) => toast.show(message, 'error', options);
export const showWarning = (message, options) => toast.show(message, 'warning', options);
export const showInfo = (message, options) => toast.show(message, 'info', options);

// Export class for testing
export { ToastManager };
