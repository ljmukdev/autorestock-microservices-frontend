/**
 * EbayPurchaseDetail.tsx
 * Detailed view of a single eBay purchase
 */

import React from 'react';
import { Card, Button } from '@autorestock/ui-kit';
import { ExternalLink, Package, Truck, Calendar, DollarSign, User, Hash, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { EbayPurchase } from './EbayPurchasesList';

interface EbayPurchaseDetailProps {
  purchase: EbayPurchase;
}

interface DetailField {
  label: string;
  value: string;
  copyable?: boolean;
  link?: string;
  highlight?: boolean;
}

interface DetailSection {
  title: string;
  icon: any; // lucide-react icon type
  fields: DetailField[];
}

export default function EbayPurchaseDetail({ purchase }: EbayPurchaseDetailProps) {
  const totalCost = purchase.price + purchase.shippingCost;

  const detailSections: DetailSection[] = [
    {
      title: 'Item Information',
      icon: Package,
      fields: [
        { label: 'Item ID', value: purchase.itemId, copyable: true },
        { label: 'Title', value: purchase.title },
        { label: 'Quantity', value: purchase.quantity.toString() },
        { label: 'Status', value: purchase.itemStatus }
      ]
    },
    {
      title: 'Pricing',
      icon: DollarSign,
      fields: [
        { label: 'Item Price', value: `£${purchase.price.toFixed(2)}` },
        { label: 'Shipping Cost', value: `£${purchase.shippingCost.toFixed(2)}` },
        { label: 'Total Cost', value: `£${totalCost.toFixed(2)}`, highlight: true }
      ]
    },
    {
      title: 'Seller Information',
      icon: User,
      fields: [
        { 
          label: 'Seller Username', 
          value: purchase.sellerUserID,
          link: `https://www.ebay.co.uk/usr/${purchase.sellerUserID}`
        }
      ]
    },
    {
      title: 'Dates',
      icon: Calendar,
      fields: [
        { 
          label: 'Purchase Date', 
          value: new Date(purchase.transactionDate).toLocaleString() 
        },
        { 
          label: 'Shipped Date', 
          value: purchase.shippedTime 
            ? new Date(purchase.shippedTime).toLocaleString() 
            : 'Not shipped yet' 
        }
      ]
    },
    {
      title: 'Shipping & Tracking',
      icon: Truck,
      fields: [
        { label: 'Tracking Number', value: purchase.trackingNumber || 'Not available', copyable: !!purchase.trackingNumber },
        { label: 'Shipping Carrier', value: purchase.shippingCarrier || 'Not specified' }
      ]
    },
    {
      title: 'Transaction Details',
      icon: Hash,
      fields: [
        { label: 'Transaction ID', value: purchase.transactionId, copyable: true },
        { label: 'Order ID', value: purchase.orderId || 'N/A', copyable: !!purchase.orderId }
      ]
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/ebay">
        <Button variant="outline" className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Purchases
        </Button>
      </Link>

      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {purchase.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Item ID: {purchase.itemId}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(purchase.transactionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Paid</div>
              <div className="text-3xl font-bold text-blue-600">
                £{totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {detailSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-3">
                  {section.fields.map((field) => (
                    <div key={field.label} className="flex justify-between items-start">
                      <span className="text-sm text-gray-600 font-medium">
                        {field.label}:
                      </span>
                      <div className="text-right flex items-center gap-2">
                        {field.link ? (
                          <a
                            href={field.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {field.value}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className={`text-sm ${field.highlight ? 'font-bold text-lg' : 'text-gray-900'}`}>
                            {field.value}
                          </span>
                        )}
                        {field.copyable && (
                          <button
                            onClick={() => copyToClipboard(field.value)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://www.ebay.co.uk/itm/${purchase.itemId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View on eBay
              </Button>
            </a>
            {purchase.trackingNumber && (
              <Button variant="outline" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Track Package
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

