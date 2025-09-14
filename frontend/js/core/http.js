/**
 * StockPilot HTTP Client
 * Strict fetch wrapper with error handling and retry logic
 */

import { DEFAULT_REQUEST_OPTIONS, debugLog } from './config.js';

/**
 * Strict fetch that throws on non-2xx responses
 */
export async function fetchJSONStrict(url, options = {}) {
  const mergedOptions = {
    ...DEFAULT_REQUEST_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_REQUEST_OPTIONS.headers,
      ...options.headers
    }
  };

  debugLog(`Fetching: ${url}`, mergedOptions);

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const error = new Error(`HTTP ${response.status} ${response.statusText} @ ${url}\n${errorText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.body = errorText;
      error.url = url;
      throw error;
    }

    const data = await response.json();
    debugLog(`Success: ${url}`, { status: response.status, dataKeys: Object.keys(data) });
    return data;
  } catch (error) {
    debugLog(`Error: ${url}`, error);
    throw error;
  }
}

/**
 * GET request with JSON response
 */
export async function getJSON(url, params = {}, options = {}) {
  const urlObj = new URL(url);
  
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && typeof value !== 'function') {
        urlObj.searchParams.set(key, String(value));
      }
    });
  }

  return fetchJSONStrict(urlObj.toString(), {
    method: 'GET',
    ...options
  });
}

/**
 * POST request with JSON body
 */
export async function postJSON(url, data = {}, options = {}) {
  return fetchJSONStrict(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * PUT request with JSON body
 */
export async function putJSON(url, data = {}, options = {}) {
  return fetchJSONStrict(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Retry wrapper for failed requests
 */
export async function withRetry(requestFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        debugLog(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
  
  throw lastError;
}

/**
 * Timeout wrapper for requests
 */
export function withTimeout(promise, timeoutMs = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

/**
 * Error handler for HTTP requests
 */
export function handleHttpError(error) {
  if (error.status === 401) {
    return {
      type: 'auth_required',
      message: 'Authentication required. Please log in.',
      action: 'redirect_to_auth'
    };
  }
  
  if (error.status === 403) {
    return {
      type: 'forbidden',
      message: 'Access denied. Insufficient permissions.',
      action: 'contact_admin'
    };
  }
  
  if (error.status === 404) {
    return {
      type: 'not_found',
      message: 'Resource not found.',
      action: 'check_url'
    };
  }
  
  if (error.status >= 500) {
    return {
      type: 'server_error',
      message: 'Server error. Please try again later.',
      action: 'retry_later'
    };
  }
  
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred.',
    action: 'contact_support'
  };
}