/**
 * AutoRestock Purchases UI Components
 * Rendering functions for purchase-related UI elements
 */

import { debugLog } from '../../core/config.js';

/**
 * Render purchase history table
 * @param {Array} purchases - Array of purchases
 * @param {Object} options - Render options
 * @returns {string} HTML string
 */
export function renderPurchaseHistory(purchases = [], options = {}) {
  const { showStats = true, showFilters = true } = options;
  
  debugLog('Rendering purchase history', { purchaseCount: purchases.length });
  
  let html = '';
  
  // Statistics section
  if (showStats) {
    const stats = calculateStats(purchases);
    html += renderStatsSection(stats);
  }
  
  // Filters section
  if (showFilters) {
    html += renderFiltersSection();
  }
  
  // Purchase table
  html += renderPurchaseTable(purchases);
  
  return html;
}

/**
 * Calculate purchase statistics
 * @param {Array} purchases - Array of purchases
 * @returns {Object} Statistics object
 */
function calculateStats(purchases) {
  const totalInvestment = purchases.reduce((sum, p) => sum + (p.purchase_price || 0), 0);
  const purchaseCount = purchases.length;
  const averagePurchase = purchaseCount > 0 ? totalInvestment / purchaseCount : 0;
  
  return {
    totalInvestment,
    purchaseCount,
    averagePurchase,
    lastSync: new Date()
  };
}

/**
 * Render statistics section
 * @param {Object} stats - Statistics object
 * @returns {string} HTML string
 */
function renderStatsSection(stats) {
  return `
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value">${formatCurrency(stats.totalInvestment)}</div>
          <div class="stat-label">Total Investment</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-value">${stats.purchaseCount}</div>
          <div class="stat-label">Total Purchases</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">${formatCurrency(stats.averagePurchase)}</div>
          <div class="stat-label">Average Purchase</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <div class="stat-value">${formatDate(stats.lastSync)}</div>
          <div class="stat-label">Last Sync</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render filters section
 * @returns {string} HTML string
 */
function renderFiltersSection() {
  return `
    <div class="filters-section">
      <div class="filter-group">
        <label for="search-filter">Search:</label>
        <input type="text" id="search-filter" placeholder="Search purchases...">
      </div>
      <div class="filter-group">
        <label for="date-filter">Date Range:</label>
        <select id="date-filter">
          <option value="">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="status-filter">Status:</label>
        <select id="status-filter">
          <option value="">All Status</option>
          <option value="Delivered">Delivered</option>
          <option value="Shipped">Shipped</option>
          <option value="Processing">Processing</option>
        </select>
      </div>
    </div>
  `;
}

/**
 * Render purchase table
 * @param {Array} purchases - Array of purchases
 * @returns {string} HTML string
 */
function renderPurchaseTable(purchases) {
  if (purchases.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No purchases found</h3>
        <p>Try syncing with eBay or check your connection.</p>
        <button id="sync-now" class="btn btn-primary">Sync Now</button>
      </div>
    `;
  }
  
  const rows = purchases.map(purchase => `
    <tr class="purchase-row" data-purchase-id="${purchase._id}">
      <td class="date-cell">${formatDate(purchase.purchase_date)}</td>
      <td class="product-cell">
        <div class="product-info">
          <div class="product-name">${purchase.product_name}</div>
          <div class="product-model">${purchase.model || ''}</div>
        </div>
      </td>
      <td class="brand-cell">
        <span class="brand-badge">${purchase.brand || 'Unknown'}</span>
      </td>
      <td class="seller-cell">${purchase.seller_username || 'Unknown'}</td>
      <td class="price-cell">${formatCurrency(purchase.purchase_price)}</td>
      <td class="status-cell">
        <span class="status-badge status-${purchase.delivery_status?.toLowerCase().replace(' ', '-')}">
          ${purchase.delivery_status || 'Unknown'}
        </span>
      </td>
      <td class="actions-cell">
        <button class="btn-icon" title="View Details" onclick="viewPurchase('${purchase._id}')">
          👁️
        </button>
      </td>
    </tr>
  `).join('');
  
  return `
    <div class="purchases-table-container">
      <table class="purchases-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Brand</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render status bar
 * @param {Object} status - Status object
 * @returns {string} HTML string
 */
export function renderStatusBar(status) {
  const { message, type = 'info' } = status;
  
  return `
    <div class="status-bar status-${type}">
      <span class="status-icon">${getStatusIcon(type)}</span>
      <span class="status-message">${message}</span>
    </div>
  `;
}

/**
 * Render loading state
 * @param {string} message - Loading message
 * @returns {string} HTML string
 */
export function renderLoadingState(message = 'Loading...') {
  return `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Render error state
 * @param {string} message - Error message
 * @returns {string} HTML string
 */
export function renderErrorState(message = 'An error occurred') {
  return `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error</h3>
      <p>${message}</p>
      <button id="retry-load" class="btn btn-primary">Retry</button>
    </div>
  `;
}

/**
 * Render empty state
 * @param {string} message - Empty state message
 * @returns {string} HTML string
 */
export function renderEmptyState(message = 'No data available') {
  return `
    <div class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No Data</h3>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Get status icon for status type
 * @param {string} type - Status type
 * @returns {string} Icon
 */
function getStatusIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
}

/**
 * Render purchase details modal content
 * @param {Object} purchase - Purchase object
 * @returns {string} HTML string for modal content
 */
export function renderPurchaseDetailsModal(purchase) {
  if (!purchase) {
    return '<p>Purchase details not found.</p>';
  }

  const formatItems = (items) => {
    if (!items || items.length === 0) return 'No items listed.';
    return items.map(item => `
      <div class="purchase-item">
        <span>${item.quantity} x ${item.productName}</span>
        <span>${formatCurrency(item.totalPrice)}</span>
      </div>
    `).join('');
  };

  return `
    <div class="purchase-details-modal-content">
      <h2>Purchase Details: ${purchase.product_name}</h2>
      <div class="purchase-details-grid">
        <div class="purchase-details-section">
          <h3>General Info</h3>
          <table class="purchase-details-table">
            <tr><td>Order ID:</td><td>${purchase.order_id || 'N/A'}</td></tr>
            <tr><td>Transaction ID:</td><td>${purchase.transaction_id || 'N/A'}</td></tr>
            <tr><td>Item ID:</td><td>${purchase.item_id || 'N/A'}</td></tr>
            <tr><td>Platform:</td><td>${purchase.platform}</td></tr>
            <tr><td>Purchase Date:</td><td>${formatDate(purchase.purchase_date)}</td></tr>
            <tr><td>Total Paid:</td><td>${formatCurrency(purchase.totalAmount)}</td></tr>
            <tr><td>Shipping Cost:</td><td>${formatCurrency(purchase.shipping_cost)}</td></tr>
          </table>
        </div>

        <div class="purchase-details-section">
          <h3>Seller Info</h3>
          <table class="purchase-details-table">
            <tr><td>Seller Username:</td><td>${purchase.seller_username || 'N/A'}</td></tr>
            <tr><td>Seller ID:</td><td>${purchase.seller_id || 'N/A'}</td></tr>
          </table>
        </div>

        <div class="purchase-details-section">
          <h3>Delivery Info</h3>
          <table class="purchase-details-table">
            <tr><td>Status:</td><td>${purchase.delivery_status}</td></tr>
            <tr><td>Shipped Time:</td><td>${formatDate(purchase.shipped_time)}</td></tr>
            <tr><td>Carrier:</td><td>${purchase.carrier || 'N/A'}</td></tr>
            <tr><td>Tracking Ref:</td><td>${purchase.tracking_ref || 'N/A'}</td></tr>
            ${purchase.tracking_ref && purchase.carrier ? `
            <tr>
              <td>Tracking Link:</td>
              <td><a href="${getTrackingLink(purchase.carrier, purchase.tracking_ref)}" target="_blank" class="text-blue-500 hover:underline">Track Package</a></td>
            </tr>
            ` : ''}
          </table>
        </div>
      </div>

      <div class="purchase-details-section">
        <h3>🛍️ Items in Purchase</h3>
        <div class="purchase-items-list">
          ${formatItems(purchase.items)}
        </div>
      </div>

      ${purchase.notes || purchase.description ? `
      <div class="purchase-notes">
        <h4>📝 Additional Information</h4>
        <p>${purchase.notes || purchase.description || 'No additional notes available.'}</p>
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Helper to get tracking link
 * @param {string} carrier - Shipping carrier
 * @param {string} trackingRef - Tracking number
 * @returns {string} Tracking URL
 */
function getTrackingLink(carrier, trackingRef) {
  if (!carrier || !trackingRef) return '#';
  const lowerCarrier = carrier.toLowerCase();
  if (lowerCarrier.includes('royal mail')) {
    return `https://www.royalmail.com/track-your-item#/tracking-results/${trackingRef}`;
  }
  if (lowerCarrier.includes('hermes') || lowerCarrier.includes('evri')) {
    return `https://www.evri.com/track/${trackingRef}`;
  }
  if (lowerCarrier.includes('dpd')) {
    return `https://www.dpd.co.uk/apps/tracking/?reference=${trackingRef}`;
  }
  if (lowerCarrier.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${trackingRef}`;
  }
  if (lowerCarrier.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingRef}`;
  }
  return `https://www.google.com/search?q=track+package+${trackingRef}`;
}