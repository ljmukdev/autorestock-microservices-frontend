/**
 * GET request with JSON response
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function getJSON(url, params = {}, options = {}) {
  const urlObj = new URL(url);
  
  // Only add query parameters if params is a plain object with valid values
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    Object.entries(params).forEach(([key, value]) => {
      // Skip undefined, null, empty strings, and function values
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