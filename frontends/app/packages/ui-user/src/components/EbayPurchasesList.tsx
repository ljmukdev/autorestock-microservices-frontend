/**
 * EbayPurchasesList.tsx
 * Table view of eBay purchases
 */

import React from 'react';
import { Card } from '@autorestock/ui-kit';
import { ExternalLink, Package, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface EbayPurchase {
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

interface EbayPurchasesListProps {
  purchases: EbayPurchase[];
  isLoading?: boolean;
}

export default function EbayPurchasesList({ purchases, isLoading }: EbayPurchasesListProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchases...</p>
        </div>
      </Card>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card className="w-full">
        <div className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases found</h3>
          <p className="text-gray-600">Try adjusting your filters or sync your eBay data</p>
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      'Despatched': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800' },
      'In Transit': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Processing': { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.itemId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {purchase.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {purchase.quantity}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`https://www.ebay.co.uk/usr/${purchase.sellerUserID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {purchase.sellerUserID}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(purchase.transactionDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(purchase.transactionDate).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    £{purchase.price.toFixed(2)}
                  </div>
                  {purchase.shippingCost > 0 && (
                    <div className="text-xs text-gray-500">
                      +£{purchase.shippingCost.toFixed(2)} shipping
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(purchase.itemStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {purchase.trackingNumber ? (
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600 font-mono">
                        {purchase.trackingNumber.substring(0, 12)}...
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No tracking</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/ebay/purchase/${purchase.itemId}`}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span className="text-sm">View</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {purchases.map((purchase) => (
          <Link
            key={purchase.itemId}
            href={`/ebay/purchase/${purchase.itemId}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 text-sm flex-1 pr-2">
                {purchase.title}
              </h4>
              {getStatusBadge(purchase.itemStatus)}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Seller:</span>
                <span className="font-medium">{purchase.sellerUserID}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(purchase.transactionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  £{(purchase.price + purchase.shippingCost).toFixed(2)}
                </span>
              </div>
              {purchase.trackingNumber && (
                <div className="flex items-center gap-1 text-green-600 pt-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-mono">{purchase.trackingNumber}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}


