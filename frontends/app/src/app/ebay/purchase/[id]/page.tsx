'use client'

import React, { useState, useEffect } from 'react';
import { EbayPurchaseDetail, type EbayPurchase } from '@autorestock/ui-user';
import { Loading } from '@autorestock/ui-kit';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PurchaseDetailPage() {
  const params = useParams();
  const itemId = params?.id as string;
  
  const [purchase, setPurchase] = useState<EbayPurchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';

  useEffect(() => {
    if (itemId) {
      fetchPurchaseDetail();
    }
  }, [itemId]);

  const fetchPurchaseDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all purchases and find the one with matching itemId
      const response = await fetch(`${ebayServiceUrl}/purchases?limit=1000`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase details');
      }

      const data = await response.json();
      
      if (data.success && data.purchases) {
        const foundPurchase = data.purchases.find((p: EbayPurchase) => p.itemId === itemId);
        
        if (foundPurchase) {
          setPurchase(foundPurchase);
        } else {
          setError('Purchase not found');
        }
      }
    } catch (err) {
      console.error('Error fetching purchase detail:', err);
      setError('Failed to load purchase details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
                <Link href="/ebay" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  eBay Purchases
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
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
                <Link href="/ebay" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                  eBay Purchases
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              {error || 'Purchase Not Found'}
            </h2>
            <p className="text-red-700 mb-4">
              The purchase you're looking for could not be found.
            </p>
            <Link href="/ebay">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Back to Purchases
              </button>
            </Link>
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
              <Link href="/ebay" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                eBay Purchases
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <EbayPurchaseDetail purchase={purchase} />
      </div>
    </div>
  );
}



