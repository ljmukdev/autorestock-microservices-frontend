/**
 * StockPilot Purchases UI
 * Renders purchase lists, cards, and status information
 */

import { money, timeAgo, getPlatformEmoji, formatDate } from '../../core/utils.js';
import { debugLog } from '../../core/config.js';

/**
 * Render purchase cards
 * @param {Array} purchases - Array of purchase objects
 * @param {Object} options - Render options
 * @returns {string} HTML string
 */
export function renderPurchaseCards(purchases, options = {}) {
  if (!purchases || purchases.length === 0) {
    return renderEmptyState(options.emptyMessage || 'No purchases found');
  }

  debugLog(`Rendering ${purchases.length} purchase cards`);

  const cards = purchases.map(purchase => renderPurchaseCard(purchase, options));
  return cards.join('');
}

/**
 * Render single purchase card
 * @param {Object} purchase - Purchase object
 * @param {Object} options - Render options
 * @returns {string} HTML string
 */
export function renderPurchaseCard(purchase, options = {}) {
  const {
    showActions = true,
    showDetails = true,
    compact = false
  } = options;

  const timeAgoStr = timeAgo(new Date(purchase.orderDate || purchase.purchase_date || purchase.createdAt));
  const platformEmoji = getPlatformEmoji(purchase.platform || 'Unknown');
  const total = calculateTotal(purchase);
  const productName = purchase.product_name || purchase.items?.[0]?.productName || 'Unknown Item';
  const brand = purchase.brand || purchase.supplier || 'Unknown';

  const cardClass = compact ? 'purchase-card-compact' : 'purchase-card';
  const actionsHtml = showActions ? renderPurchaseActions(purchase) : '';
  const detailsHtml = showDetails ? renderPurchaseDetails(purchase, compact) : '';

  return `
    <div class="${cardClass}" data-id="${purchase._id || purchase.id}" style="cursor: pointer;" title="Click to view details">
      <div class="purchase-icon">${platformEmoji}</div>
      <div class="purchase-text">
        <div><strong>${brand} ${productName}</strong></div>
        <div style="font-size:11px; color:#666; margin-top:2px;">
          ${purchase.platform || 'Unknown'} • ${timeAgoStr} • ${purchase.category || 'Uncategorized'}
        </div>
        ${detailsHtml}
      </div>
      <div class="purchase-amount">${money(total)}</div>
      ${actionsHtml}
    </div>
  `;
}

/**
 * Render purchase actions
 * @param {Object} purchase - Purchase object
 * @returns {string} HTML string
 */
function renderPurchaseActions(purchase) {
  const purchaseId = purchase._id || purchase.id;
  
  return `
    <div class="staging-controls">
      <button class="staging-btn stage" data-action="stage" data-id="${purchaseId}">🔍 Stage</button>
      <button class="staging-btn split" data-action="split" data-id="${purchaseId}">✂️ Split</button>
      <button class="staging-btn inventory" data-action="inventory" data-id="${purchaseId}">📦 Inventory</button>
      <button class="staging-btn delete" data-action="delete" data-id="${purchaseId}" style="background: #dc2626; color: white;">🗑️ Delete</button>
    </div>
  `;
}

/**
 * Render purchase details
 * @param {Object} purchase - Purchase object
 * @param {boolean} compact - Compact mode
 * @returns {string} HTML string
 */
function renderPurchaseDetails(purchase, compact = false) {
  if (compact) {
    return `
      <div style="font-size:10px; color:#888; margin-top:1px;">
        ${purchase.seller_username || 'Unknown seller'} • ${formatDate(purchase.purchase_date, { dateStyle: 'short' })}
      </div>
    `;
  }

  return `
    <div style="font-size:10px; color:#888; margin-top:1px;">
      <div>Seller: ${purchase.seller_username || 'Unknown'}</div>
      <div>Order ID: ${purchase.order_id || 'N/A'}</div>
      <div>Date: ${formatDate(purchase.purchase_date, { dateStyle: 'short' })}</div>
      ${purchase.tracking_ref ? `<div>Tracking: ${purchase.tracking_ref}</div>` : ''}
    </div>
  `;
}

/**
 * Render empty state
 * @param {string} message - Empty state message
 * @param {string} type - Empty state type (auth, empty, error)
 * @returns {string} HTML string
 */
export function renderEmptyState(message, type = 'empty') {
  const icons = {
    auth: '🔐',
    empty: '📭',
    error: '❌'
  };
  
  const suggestions = {
    auth: 'Try refreshing the page or check OAuth authentication.',
    empty: 'Try refreshing or adding a new purchase.',
    error: 'Check your connection and try again.'
  };
  
  return `
    <div style="text-align:center; padding:40px 20px; color:#1a365d;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${icons[type] || icons.empty}</div>
      <h4>${message}</h4>
      <p>${suggestions[type] || suggestions.empty}</p>
      ${type === 'auth' ? '<button class="btn btn-primary" id="refresh-page-btn">🔄 Refresh Page</button>' : ''}
    </div>
  `;
}

/**
 * Render loading state
 * @param {string} message - Loading message
 * @returns {string} HTML string
 */
export function renderLoadingState(message = 'Loading purchases...') {
  return `
    <div class="spa-loading">
      <div class="spa-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Render error state
 * @param {string} message - Error message
 * @param {Function} onRetry - Retry callback
 * @returns {Element} DOM element
 */
export function renderErrorState(message, onRetry = null) {
  const div = document.createElement('div');
  div.className = 'spa-error';
  div.innerHTML = `
    <h4>❌ Failed to Load Purchases</h4>
    <p><strong>Error:</strong> ${message}</p>
    ${onRetry ? `<button class="btn btn-primary" data-action="purchases-retry">🔄 Try Again</button>` : ''}
  `;
  if (onRetry) {
    const btn = div.querySelector('[data-action="purchases-retry"]');
    btn?.addEventListener('click', () => onRetry());
  }
  return div;
}

/**
 * Render status bar
 * @param {Object} stats - Statistics object
 * @returns {string} HTML string
 */
export function renderStatusBar(stats) {
  const {
    totalInvestment = 0,
    purchaseCount = 0,
    averagePurchase = 0,
    lastSync = new Date(),
    sourceBreakdown = { manual: 0, auto: 0 },
    monthlyChange = '+12%'
  } = stats;

  return `
    <div class="spa-status-bar">
      <div class="spa-status-item">
        <span>💰</span>
        <span>Total Investment: <strong>${money(totalInvestment)}</strong></span>
        <span class="spa-status-badge">${monthlyChange}</span>
      </div>
      <div class="spa-status-item">
        <span>🛒</span>
        <span><strong>${purchaseCount}</strong> purchases</span>
        <span class="spa-status-badge">${sourceBreakdown.manual} manual, ${sourceBreakdown.auto} auto</span>
      </div>
      <div class="spa-status-item">
        <span>📊</span>
        <span>Average: <strong>${money(averagePurchase)}</strong></span>
      </div>
      <div class="spa-status-item">
        <span>🔄</span>
        <span>Last sync: <span>${formatDate(lastSync, { timeStyle: 'short' })}</span></span>
      </div>
    </div>
  `;
}

/**
 * Render purchase history section
 * @param {Array} purchases - Array of purchases
 * @param {Object} options - Render options
 * @returns {string} HTML string
 */
export function renderPurchaseHistory(purchases, options = {}) {
  const {
    showHeader = true,
    showActions = true,
    title = '📊 Purchase History & Staging'
  } = options;

  const headerHtml = showHeader ? `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h3 style="margin:0; color:#1a365d; font-size:18px; display:flex; align-items:center; gap:8px;">
        ${title}
        <span class="spa-status-badge">${purchases.length} items</span>
      </h3>
      ${showActions ? renderHistoryActions() : ''}
    </div>
  ` : '';

  const cardsHtml = renderPurchaseCards(purchases, options);

  return `
    <div class="recent-activity">
      ${headerHtml}
      <div id="purchaseHistoryContent">
        ${cardsHtml}
      </div>
    </div>
  `;
}

/**
 * Render history actions
 * @returns {string} HTML string
 */
function renderHistoryActions() {
  return `
    <div style="display:flex; gap:8px;">
      <button id="btn-add-purchase" class="btn btn-primary" style="padding:6px 12px; font-size:.8rem;">➕ Add Purchase</button>
      <button id="btn-ebay-sync" class="btn btn-info" style="padding:6px 12px; font-size:.8rem;">🛒 Sync eBay</button>
      <button id="btn-refresh" class="btn btn-secondary" style="padding:6px 12px; font-size:.8rem;">🔄 Refresh</button>
    </div>
  `;
}

/**
 * Calculate total for purchase
 * @param {Object} purchase - Purchase object
 * @returns {number} Total amount
 */
function calculateTotal(purchase) {
  // Try totalAmount first
  if (purchase.totalAmount != null) {
    return Number(purchase.totalAmount || 0);
  }
  
  // Try total_paid
  if (purchase.total_paid != null) {
    return Number(purchase.total_paid || 0);
  }
  
  // Calculate from components
  const pricePaid = Number(purchase.price_paid || 0);
  const shippingCost = Number(purchase.shipping_cost || 0);
  const fees = Number(purchase.fees || 0);
  
  return pricePaid + shippingCost + fees;
}

/**
 * Render purchase details modal content
 * @param {Object} purchase - Purchase object
 * @returns {string} HTML string
 */
export function renderPurchaseDetailsModal(purchase) {
  const formatCurrency = (amount) => money(amount);
  const formatDate = (date) => !date ? 'N/A' : new Date(date).toLocaleString();
  
  const formatItems = (items) => {
    if (!items || !Array.isArray(items)) return '<p>No items</p>';
    return items.map(item => `
      <div style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; margin: 4px 0;">
        <strong>${item.productName || item.name || 'Unknown Item'}</strong><br>
        <small>SKU: ${item.sku || 'N/A'} | Qty: ${item.quantity || 1} | Price: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.totalPrice)}</small>
      </div>
    `).join('');
  };

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h3 style="margin-top: 0; color: #1a365d;">Basic Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">ID:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.identifier || purchase._id || purchase.id || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Category:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.category || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Brand:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.brand || purchase.supplier || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Model:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.model || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Source:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.source || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Status:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.status || 'N/A'}</td></tr>
        </table>
      </div>

      <div>
        <h3 style="margin-top: 0; color: #1a365d;">Financial Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Price Paid:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatCurrency(purchase.price_paid)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Shipping Cost:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatCurrency(purchase.shipping_cost)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fees:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatCurrency(purchase.fees)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Amount:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #059669;">${formatCurrency(purchase.totalAmount)}</td></tr>
        </table>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h3 style="color: #1a365d;">Items</h3>
      ${formatItems(purchase.items)}
    </div>

    <div style="margin-top: 20px;">
      <h3 style="color: #1a365d;">Additional Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Order ID:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.order_id || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Seller:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.seller_username || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date of Purchase:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatDate(purchase.dateOfPurchase || purchase.orderDate)}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Created:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatDate(purchase.createdAt)}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Tracking Ref:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${purchase.tracking_ref || 'N/A'}</td></tr>
      </table>
    </div>

    ${purchase.notes ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #1a365d;">Notes</h3>
      <div style="padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 4px solid #3b82f6;">
        ${purchase.notes}
      </div>
    </div>
    ` : ''}
  `;
}
