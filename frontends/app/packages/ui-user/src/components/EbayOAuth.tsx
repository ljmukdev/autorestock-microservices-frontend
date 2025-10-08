/**
 * EbayOAuth.tsx
 * Component for eBay OAuth integration
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@autorestock/ui-kit';
import { Button } from '@autorestock/ui-kit';
import { ShoppingCart, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface EbayAccount {
  id: string;
  username: string;
  email: string;
  storeName?: string;
  accountType: 'individual' | 'business';
  verified: boolean;
  connectedAt: string;
}

interface EbayOAuthProps {
  onConnect?: (account: EbayAccount) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export default function EbayOAuth({ onConnect, onDisconnect, onError }: EbayOAuthProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ebayAccount, setEbayAccount] = useState<EbayAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    // Check if user is returning from eBay OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError('eBay authorization was cancelled or failed');
      onError?.('eBay authorization was cancelled or failed');
      return;
    }
    
    if (code && state) {
      handleEbayCallback(code, state);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/ebay/status');
      const data = await response.json();
      
      if (data.connected && data.account) {
        setIsConnected(true);
        setEbayAccount(data.account);
        onConnect?.(data.account);
      }
    } catch (error) {
      console.error('Failed to check eBay connection status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEbayConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ebay/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          redirectUri: window.location.origin + '/onboarding',
          scopes: ['https://api.ebay.com/oauth/api_scope/sell.account']
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate eBay OAuth');
      }
      
      const { authUrl, state } = await response.json();
      
      // Store state for verification
      sessionStorage.setItem('ebay_oauth_state', state);
      
      // Redirect to eBay OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('eBay OAuth error:', error);
      setError('Failed to connect to eBay. Please try again.');
      onError?.('Failed to connect to eBay. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleEbayCallback = async (code: string, state: string) => {
    try {
      const storedState = sessionStorage.getItem('ebay_oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      const response = await fetch('/api/ebay/oauth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      });
      
      const result = await response.json();
      
      if (result.success && result.account) {
        setIsConnected(true);
        setEbayAccount(result.account);
        onConnect?.(result.account);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('ebay_oauth_state');
      } else {
        throw new Error(result.error || 'Failed to connect eBay account');
      }
    } catch (error) {
      console.error('eBay OAuth callback error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect eBay account');
      onError?.(error instanceof Error ? error.message : 'Failed to connect eBay account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/ebay/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setIsConnected(false);
        setEbayAccount(null);
        onDisconnect?.();
      } else {
        throw new Error('Failed to disconnect eBay account');
      }
    } catch (error) {
      console.error('eBay disconnect error:', error);
      setError('Failed to disconnect eBay account');
    }
  };

  const refreshAccountInfo = async () => {
    try {
      const response = await fetch('/api/ebay/refresh');
      const data = await response.json();
      
      if (data.success && data.account) {
        setEbayAccount(data.account);
      }
    } catch (error) {
      console.error('Failed to refresh eBay account info:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <div className="p-6 flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Checking eBay connection status...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>eBay Account Connection</span>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {isConnected && ebayAccount ? (
          <div className="space-y-4">
            {/* Connected Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">eBay Account Connected</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-800">Username:</p>
                  <p className="text-green-700">{ebayAccount.username}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Email:</p>
                  <p className="text-green-700">{ebayAccount.email}</p>
                </div>
                {ebayAccount.storeName && (
                  <div>
                    <p className="font-medium text-green-800">Store Name:</p>
                    <p className="text-green-700">{ebayAccount.storeName}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-green-800">Account Type:</p>
                  <p className="text-green-700 capitalize">{ebayAccount.accountType}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Verified:</p>
                  <p className="text-green-700">{ebayAccount.verified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Connected:</p>
                  <p className="text-green-700">
                    {new Date(ebayAccount.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={refreshAccountInfo}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Info
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic listing synchronization</li>
                <li>• Real-time sales notifications</li>
                <li>• Inventory tracking and alerts</li>
                <li>• Performance analytics and insights</li>
                <li>• Automated order processing</li>
                <li>• Fee calculation and profit tracking</li>
              </ul>
            </div>

            {/* Required Permissions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Required Permissions:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Read your seller account information</li>
                <li>• Read your active listings</li>
                <li>• Read your order information</li>
                <li>• Read your transaction history</li>
              </ul>
              <p className="text-xs text-yellow-700 mt-2">
                We only read data - we never modify your eBay listings or account settings.
              </p>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleEbayConnect}
              disabled={isConnecting}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect eBay Account
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You'll be redirected to eBay to authorize the connection
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="border-t pt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Need help connecting your eBay account?
            </summary>
            <div className="mt-2 text-gray-600 space-y-2">
              <p>
                <strong>Troubleshooting:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Make sure you're logged into the correct eBay account</li>
                <li>Ensure your eBay account has selling privileges</li>
                <li>Check that pop-ups aren't blocked in your browser</li>
                <li>Try refreshing the page if the connection seems stuck</li>
              </ul>
              <p>
                <strong>Privacy:</strong> We use industry-standard OAuth 2.0 to securely connect to your eBay account. 
                Your login credentials are never stored or transmitted to our servers.
              </p>
            </div>
          </details>
        </div>
      </div>
    </Card>
  );
}

