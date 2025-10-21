/**
 * EbaySyncControls.tsx
 * Controls for syncing eBay purchase data
 */

import React, { useState } from 'react';
import { Button } from '@autorestock/ui-kit';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface EbaySyncControlsProps {
  lastSyncTime?: string;
  onSync: (days: number) => Promise<void>;
}

export default function EbaySyncControls({ lastSyncTime, onSync }: EbaySyncControlsProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedDays, setSelectedDays] = useState(7);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    
    try {
      await onSync(selectedDays);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const dayOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync eBay Purchases</h3>
          <p className="text-sm text-gray-600">
            {lastSyncTime ? (
              <>Last synced: {new Date(lastSyncTime).toLocaleString()}</>
            ) : (
              'No sync data available'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            disabled={isSyncing}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {syncStatus === 'success' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-800">
            Successfully synced purchases with tracking data!
          </span>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-800">
            Failed to sync purchases. Please try again.
          </span>
        </div>
      )}
    </div>
  );
}

