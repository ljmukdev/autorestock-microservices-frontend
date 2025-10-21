'use client'

import React, { useState, useEffect } from 'react';
import { 
  EbayDashboard, 
  EbaySyncControls, 
  EbayPurchaseFilters, 
  EbayPurchasesList,
  type EbayPurchase 
} from '@autorestock/ui-user';
import Link from 'next/link';

export default function EbayPage() {
  const [purchases, setPurchases] = useState<EbayPurchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<EbayPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';

  // Fetch purchases on mount
  useEffect(() => {
    fetchPurchases();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...purchases];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.sellerUserID.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(p => 
        new Date(p.transactionDate) >= cutoffDate
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.itemStatus === statusFilter);
    }

    setFilteredPurchases(filtered);
  }, [purchases, searchQuery, dateRange, statusFilter]);

  const fetchPurchases = async (limit: number = 100) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${ebayServiceUrl}/purchases?limit=${limit}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const data = await response.json();
      
      if (data.success && data.purchases) {
        setPurchases(data.purchases);
        setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (days: number) => {
    try {
      const response = await fetch(`${ebayServiceUrl}/sync/purchases?days=${days}&limit=100`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      // Refresh purchases after sync
      await fetchPurchases();
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  };

  // Calculate stats
  const stats = {
    totalPurchases: purchases.length,
    totalSpent: purchases.reduce((sum, p) => sum + p.price + p.shippingCost, 0),
    itemsShipped: purchases.filter(p => p.itemStatus === 'Despatched' || p.itemStatus === 'Delivered').length,
    itemsInTransit: purchases.filter(p => p.itemStatus === 'In Transit' || p.itemStatus === 'Despatched').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">AutoRestock</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/users/onboarding" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                User Onboarding
              </Link>
              <Link href="/ebay" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                eBay Purchases
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">eBay Purchases</h1>
          <p className="text-lg text-gray-600">
            View and manage your eBay purchase history with tracking information
          </p>
        </div>

        {/* Dashboard Stats */}
        <EbayDashboard stats={stats} />

        {/* Sync Controls */}
        <EbaySyncControls 
          lastSyncTime={lastSyncTime}
          onSync={handleSync}
        />

        {/* Filters */}
        <EbayPurchaseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredPurchases.length} of {purchases.length} purchases
          </div>
        )}

        {/* Purchases List */}
        <EbayPurchasesList 
          purchases={filteredPurchases}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

