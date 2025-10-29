'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Calendar, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Download,
  Settings,
  LogOut
} from 'lucide-react';

// Enhanced interface with all fields
interface EbayPurchase {
  itemId: string;
  title: string;
  sellerUserID: string;
  price: number;
  shippingCost: number;
  quantity: number;
  transactionDate: string;
  shippedTime?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  itemStatus: string;
  orderId?: string;
  transactionId: string;
}

// Dashboard stats interface
interface DashboardStats {
  totalPurchases: number;
  totalSpent: number;
  itemsShipped: number;
  itemsInTransit: number;
  averageOrderValue: number;
  topSeller: string;
}

export default function EbayPage() {
  const [purchases, setPurchases] = useState<EbayPurchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<EbayPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';

  // Calculate dashboard stats
  const calculateStats = (purchases: EbayPurchase[]): DashboardStats => {
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.price + p.shippingCost, 0);
    const itemsShipped = purchases.filter(p => p.itemStatus === 'Despatched' || p.itemStatus === 'Delivered').length;
    const itemsInTransit = purchases.filter(p => p.itemStatus === 'In Transit' || p.itemStatus === 'Shipped').length;
    const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
    
    // Find top seller
    const sellerCounts = purchases.reduce((acc, p) => {
      acc[p.sellerUserID] = (acc[p.sellerUserID] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSeller = Object.entries(sellerCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];

    return {
      totalPurchases,
      totalSpent,
      itemsShipped,
      itemsInTransit,
      averageOrderValue,
      topSeller
    };
  };

  const stats = calculateStats(filteredPurchases);

  // Fetch purchases function
  const fetchPurchases = useCallback(async () => {
    try {
      console.log('Environment check:');
      console.log('- NEXT_PUBLIC_EBAY_SERVICE_URL:', process.env.NEXT_PUBLIC_EBAY_SERVICE_URL);
      console.log('- ebayServiceUrl:', ebayServiceUrl);
      
      const url = `${ebayServiceUrl}/purchases?limit=100`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.success && data.purchases) {
        setPurchases(data.purchases);
        setFilteredPurchases(data.purchases);
      } else {
        setPurchases([]);
        setFilteredPurchases([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  }, [ebayServiceUrl]);

  // Filter and sort purchases
  useEffect(() => {
    let filtered = [...purchases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sellerUserID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.itemStatus === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(dateFilter);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(p => new Date(p.transactionDate) >= cutoffDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
          break;
        case 'price':
          comparison = (a.price + a.shippingCost) - (b.price + b.shippingCost);
          break;
        case 'status':
          comparison = a.itemStatus.localeCompare(b.itemStatus);
          break;
        case 'seller':
          comparison = a.sellerUserID.localeCompare(b.sellerUserID);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPurchases(filtered);
  }, [purchases, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  // Sync purchases
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${ebayServiceUrl}/sync/purchases?days=30&limit=100`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setLastSyncTime(new Date());
        // Refresh purchases after sync
        await fetchPurchases();
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync purchases');
    } finally {
      setIsSyncing(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Item', 'Seller', 'Date', 'Price', 'Status', 'Tracking Number'];
    const csvContent = [
      headers.join(','),
      ...filteredPurchases.map(p => [
        `"${p.title}"`,
        p.sellerUserID,
        new Date(p.transactionDate).toLocaleDateString(),
        (p.price + p.shippingCost).toFixed(2),
        p.itemStatus,
        p.trackingNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebay-purchases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Initial load of purchases
  useEffect(() => {
    setIsLoading(true);
    fetchPurchases();
  }, [fetchPurchases]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-purple-600">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading eBay purchases...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-600">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Purchases</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-600">
      {/* Main Content Container - Matching AutoRestock Dashboard Style */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Main White Frame Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">eBay Purchases Dashboard</h1>
            </div>
            
            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Account</span>
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={() => window.location.href = `${ebayServiceUrl}/oauth/login`}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Switch eBay Account</span>
                  </button>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Manual Sync'}</span>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Welcome Message */}
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your eBay purchase management dashboard. Track orders, monitor spending, and manage your purchase history.
          </p>

          {/* Sync Status */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            {lastSyncTime && (
              <span>Last synced: {lastSyncTime.toLocaleString()}</span>
            )}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">eBay Purchases</h1>
          <p className="text-lg text-gray-600 mb-4">
            Manage your purchase history and track orders
          </p>
          
          {/* Sync Status */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {lastSyncTime && (
              <span>Last synced: {lastSyncTime.toLocaleString()}</span>
            )}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

          {/* Dashboard Stats - Matching AutoRestock Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalPurchases}</div>
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TOTAL PURCHASES</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">£{stats.totalSpent.toFixed(2)}</div>
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TOTAL SPENT</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">{stats.itemsShipped}</div>
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ITEMS SHIPPED</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-teal-500 mb-2">£{stats.averageOrderValue.toFixed(2)}</div>
              <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">AVG ORDER VALUE</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items or sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Despatched">Despatched</option>
                <option value="Delivered">Delivered</option>
                <option value="In Transit">In Transit</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="seller-asc">Seller (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredPurchases.length} of {purchases.length} purchases
            </p>
          </div>

          {/* Purchases List - Card Layout */}
          {filteredPurchases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Package className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases found</h3>
              <p className="text-gray-600 mb-4">
                {purchases.length === 0 
                  ? "Connect your eBay account to start tracking purchases"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {purchases.length === 0 && (
                <button
                  onClick={() => window.location.href = `${ebayServiceUrl}/oauth/login`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Connect eBay Account</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPurchases.map((purchase) => (
                <div key={purchase.itemId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {purchase.title}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Seller:</span>
                        <span className="font-medium text-gray-900">{purchase.sellerUserID}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(purchase.transactionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-bold text-gray-900">
                          £{(purchase.price + purchase.shippingCost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {purchase.trackingNumber && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Tracking:</span>
                        <button
                          onClick={() => copyToClipboard(purchase.trackingNumber!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-mono text-sm text-gray-900">
                        {purchase.trackingNumber}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      purchase.itemStatus === 'Despatched' ? 'bg-green-100 text-green-800' :
                      purchase.itemStatus === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                      purchase.itemStatus === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                      purchase.itemStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.itemStatus}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(purchase.itemId)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy Item ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://www.ebay.co.uk/itm/${purchase.itemId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View on eBay"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
