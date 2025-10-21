/**
 * AutoRestock Purchase Service
 * Handles API calls to eBay microservice
 */

class PurchaseService {
  constructor() {
    this.apiBase = 'https://delightful-liberation-production.up.railway.app';
  }

  async getPurchases(options = {}) {
    const { limit = 100 } = options;
    try {
      const response = await fetch(`${this.apiBase}/purchases?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PurchaseService] Error fetching purchases:', error);
      throw error;
    }
  }

  async syncPurchases(options = {}) {
    const { days = 7, limit = 100 } = options;
    try {
      const response = await fetch(`${this.apiBase}/sync/purchases?days=${days}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[PurchaseService] Error syncing purchases:', error);
      throw error;
    }
  }
}

const purchaseService = new PurchaseService();
export default purchaseService;