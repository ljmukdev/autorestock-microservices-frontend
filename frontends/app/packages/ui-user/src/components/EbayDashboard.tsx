/**
 * EbayDashboard.tsx
 * Main eBay dashboard with stats and overview
 */

import React from 'react';
import { Card } from '@autorestock/ui-kit';
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';

interface EbayDashboardProps {
  stats: {
    totalPurchases: number;
    totalSpent: number;
    itemsShipped: number;
    itemsInTransit: number;
  };
}

export default function EbayDashboard({ stats }: EbayDashboardProps) {
  const statCards = [
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: ShoppingCart,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Spent',
      value: `£${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Items Shipped',
      value: stats.itemsShipped,
      icon: Package,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'In Transit',
      value: stats.itemsInTransit,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`${stat.bgColor} border ${stat.borderColor}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.iconColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

