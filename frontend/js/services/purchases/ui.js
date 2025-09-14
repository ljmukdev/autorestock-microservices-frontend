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
 * Render purchase list (table format)
 * @param {Array} purchases - Array of purchase objects
 * @param {Object} options - Render options
 * @returns {string} HTML string
 */
export function renderPurchaseList(purchases, options = {}) {
  if (!purchases || purchases.length === 0) {
    return renderEmptyState(options.emptyMessage || 'No purchases found');
  }

  debugLog(`Rendering ${purchases.length} purchases in list format`);

  const {
    showActions = true,
    showDetails = true
  } = options;

  const tableRows = purchases.map(purchase => renderPurchaseListRow(purchase, options));

  return `
    <div class="purchase-list-container">
      <table class="purchase-list-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input type="checkbox" id="select-all-purchases" class="purchase-checkbox" title="Select all purchases">
            </th>
            <th style="width: 40px;">📦</th>
            <th>Product</th>
            <th style="width: 100px;">Platform</th>
            <th style="width: 100px;">Amount</th>
            <th style="width: 120px;">Date</th>
            <th style="width: 100px;">Status</th>
            ${showActions ? '<th style="width: 200px;">Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${tableRows.join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render single purchase list row
 * @param {Object} purchase - Purchase object
 * @param {Object} options - Render options
 * @returns {string} HTML string
 */
function renderPurchaseListRow(purchase, options = {}) {
  const {
    showActions = true,
    showDetails = true
  } = options;

  const timeAgoStr = timeAgo(new Date(purchase.orderDate || purchase.purchase_date || purchase.createdAt));
  const platformEmoji = getPlatformEmoji(purchase.platform || 'Unknown');
  const total = calculateTotal(purchase);
  const productName = purchase.product_name || purchase.items?.[0]?.productName || 'Unknown Item';
  const brand = purchase.brand || purchase.supplier || 'Unknown';
  const status = purchase.status || purchase.delivery_status || 'Unknown';
  const purchaseDate = formatDate(purchase.purchase_date || purchase.orderDate, { dateStyle: 'short' });

  const actionsHtml = showActions ? renderPurchaseListActions(purchase) : '';

  return `
    <tr class="purchase-list-row" data-id="${purchase._id || purchase.id}" style="cursor: pointer;" title="Click to view details">
      <td class="purchase-checkbox-cell">
        <input type="checkbox" class="purchase-checkbox" data-purchase-id="${purchase._id || purchase.id}" title="Select this purchase">
      </td>
      <td class="purchase-icon-cell">${platformEmoji}</td>
      <td class="purchase-product-cell">
        <div class="purchase-product-name"><strong>${brand} ${productName}</strong></div>
        <div class="purchase-product-details">
          ${purchase.seller_username ? `Seller: ${purchase.seller_username}` : ''}
          ${purchase.order_id ? ` • Order: ${purchase.order_id}` : ''}
        </div>
      </td>
      <td class="purchase-platform-cell">${purchase.platform || 'Unknown'}</td>
      <td class="purchase-amount-cell"><strong>${money(total)}</strong></td>
      <td class="purchase-date-cell">${purchaseDate}</td>
      <td class="purchase-status-cell">
        <span class="status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}">${status}</span>
      </td>
      ${showActions ? `<td class="purchase-actions-cell">${actionsHtml}</td>` : ''}
    </tr>
  `;
}

/**
 * Render purchase actions for list view
 * @param {Object} purchase - Purchase object
 * @returns {string} HTML string
 */
function renderPurchaseListActions(purchase) {
  const purchaseId = purchase._id || purchase.id;
  
  return `
    <div class="purchase-list-actions">
      <button class="btn btn-small action-stage" data-action="stage" data-id="${purchaseId}" title="Stage for processing">🔍</button>
      <button class="btn btn-small action-split" data-action="split" data-id="${purchaseId}" title="Split purchase">✂️</button>
      <button class="btn btn-small action-inventory" data-action="inventory" data-id="${purchaseId}" title="Move to inventory">📦</button>
      <button class="btn btn-small action-delete" data-action="delete" data-id="${purchaseId}" title="Delete purchase">🗑️</button>
    </div>
  `;
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
      <button class="btn btn-small action-stage" data-action="stage" data-id="${purchaseId}">🔍 Stage</button>
      <button class="btn btn-small action-split" data-action="split" data-id="${purchaseId}">✂️ Split</button>
      <button class="btn btn-small action-inventory" data-action="inventory" data-id="${purchaseId}">📦 Inventory</button>
      <button class="btn btn-small action-delete" data-action="delete" data-id="${purchaseId}">🗑️ Delete</button>
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
    title = '📊 Purchase History & Staging',
    viewMode = 'list' // 'list' or 'cards'
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

  const contentHtml = viewMode === 'list' ? 
    renderPurchaseList(purchases, options) : 
    renderPurchaseCards(purchases, options);

  return `
    <div class="recent-activity">
      ${headerHtml}
      <div id="purchaseHistoryContent">
        ${contentHtml}
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
      <button id="btn-add-purchase" class="btn btn-primary btn-small">➕ Add Purchase</button>
      <button id="btn-ebay-sync" class="btn btn-info btn-small">🛒 Sync eBay</button>
      <button id="btn-ebay-login" class="btn btn-warning btn-small">🔐 eBay Login</button>
      <button id="btn-refresh" class="btn btn-secondary btn-small">Refresh</button>
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
  const formatShortDate = (date) => !date ? 'N/A' : new Date(date).toLocaleDateString('en-GB');
  const formatDateTime = (date) => !date ? 'N/A' : new Date(date).toLocaleString('en-GB');
  
  const formatItems = (items) => {
    if (!items || !Array.isArray(items)) return '<p>No items</p>';
    return items.map((item, index) => `
      <div class="purchase-item">
        <div class="purchase-item-header">
          <div class="purchase-item-name">${item.productName || item.name || 'Unknown Item'}</div>
          <div class="purchase-item-index">Item ${index + 1}</div>
        </div>
        <div class="purchase-item-details">
          <div><strong>SKU:</strong> ${item.sku || 'N/A'}</div>
          <div><strong>Qty:</strong> ${item.quantity || 1}</div>
          <div><strong>Unit Price:</strong> ${formatCurrency(item.unitPrice)}</div>
          <div><strong>Total:</strong> ${formatCurrency(item.totalPrice)}</div>
        </div>
        ${item.description ? `<div class="purchase-item-description">${item.description}</div>` : ''}
      </div>
    `).join('');
  };

  const total = calculateTotal(purchase);
  const productName = purchase.product_name || purchase.items?.[0]?.productName || 'Unknown Item';
  const brand = purchase.brand || purchase.supplier || 'Unknown';
  
  // Calculate additional financial metrics
  const pricePaid = purchase.price_paid || 0;
  const shippingCost = purchase.shipping_cost || 0;
  const fees = purchase.fees || 0;
  const tax = purchase.tax || 0;
  const discount = purchase.discount || 0;
  const subtotal = pricePaid + shippingCost + fees + tax - discount;

  return `
    <div class="purchase-details-grid">
      <div class="purchase-details-section">
        <h3>📦 Product Information</h3>
        <table class="purchase-details-table">
          <tr><td>Product Name:</td><td>${productName}</td></tr>
          <tr><td>Brand:</td><td>${brand}</td></tr>
          <tr><td>Model:</td><td>${purchase.model || 'N/A'}</td></tr>
          <tr><td>Category:</td><td>${purchase.category || 'N/A'}</td></tr>
          <tr><td>Platform:</td><td>${purchase.platform || 'N/A'}</td></tr>
          <tr><td>Source:</td><td>${purchase.source || 'N/A'}</td></tr>
          <tr><td>Product ID:</td><td>${purchase.product_id || purchase.itemId || 'N/A'}</td></tr>
          <tr><td>Condition:</td><td>${purchase.condition || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="purchase-details-section">
        <h3>💰 Financial Breakdown</h3>
        <table class="purchase-details-table">
          <tr><td>Item Price:</td><td>${formatCurrency(pricePaid)}</td></tr>
          <tr><td>Unit Price:</td><td>${formatCurrency(pricePaid)}</td></tr>
          <tr><td>Shipping Cost:</td><td>${formatCurrency(shippingCost)}</td></tr>
          <tr><td>VAT:</td><td>${formatCurrency(purchase.vat || tax)}</td></tr>
          <tr><td>Fees:</td><td>${formatCurrency(fees)}</td></tr>
          <tr><td>Discount:</td><td style="color: #059669;">-${formatCurrency(discount)}</td></tr>
          <tr><td><strong>Subtotal:</strong></td><td><strong>${formatCurrency(subtotal)}</strong></td></tr>
          <tr><td><strong>Order Total:</strong></td><td><strong style="color: #059669; font-size: 1.1rem;">${formatCurrency(total)}</strong></td></tr>
        </table>
        ${purchase.vat ? `
        <div class="vat-notice">
          <small>*VAT collected on this transaction based on applicable laws.</small>
        </div>
        ` : ''}
      </div>

      <div class="purchase-details-section">
        <h3>📋 Order Details</h3>
        <table class="purchase-details-table">
          <tr><td>Order ID:</td><td>${purchase.order_id || 'N/A'}</td></tr>
          <tr><td>Purchase ID:</td><td>${purchase.identifier || purchase._id || purchase.id || 'N/A'}</td></tr>
          <tr><td>Transaction ID:</td><td>${purchase.transaction_id || purchase.transactionId || 'N/A'}</td></tr>
          <tr><td>Status:</td><td><span class="status-badge status-${(purchase.status || purchase.delivery_status || 'unknown').toLowerCase().replace(/\s+/g, '-')}">${purchase.status || purchase.delivery_status || 'Unknown'}</span></td></tr>
          <tr><td>Payment Status:</td><td>${purchase.payment_status || 'N/A'}</td></tr>
          <tr><td>Payment Method:</td><td>${purchase.payment_method || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="purchase-details-section">
        <h3>📅 Timeline</h3>
        <table class="purchase-details-table">
          <tr><td>Order Date:</td><td>${formatShortDate(purchase.orderDate || purchase.purchase_date)}</td></tr>
          <tr><td>Purchase Date:</td><td>${formatShortDate(purchase.purchase_date)}</td></tr>
          <tr><td>Payment Date:</td><td>${formatShortDate(purchase.payment_date || purchase.paidDate)}</td></tr>
          <tr><td>Shipped Date:</td><td>${formatShortDate(purchase.shipped_date || purchase.shipDate)}</td></tr>
          <tr><td>Delivered Date:</td><td>${formatShortDate(purchase.delivered_date || purchase.deliveryDate)}</td></tr>
          <tr><td>Created in System:</td><td>${formatShortDate(purchase.createdAt)}</td></tr>
          <tr><td>Last Updated:</td><td>${formatShortDate(purchase.updatedAt || purchase.lastModified)}</td></tr>
        </table>
      </div>

      <div class="purchase-details-section">
        <h3>👤 Seller Information</h3>
        <table class="purchase-details-table">
          <tr><td>Seller Username:</td><td>${purchase.seller_username || 'N/A'}</td></tr>
          <tr><td>Seller ID:</td><td>${purchase.seller_id || purchase.sellerId || 'N/A'}</td></tr>
          <tr><td>Seller Rating:</td><td>${purchase.seller_rating || 'N/A'}</td></tr>
          <tr><td>Item Number:</td><td>${purchase.item_number || purchase.itemId || 'N/A'}</td></tr>
          <tr><td>Returns Accepted:</td><td>${purchase.returns_accepted ? 'Yes' : 'No'}</td></tr>
        </table>
      </div>

      <div class="purchase-details-section">
        <h3>📦 Tracking & Delivery</h3>
        <table class="purchase-details-table">
          <tr><td>Tracking Number:</td><td>${purchase.tracking_ref || purchase.trackingNumber || 'N/A'}</td></tr>
          <tr><td>Carrier:</td><td>${purchase.carrier || purchase.shipping_carrier || 'N/A'}</td></tr>
          <tr><td>Shipping Method:</td><td>${purchase.shipping_method || 'N/A'}</td></tr>
          <tr><td>Delivery Status:</td><td>${purchase.delivery_status || 'N/A'}</td></tr>
          <tr><td>Expected Delivery:</td><td>${purchase.expected_delivery || purchase.arriving_by || 'N/A'}</td></tr>
          <tr><td>Delivery Progress:</td><td>${purchase.delivery_progress || 'N/A'}</td></tr>
        </table>
        ${purchase.tracking_ref ? `
        <div class="tracking-actions">
          <button class="btn btn-small btn-primary" onclick="window.open('https://www.royalmail.com/track-your-item#/tracking-results/${purchase.tracking_ref}', '_blank')">
            📦 Track Package
          </button>
        </div>
        ` : ''}
      </div>

      <div class="purchase-details-section">
        <h3>📍 Delivery Address</h3>
        <div class="address-display">
          ${purchase.delivery_address ? `
            <div class="address-block">
              <strong>${purchase.delivery_name || 'Delivery Address'}</strong><br>
              ${purchase.delivery_address.replace(/\n/g, '<br>')}
            </div>
          ` : `
            <div class="address-block">
              <strong>Shipping Address:</strong><br>
              ${purchase.shipping_address || 'N/A'}
            </div>
          `}
        </div>
        <table class="purchase-details-table">
          <tr><td>Country:</td><td>${purchase.country || 'N/A'}</td></tr>
          <tr><td>Currency:</td><td>${purchase.currency || 'GBP'}</td></tr>
          <tr><td>Language:</td><td>${purchase.language || 'en'}</td></tr>
        </table>
      </div>

      <div class="purchase-details-section">
        <h3>💳 Payment Details</h3>
        <table class="purchase-details-table">
          <tr><td>Payment Method:</td><td>${purchase.payment_method || 'N/A'}</td></tr>
          <tr><td>Card Ending:</td><td>${purchase.card_ending || 'N/A'}</td></tr>
          <tr><td>Payment Status:</td><td>${purchase.payment_status || 'N/A'}</td></tr>
          <tr><td>Payment Date:</td><td>${formatShortDate(purchase.payment_date || purchase.paidDate)}</td></tr>
          <tr><td>Payment Name:</td><td>${purchase.payment_name || 'N/A'}</td></tr>
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

    <div class="purchase-details-section">
      <h3>🔧 Technical Details</h3>
      <table class="purchase-details-table">
        <tr><td>Data Source:</td><td>${purchase.source || 'eBay OAuth'}</td></tr>
        <tr><td>API Version:</td><td>${purchase.api_version || 'N/A'}</td></tr>
        <tr><td>Raw Data Available:</td><td>${purchase.raw_data ? 'Yes' : 'No'}</td></tr>
        <tr><td>Last Synced:</td><td>${formatDateTime(purchase.last_synced || purchase.syncedAt)}</td></tr>
        <tr><td>Data Quality Score:</td><td>${purchase.data_quality_score || 'N/A'}</td></tr>
      </table>
    </div>
  `;
}
