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
    // Check if user is returning from eBay OAuth (new self-contained approach)
    const urlParams = new URLSearchParams(window.location.search);
    const ebayConnected = urlParams.get('ebay_connected');
    const userId = urlParams.get('user_id');
    const ebayError = urlParams.get('ebay_error');
    
    console.log('=== EBAY OAUTH RETURN CHECK ===');
    console.log('ebay_connected:', ebayConnected);
    console.log('user_id:', userId);
    console.log('ebay_error:', ebayError);
    
    if (ebayConnected === 'true') {
      // OAuth was successful, check connection status
      console.log('eBay OAuth successful, checking status...');
      checkConnectionStatus();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (ebayError) {
      // OAuth failed
      console.log('eBay OAuth failed:', ebayError);
      setError(`eBay authorization failed: ${ebayError}`);
      onError?.(ebayError);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    console.log('=== END OAUTH RETURN CHECK ===');
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Use environment variable or default to the working eBay service URL
      const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';
      
      console.log('Checking eBay connection status at:', `${ebayServiceUrl}/oauth/status`);
      
      const response = await fetch(`${ebayServiceUrl}/oauth/status`, {
        credentials: 'include', // Important: Include cookies for session
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('Status check failed:', response.status);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('eBay connection status:', data);
      
      if (data.connected || data.hasTokens) {
        setIsConnected(true);
        // Create account object from status data
        const account = {
          id: data.userId || 'ebay-user',
          username: data.username || 'eBay User',
          email: data.email || 'user@ebay.com',
          accountType: 'business' as const,
          verified: true,
          connectedAt: data.connectedAt || new Date().toISOString()
        };
        setEbayAccount(account);
        onConnect?.(account);
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
      // Use environment variable or default to the working eBay service URL
      const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';
      
      console.log('=== INITIATING EBAY OAUTH ===');
      console.log('eBay service URL:', ebayServiceUrl);
      
      // Simply redirect to the eBay service's OAuth login endpoint
      // The service will handle session management, eBay OAuth, and redirect back to the frontend
      const oauthUrl = `${ebayServiceUrl}/oauth/login`;
      console.log('Redirecting to:', oauthUrl);
      console.log('=== END DEBUG ===');
      
      // Redirect to eBay service OAuth login
      // The service will automatically redirect back to this page after OAuth completes
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('eBay OAuth error:', error);
      setError('Failed to connect to eBay. Please try again.');
      onError?.('Failed to connect to eBay. Please try again.');
      setIsConnecting(false);
    }
  };

  // OAuth callback is handled by eBay service

  const handleDisconnect = async () => {
    try {
      const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL || 'https://delightful-liberation-production.up.railway.app';
      
      const response = await fetch(`${ebayServiceUrl}/oauth/disconnect`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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
      // Simply re-check the connection status to refresh the display
      await checkConnectionStatus();
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

