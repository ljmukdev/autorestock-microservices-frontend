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
  
  element.innerHTML = `
    <div class="spa-error">
      <h4>❌ Error</h4>
      <p>${message}</p>
      ${onRetry ? `<button class="btn btn-primary" data-action="util-retry">🔄 Try Again</button>` : ''}
    </div>`;
  if (onRetry) {
    const btn = element.querySelector('[data-action="util-retry"]');
    btn?.addEventListener('click', () => onRetry());
  }
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
