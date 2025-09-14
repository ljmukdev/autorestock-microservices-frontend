/**
 * StockPilot Core Utilities
 * Common helper functions and DOM utilities
 */

/**
 * DOM query selector shorthand
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} First matching element
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * DOM query selector all shorthand
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeList} All matching elements
 */
export function $all(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Format currency amount
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol (default: £)
 * @returns {string} Formatted currency string
 */
export function money(amount, currency = '£') {
  const num = Number(amount);
  if (isNaN(num)) return `${currency}0.00`;
  return `${currency}${num.toFixed(2)}`;
}

/**
 * Format time ago string
 * @param {Date|string} date - Date to format
 * @returns {string} Time ago string
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
 * Format date string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleString('en-GB', { ...defaultOptions, ...options });
}

/**
 * Generate unique identifier
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique identifier
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
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
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
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
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
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
 * @param {string} str - JSON string
 * @param {any} defaultValue - Default value if parse fails
 * @returns {any} Parsed object or default value
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
 * Safe JSON stringify
 * @param {any} obj - Object to stringify
 * @param {any} defaultValue - Default value if stringify fails
 * @returns {string} JSON string or default value
 */
export function safeJSONStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('JSON stringify error:', error);
    return defaultValue;
  }
}

/**
 * Get platform emoji
 * @param {string} platform - Platform name
 * @returns {string} Platform emoji
 */
export function getPlatformEmoji(platform) {
  const emojis = {
    'eBay': '🏪',
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
 * Extract brand from product title
 * @param {string} title - Product title
 * @returns {string} Extracted brand
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
 * @param {string} title - Product title
 * @param {string} brand - Product brand
 * @returns {string} Extracted model
 */
export function extractModel(title, brand = '') {
  if (!title) return 'Unknown';
  
  let model = title;
  
  // Remove brand from title if present
  if (brand && brand !== 'Unknown') {
    model = model.replace(new RegExp(brand, 'gi'), '').trim();
  }
  
  // Take first 2-3 words as model
  const words = model.split(' ').filter(word => word.length > 0);
  if (words.length > 2) {
    return words.slice(0, 3).join(' ');
  }
  
  return model || 'Unknown';
}

/**
 * Slugify string for identifiers
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
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
 * @param {Date|string} date - Date to format
 * @returns {string} YYYYMMDD formatted date
 */
export function formatDateYYYYMMDD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Show loading state
 * @param {Element} element - Element to show loading in
 * @param {string} message - Loading message
 */
export function showLoading(element, message = 'Loading...') {
  if (!element) return;
  
  element.innerHTML = `
    <div class="spa-loading">
      <div class="spa-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Show error state
 * @param {Element} element - Element to show error in
 * @param {string} message - Error message
 * @param {Function} onRetry - Retry callback
 */
export function showError(element, message, onRetry = null) {
  if (!element) return;
  
  const retryButton = onRetry ? 
    `<button class="btn btn-primary" onclick="(${onRetry.toString()})()">🔄 Try Again</button>` : '';
  
  element.innerHTML = `
    <div class="spa-error">
      <h4>❌ Error</h4>
      <p>${message}</p>
      ${retryButton}
    </div>
  `;
}

/**
 * Show empty state
 * @param {Element} element - Element to show empty state in
 * @param {string} message - Empty state message
 * @param {string} icon - Icon to display
 */
export function showEmpty(element, message, icon = '📭') {
  if (!element) return;
  
  element.innerHTML = `
    <div class="spa-loading">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Update status bar
 * @param {Object} status - Status information
 */
export function updateStatusBar(status) {
  const statusBar = $('#spa-status-bar');
  if (!statusBar) return;
  
  const { message, type = 'info', timestamp = new Date() } = status;
  
  statusBar.innerHTML = `
    <div class="spa-status-item">
      <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>${message}</span>
      <span class="spa-status-badge">${formatDate(timestamp, { timeStyle: 'short' })}</span>
    </div>
  `;
}
