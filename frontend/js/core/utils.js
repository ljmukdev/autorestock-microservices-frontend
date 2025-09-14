/**
 * StockPilot Core Utilities
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