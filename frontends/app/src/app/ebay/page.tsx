'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple interface for testing
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

export default function EbayPage() {
  const [purchases, setPurchases] = useState<EbayPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';

  useEffect(() => {
    let mounted = true;

    const fetchPurchases = async () => {
      try {
        console.log('Fetching purchases from:', ebayServiceUrl);
        const response = await fetch(`${ebayServiceUrl}/purchases?limit=10`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!mounted) return;

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (data.success && data.purchases) {
          setPurchases(data.purchases);
        } else {
          setPurchases([]);
        }
      } catch (err) {
        console.error('Error fetching purchases:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load purchases');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPurchases();

    return () => {
      mounted = false;
    };
  }, [ebayServiceUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <Link href="/ebay" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  eBay Purchases
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading purchases...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <Link href="/ebay" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  eBay Purchases
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Purchases</h2>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">eBay Purchases</h1>
          <p className="text-lg text-gray-600">
            Showing {purchases.length} purchases
          </p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases found</h3>
            <p className="text-gray-600 mb-4">
              Connect your eBay account to start tracking purchases
            </p>
            <Link
              href="/users/onboarding"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect eBay Account
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.itemId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {purchase.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{purchase.sellerUserID}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(purchase.transactionDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          £{(purchase.price + purchase.shippingCost).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {purchase.itemStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
