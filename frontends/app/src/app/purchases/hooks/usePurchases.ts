import { useState, useEffect } from 'react';
import { EbayPurchase, ApiResponse } from '../types';

const EBAY_API_BASE = 'https://delightful-liberation-production.up.railway.app';

export function usePurchases() {
  const [purchases, setPurchases] = useState<EbayPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching purchases from:', `${EBAY_API_BASE}/purchases?limit=100`);
      
      const response = await fetch(`${EBAY_API_BASE}/purchases?limit=100`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<EbayPurchase> = await response.json();
      console.log('API response:', data);
      
      if (data.success && data.purchases) {
        setPurchases(data.purchases);
      } else {
        throw new Error(data.error || 'Failed to fetch purchases');
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return { 
    purchases, 
    loading, 
    error, 
    refetch: fetchPurchases 
  };
}
