import React, { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { useSync } from '../hooks/useSync';

interface SyncControlsProps {
  onSyncComplete: () => void;
}

export default function SyncControls({ onSyncComplete }: SyncControlsProps) {
  const { syncing, lastSync, error, syncPurchases } = useSync();
  const [selectedDays, setSelectedDays] = useState(7);

  const handleSync = async () => {
    const result = await syncPurchases(selectedDays);
    
    if (result.success) {
      // Show success toast (you can implement toast notifications later)
      console.log('Sync successful:', result.message);
      onSyncComplete(); // Refresh the purchases list
    } else {
      // Show error toast
      console.error('Sync failed:', result.message);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sync Controls</h3>
            <p className="text-sm text-gray-600">
              Last sync: {formatLastSync(lastSync)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={syncing}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
