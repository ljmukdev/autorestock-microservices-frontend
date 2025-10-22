export interface EbayPurchase {
  orderId: string | null;
  transactionId: string;
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
  fetchedAt: string;
}

export interface PurchaseStats {
  total: number;
  totalSpent: number;
  shipped: number;
  inTransit: number;
}

export interface FilterState {
  search: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
  status: string[];
}

export interface SyncStatus {
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  purchases?: T[];
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  fetched: number;
  savedToMongoDB: number;
  sent: number;
  failed: number;
  errors: string[];
}

