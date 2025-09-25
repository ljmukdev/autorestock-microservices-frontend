/**
 * AutoRestock Core Utilities
 * Common helper functions and DOM utilities
 */

/**
 * Format date string with safe options
 */
export function formatDate(date, options = {}) {
  try {
    // Use only safe, standard options
    const safeOptions = {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    };
    
    // Add time if not explicitly excluded
    if (options.timeStyle !== 'none') {
      safeOptions.hour = '2-digit';
      safeOptions.minute = '2-digit';
    }
    
    return new Date(date).toLocaleString('en-GB', safeOptions);
  } catch (error) {
    // Fallback to simple string if toLocaleString fails
    return new Date(date).toString();
  }
}

/**
 * DOM query selector shorthand
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * DOM query selector all shorthand
 */
export function $all(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Format currency amount
 */
export function money(amount, currency = '£') {
  const num = Number(amount);
  if (isNaN(num)) return `${currency}0.00`;
  return `${currency}${num.toFixed(2)}`;
}

/**
 * Format time ago string
 */
export function timeAgo(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const seconds = Math.floor((now - targetDate) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

/**
 * Update status bar
 */
export function updateStatusBar(status) {
  const statusBar = document.getElementById('spa-status-bar');
  if (!statusBar) return;
  
  const { message, type = 'info', timestamp = new Date() } = status;
  
  statusBar.innerHTML = `
    <div class="spa-status-item">
      <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>${message}</span>
      <span class="spa-status-badge">${formatDate(timestamp, { timeStyle: 'none' })}</span>
    </div>
  `;
}

// Add other essential utility functions here as needed
/**
 * Extract brand from product title
 */
export function extractBrand(title) {
  if (!title) return 'Unknown';
  
  const brands = ['Apple', 'Samsung', 'Sony', 'Bose', 'Sonos', 'LG', 'Microsoft', 'Google', 'Huawei', 'OnePlus'];
  const titleLower = title.toLowerCase();
  
  for (const brand of brands) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return 'Unknown';
}

/**
 * Extract model from product title
 */
export function extractModel(title, brand = '') {
  if (!title) return 'Unknown';
  
  let model = title;
  
  if (brand && brand !== 'Unknown') {
    model = model.replace(new RegExp(brand, 'gi'), '').trim();
  }
  
  const words = model.split(' ').filter(word => word.length > 0);
  if (words.length > 2) {
    return words.slice(0, 3).join(' ');
  }
  
  return model || 'Unknown';
}

/**
 * Slugify string for identifiers
 */
export function slugify(str) {
  return String(str || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

/**
 * Format date to YYYYMMDD
 */
export function formatDateYYYYMMDD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Get platform emoji
 */
export function getPlatformEmoji(platform) {
  const emojis = {
    'eBay': '🪙',
    'Amazon': '📦',
    'Vinted': '👕',
    'Facebook Marketplace': '📘',
    'Depop': '🛍️',
    'Gumtree': '🌳',
    'Manual': '✋',
    'Other': '🛒'
  };
  return emojis[platform] || '🛒';
}

/**
 * Generate unique identifier
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

/**
 * Safe JSON parse
 */
export function safeJSONParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Debounce function calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Create and show modal
 */
export function showModal({ title, content, onClose = null, size = 'medium' }) {
  // Remove existing modal if any
  const existingModal = document.getElementById('purchase-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'purchase-modal';
  modal.className = 'modal-overlay';
  
  const sizeClass = size === 'large' ? 'modal-large' : size === 'small' ? 'modal-small' : 'modal-medium';
  
  modal.innerHTML = `
    <div class="modal-content ${sizeClass}">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-close-footer">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  const closeBtn = modal.querySelector('#modal-close-btn');
  const closeFooterBtn = modal.querySelector('#modal-close-footer');
  
  const closeModal = () => {
    modal.remove();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', closeModal);
  closeFooterBtn.addEventListener('click', closeModal);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  return modal;
}

/**
 * Close modal
 */
export function closeModal() {
  const modal = document.getElementById('purchase-modal');
  if (modal) {
    modal.remove();
  }
}