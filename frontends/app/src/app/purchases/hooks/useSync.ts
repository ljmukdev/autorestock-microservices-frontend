import { useState } from 'react';
import { SyncResponse } from '../types';

const EBAY_API_BASE = 'https://delightful-liberation-production.up.railway.app';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncPurchases = async (days: number = 7) => {
    try {
      setSyncing(true);
      setError(null);
      
      console.log('Syncing purchases for', days, 'days');
      
      const response = await fetch(`${EBAY_API_BASE}/sync/purchases?days=${days}&limit=100`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SyncResponse = await response.json();
      console.log('Sync response:', data);
      
      if (data.success) {
        setLastSync(new Date());
        return {
          success: true,
          message: `Synced ${data.fetched} new purchases`,
          data
        };
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      console.error('Error syncing purchases:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync purchases';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    lastSync,
    error,
    syncPurchases
  };
}

