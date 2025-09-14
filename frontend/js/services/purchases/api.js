/**
 * StockPilot Purchases API
 * Handles all purchase-related API calls
 */

import { getJSON, postJSON, putJSON, deleteJSON, withRetry, withTimeout, handleHttpError } from '../../core/http.js';
import { API_ENDPOINTS, debugLog } from '../../core/config.js';

/**
 * Get purchases from eBay service
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of purchases to fetch
 * @param {string} params.status - Purchase status filter
 * @param {string} params.source - Purchase source filter
 * @returns {Promise<Object>} API response with purchases data
 */
export async function getPurchases(params = {}) {
  const { limit = 100, status, source } = params;
  
  const queryParams = { limit };
  if (status) queryParams.status = status;
  if (source) queryParams.source = source;
  
  debugLog('Fetching purchases', queryParams);
  
  try {
    // Log the actual URL being requested for debugging
    const testUrl = new URL(API_ENDPOINTS.PURCHASES);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        testUrl.searchParams.set(key, value);
      }
    });
    debugLog('Request URL:', testUrl.toString());
    
    const response = await withRetry(
      () => withTimeout(
        getJSON(API_ENDPOINTS.PURCHASES, queryParams),
        15000 // 15 second timeout
      ),
      2, // 2 retries
      1000 // 1 second delay
    );
    
    // Expose raw payload for debugging
    if (typeof window !== 'undefined') {
      window.__ebayRaw = response?.data;
    }
    
    debugLog('Purchases fetched successfully', {
      success: response.success,
      dataKeys: response.data ? Object.keys(response.data) : [],
      ordersCount: response.data?.orders?.length || 0,
      recentPurchasesCount: response.data?.recentPurchases?.length || 0
    });
    
    return response;
  } catch (error) {
    debugLog('Error fetching purchases', error);
    throw error;
  }
}

/**
 * Get purchase by ID
 * @param {string} purchaseId - Purchase ID
 * @returns {Promise<Object>} Purchase data
 */
export async function getPurchaseById(purchaseId) {
  if (!purchaseId) {
    throw new Error('Purchase ID is required');
  }
  
  debugLog(`Fetching purchase: ${purchaseId}`);
  
  try {
    const response = await getJSON(`${API_ENDPOINTS.PURCHASES}/${purchaseId}`);
    return response;
  } catch (error) {
    debugLog(`Error fetching purchase ${purchaseId}`, error);
    throw error;
  }
}

/**
 * Create new purchase
 * @param {Object} purchaseData - Purchase data
 * @returns {Promise<Object>} Created purchase
 */
export async function createPurchase(purchaseData) {
  if (!purchaseData) {
    throw new Error('Purchase data is required');
  }
  
  debugLog('Creating purchase', purchaseData);
  
  try {
    const response = await postJSON(API_ENDPOINTS.PURCHASES, purchaseData);
    debugLog('Purchase created successfully', response);
    return response;
  } catch (error) {
    debugLog('Error creating purchase', error);
    throw error;
  }
}

/**
 * Update existing purchase
 * @param {string} purchaseId - Purchase ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated purchase
 */
export async function updatePurchase(purchaseId, updateData) {
  if (!purchaseId) {
    throw new Error('Purchase ID is required');
  }
  
  if (!updateData) {
    throw new Error('Update data is required');
  }
  
  debugLog(`Updating purchase: ${purchaseId}`, updateData);
  
  try {
    const response = await putJSON(`${API_ENDPOINTS.PURCHASES}/${purchaseId}`, updateData);
    debugLog('Purchase updated successfully', response);
    return response;
  } catch (error) {
    debugLog(`Error updating purchase ${purchaseId}`, error);
    throw error;
  }
}

/**
 * Delete purchase
 * @param {string} purchaseId - Purchase ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deletePurchase(purchaseId) {
  if (!purchaseId) {
    throw new Error('Purchase ID is required');
  }
  
  debugLog(`Deleting purchase: ${purchaseId}`);
  
  try {
    const response = await deleteJSON(`${API_ENDPOINTS.PURCHASES}/${purchaseId}`);
    debugLog('Purchase deleted successfully', response);
    return response;
  } catch (error) {
    debugLog(`Error deleting purchase ${purchaseId}`, error);
    throw error;
  }
}

/**
 * Sync purchases from eBay
 * @param {Object} params - Sync parameters
 * @returns {Promise<Object>} Sync result
 */
export async function syncPurchases(params = {}) {
  debugLog('Syncing purchases from eBay', params);
  
  try {
    const response = await withRetry(
      () => withTimeout(
        getJSON(`${API_ENDPOINTS.PURCHASES}/sync`, params),
        30000 // 30 second timeout for sync
      ),
      1, // 1 retry for sync
      2000 // 2 second delay
    );
    
    debugLog('Purchases synced successfully', response);
    return response;
  } catch (error) {
    debugLog('Error syncing purchases', error);
    throw error;
  }
}

/**
 * Get purchase statistics
 * @returns {Promise<Object>} Purchase statistics
 */
export async function getPurchaseStats() {
  debugLog('Fetching purchase statistics');
  
  try {
    const response = await getJSON(`${API_ENDPOINTS.PURCHASES}/stats`);
    debugLog('Purchase stats fetched successfully', response);
    return response;
  } catch (error) {
    debugLog('Error fetching purchase stats', error);
    throw error;
  }
}

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - API error
 * @returns {Object} User-friendly error info
 */
export function handlePurchaseApiError(error) {
  const httpError = handleHttpError(error);
  
  // Add purchase-specific error handling
  if (error.message.includes('purchase not found')) {
    return {
      ...httpError,
      type: 'purchase_not_found',
      message: 'Purchase not found. It may have been deleted.',
      action: 'refresh_list'
    };
  }
  
  if (error.message.includes('duplicate purchase')) {
    return {
      ...httpError,
      type: 'duplicate_purchase',
      message: 'A purchase with this identifier already exists.',
      action: 'check_identifier'
    };
  }
  
  return httpError;
}
