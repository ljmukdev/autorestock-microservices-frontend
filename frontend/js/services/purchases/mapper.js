/**
 * StockPilot Purchases Mapper
 * Defensive mapping of eBay payloads to normalized purchase format
 */

import { extractBrand, extractModel, slugify, formatDateYYYYMMDD, debugLog } from '../../core/utils.js';

/**
 * Map eBay data to normalized purchase format
 * @param {Object} ebayData - Raw eBay API response
 * @returns {Array} Array of normalized purchase objects
 */
export function mapEbayDataToPurchases(ebayData) {
  if (!ebayData) {
    debugLog('No eBay data provided to mapper');
    return [];
  }

  debugLog('Mapping eBay data', { 
    hasOrders: !!ebayData.orders, 
    hasRecentPurchases: !!ebayData.recentPurchases,
    hasItems: !!ebayData.items,
    hasResults: !!ebayData.results
  });

  const purchases = [];
  
  // Handle different eBay data structures
  const orders = ebayData.orders || ebayData.recentPurchases || ebayData.items || ebayData.results || [];
  
  if (!Array.isArray(orders)) {
    debugLog('Orders data is not an array', typeof orders);
    return [];
  }

  orders.forEach((order, index) => {
    try {
      const purchase = mapSingleOrder(order, index);
      if (purchase) {
        purchases.push(purchase);
      }
    } catch (error) {
      console.warn(`Error mapping order ${index}:`, error);
    }
  });

  debugLog(`Mapped ${purchases.length} purchases from ${orders.length} orders`);
  return purchases;
}

/**
 * Map single order to purchase format
 * @param {Object} order - Single order object
 * @param {number} index - Order index
 * @returns {Object|null} Mapped purchase or null if invalid
 */
function mapSingleOrder(order, index) {
  if (!order || typeof order !== 'object') {
    return null;
  }

  // Extract line items from various possible structures
  const lineItems = extractLineItems(order);
  
  // Get first item for basic info
  const firstItem = lineItems[0] || {};
  
  // Extract title from various possible fields
  const title = extractTitle(firstItem, order);
  
  // Extract brand and model
  const brand = extractBrand(title);
  const model = extractModel(title, brand);
  
  // Extract money values
  const purchasePrice = extractMoney(firstItem.unitPrice || firstItem.price || order.total || 0);
  const totalPaid = extractOrderTotal(order, lineItems);
  
  // Extract dates
  const orderDate = extractDate(order);
  const purchaseDate = orderDate ? orderDate.split('T')[0] : new Date().toISOString().split('T')[0];
  
  // Extract seller info
  const sellerUsername = extractSeller(order);
  
  // Generate unique identifier
  const identifier = generatePurchaseIdentifier(order, title, orderDate, index);
  
  const purchase = {
    _id: identifier,
    identifier,
    platform: 'eBay',
    product_name: title,
    brand,
    model,
    order_id: order.orderId || order.order_id || order.id,
    orderDate,
    purchase_date: purchaseDate,
    seller_username: sellerUsername,
    items: lineItems.map(item => ({
      productName: item.productName || item.title || item.name || 'Unknown Item',
      sku: item.sku || item.itemId || '',
      quantity: item.quantity || 1,
      unitPrice: extractMoney(item.unitPrice || item.price || 0),
      totalPrice: extractMoney((item.unitPrice || item.price || 0) * (item.quantity || 1))
    })),
    purchase_price: purchasePrice,
    total_paid: totalPaid,
    totalAmount: totalPaid,
    delivery_status: order.orderStatus || order.status || 'Delivered',
    source: 'ebay-oauth',
    created_at: new Date().toISOString(),
    status: order.orderStatus || order.status || 'Delivered'
  };

  debugLog(`Mapped purchase: ${identifier}`, {
    title: purchase.product_name,
    brand: purchase.brand,
    total: purchase.totalAmount
  });

  return purchase;
}

/**
 * Extract line items from order
 * @param {Object} order - Order object
 * @returns {Array} Array of line items
 */
function extractLineItems(order) {
  const possiblePaths = [
    'lineItems',
    'orderLineItems', 
    'lineItemSummaries',
    'lineItem',
    'transactionArray.transaction',
    'purchaseUnits[0].items'
  ];

  for (const path of possiblePaths) {
    const items = getNestedValue(order, path);
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }
  }

  // If no line items found, create a single item from order data
  return [{
    productName: order.title || order.productName || 'eBay Purchase',
    quantity: 1,
    unitPrice: order.total || order.price || 0
  }];
}

/**
 * Extract title from item or order
 * @param {Object} item - Line item
 * @param {Object} order - Order object
 * @returns {string} Product title
 */
function extractTitle(item, order) {
  const possibleFields = [
    'productName',
    'title', 
    'description',
    'itemTitle',
    'item.title',
    'name'
  ];

  for (const field of possibleFields) {
    const value = getNestedValue(item, field) || getNestedValue(order, field);
    if (value && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return 'eBay Purchase';
}

/**
 * Extract order total from various possible fields
 * @param {Object} order - Order object
 * @param {Array} lineItems - Line items array
 * @returns {number} Order total
 */
function extractOrderTotal(order, lineItems) {
  const totalFields = [
    'total',
    'orderTotal',
    'pricingSummary.total',
    'amounts.total',
    'priceSummary.total',
    'totalAmount',
    'amountPaid',
    'checkoutTotal',
    'orderCostSummary.total'
  ];

  for (const field of totalFields) {
    const value = getNestedValue(order, field);
    if (value !== null && value !== undefined) {
      const total = extractMoney(value);
      if (total > 0) {
        return total;
      }
    }
  }

  // Fallback: sum line items
  if (lineItems && lineItems.length > 0) {
    return lineItems.reduce((sum, item) => {
      const price = extractMoney(item.unitPrice || item.price || 0);
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }

  return 0;
}

/**
 * Extract date from order
 * @param {Object} order - Order object
 * @returns {string|null} ISO date string
 */
function extractDate(order) {
  const dateFields = [
    'creationTime',
    'orderCreationDate',
    'orderDate',
    'purchaseDate',
    'paidDate',
    'transactionArray.transaction[0].createdDate'
  ];

  for (const field of dateFields) {
    const value = getNestedValue(order, field);
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (error) {
        // Continue to next field
      }
    }
  }

  return new Date().toISOString();
}

/**
 * Extract seller information
 * @param {Object} order - Order object
 * @returns {string} Seller username
 */
function extractSeller(order) {
  const sellerFields = [
    'seller.username',
    'seller.userId',
    'seller',
    'sellerName'
  ];

  for (const field of sellerFields) {
    const value = getNestedValue(order, field);
    if (value && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return 'Unknown';
}

/**
 * Extract money value from various formats
 * @param {any} value - Money value
 * @returns {number} Numeric value
 */
function extractMoney(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (value && typeof value === 'object') {
    // Handle {value: 10.99} or {amount: {value: 10.99}}
    if (value.value !== undefined) {
      return extractMoney(value.value);
    }
    if (value.amount && value.amount.value !== undefined) {
      return extractMoney(value.amount.value);
    }
  }

  return 0;
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to search
 * @param {string} path - Dot notation path
 * @returns {any} Value at path or undefined
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    if (key.includes('[') && key.includes(']')) {
      // Handle array access like 'transactionArray.transaction[0]'
      const [arrayKey, indexStr] = key.split('[');
      const index = parseInt(indexStr.replace(']', ''));
      
      if (Array.isArray(current[arrayKey]) && current[arrayKey][index] !== undefined) {
        current = current[arrayKey][index];
      } else {
        return undefined;
      }
    } else {
      current = current[key];
    }
  }
  
  return current;
}

/**
 * Generate unique purchase identifier
 * @param {Object} order - Order object
 * @param {string} title - Product title
 * @param {string} orderDate - Order date
 * @param {number} index - Order index
 * @returns {string} Unique identifier
 */
function generatePurchaseIdentifier(order, title, orderDate, index) {
  const orderId = order.orderId || order.order_id || order.id || `order_${index}`;
  const titleSlug = slugify(title).slice(0, 20);
  const dateSlug = orderDate ? formatDateYYYYMMDD(orderDate) : formatDateYYYYMMDD(new Date());
  
  return `EBAY-${titleSlug}-${dateSlug}-${orderId}`.replace(/--+/g, '-');
}
