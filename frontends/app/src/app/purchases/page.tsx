'use client';

import { useState, useMemo } from 'react';
import { usePurchases } from './hooks/usePurchases';
import { FilterState, PurchaseStats } from './types';
import StatsCards from './components/StatsCards';
import SyncControls from './components/SyncControls';

export default function PurchasesPage() {
  const { purchases, loading, error, refetch } = usePurchases();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    status: []
  });

  // Calculate stats
  const stats: PurchaseStats = useMemo(() => {
    return {
      total: purchases.length,
      totalSpent: purchases.reduce((sum, p) => sum + p.price + (p.shippingCost || 0), 0),
      shipped: purchases.filter(p => p.itemStatus === 'Despatched').length,
      inTransit: purchases.filter(p => p.shippedTime && p.itemStatus === 'Despatched').length
    };
  }, [purchases]);

  // Apply filters
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = purchase.title.toLowerCase().includes(searchLower);
        const matchesSeller = purchase.sellerUserID.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesSeller) return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const purchaseDate = new Date(purchase.transactionDate);
        const now = new Date();
        const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
        const daysAgo = daysMap[filters.dateRange];
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        if (purchaseDate < cutoffDate) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(purchase.itemStatus)) {
        return false;
      }

      return true;
    });
  }, [purchases, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading purchases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 text-lg font-semibold mb-4">Error Loading Purchases</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header matching StockPilot style */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900">eBay Purchases</h1>
          </div>
          <p className="text-gray-600">Track and manage your eBay purchase history</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Sync Controls */}
        <SyncControls onSyncComplete={refetch} />

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredPurchases.length} of {purchases.length} purchases
        </div>

        {/* Temporary Purchase List - will be replaced with proper component in Phase 2 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchases</h3>
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No purchases found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPurchases.slice(0, 5).map((purchase, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {purchase.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Seller: {purchase.sellerUserID} • {new Date(purchase.transactionDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          £{purchase.price.toFixed(2)} {purchase.shippingCost > 0 ? `(+ £${purchase.shippingCost.toFixed(2)} shipping)` : '(free shipping)'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {purchase.itemStatus}
                        </span>
                        {purchase.trackingNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            {purchase.shippingCarrier}: {purchase.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPurchases.length > 5 && (
                  <p className="text-center text-sm text-gray-500 pt-4">
                    And {filteredPurchases.length - 5} more purchases...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
