/**
 * EmailSetup.tsx
 * Component for setting up email aliases and integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@autorestock/ui-kit';
import { Button } from '@autorestock/ui-kit';
import { Mail, Plus, Trash2, Copy, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface EmailAlias {
  id: string;
  alias: string;
  platform: string;
  forwardTo: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface EmailSetupProps {
  onAliasesChange?: (aliases: EmailAlias[]) => void;
}

export default function EmailSetup({ onAliasesChange }: EmailSetupProps) {
  const [aliases, setAliases] = useState<EmailAlias[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAliases();
  }, []);

  useEffect(() => {
    onAliasesChange?.(aliases);
  }, [aliases, onAliasesChange]);

  const loadAliases = async () => {
    try {
      const response = await fetch('/api/email/aliases');
      const data = await response.json();
      
      if (data.success) {
        setAliases(data.aliases);
      }
    } catch (error) {
      console.error('Failed to load aliases:', error);
      setError('Failed to load email aliases');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAlias = async (platform: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/generate-alias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newAlias: EmailAlias = {
          id: data.alias.id,
          alias: data.alias.alias,
          platform: platform,
          forwardTo: data.alias.forwardTo,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        setAliases(prev => [...prev, newAlias]);
      } else {
        throw new Error(data.error || 'Failed to generate alias');
      }
    } catch (error) {
      console.error('Failed to generate alias:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate alias');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteAlias = async (aliasId: string) => {
    try {
      const response = await fetch(`/api/email/aliases/${aliasId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAliases(prev => prev.filter(alias => alias.id !== aliasId));
      } else {
        throw new Error('Failed to delete alias');
      }
    } catch (error) {
      console.error('Failed to delete alias:', error);
      setError('Failed to delete alias');
    }
  };

  const toggleAlias = async (aliasId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/email/aliases/${aliasId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (response.ok) {
        setAliases(prev => prev.map(alias => 
          alias.id === aliasId ? { ...alias, isActive } : alias
        ));
      } else {
        throw new Error('Failed to update alias');
      }
    } catch (error) {
      console.error('Failed to update alias:', error);
      setError('Failed to update alias');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAlias(text);
      setTimeout(() => setCopiedAlias(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ebay':
        return '🛒';
      case 'vinted':
        return '👗';
      case 'depop':
        return '🛍️';
      case 'amazon':
        return '📦';
      default:
        return '📧';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ebay':
        return 'bg-orange-100 text-orange-800';
      case 'vinted':
        return 'bg-green-100 text-green-800';
      case 'depop':
        return 'bg-pink-100 text-pink-800';
      case 'amazon':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading email aliases...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Email Integration Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>We create unique email addresses for each platform</li>
            <li>You update your eBay/Vinted settings to use these addresses</li>
            <li>Order emails are automatically forwarded to your main email</li>
            <li>AutoRestock extracts order data and updates your inventory</li>
          </ol>
        </div>

        {/* Generate new aliases */}
        <div className="space-y-4">
          <h4 className="font-semibold">Generate Email Aliases:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['eBay', 'Vinted', 'Depop', 'Amazon'].map((platform) => (
              <Button
                key={platform}
                onClick={() => generateAlias(platform.toLowerCase())}
                disabled={isGenerating}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
                <span className="text-sm">{platform}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Existing aliases */}
        {aliases.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Your Email Aliases:</h4>
            <div className="space-y-3">
              {aliases.map((alias) => (
                <div
                  key={alias.id}
                  className={`border rounded-lg p-4 ${
                    alias.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(alias.platform)}`}>
                        {getPlatformIcon(alias.platform)} {alias.platform}
                      </div>
                      <div>
                        <p className="font-medium">{alias.alias}</p>
                        <p className="text-sm text-gray-600">
                          Forwards to: {alias.forwardTo}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => copyToClipboard(alias.alias)}
                        variant="ghost"
                        size="sm"
                      >
                        {copiedAlias === alias.alias ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => toggleAlias(alias.id, !alias.isActive)}
                        variant="ghost"
                        size="sm"
                        className={alias.isActive ? 'text-green-600' : 'text-gray-400'}
                      >
                        {alias.isActive ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => deleteAlias(alias.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(alias.createdAt).toLocaleDateString()}
                    {alias.lastUsed && (
                      <span className="ml-4">
                        Last used: {new Date(alias.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Next Steps:</h4>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>Copy the email aliases you want to use</li>
            <li>Go to your eBay/Vinted seller settings</li>
            <li>Update your contact email to use the new alias</li>
            <li>Test by making a small purchase or sale</li>
            <li>Check that order emails are being processed</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            Troubleshooting
          </summary>
          <div className="mt-2 text-gray-600 space-y-2">
            <p><strong>Emails not being processed?</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check that the alias is active (green checkmark)</li>
              <li>Verify you've updated your platform settings</li>
              <li>Make sure emails aren't going to spam</li>
              <li>Wait a few minutes for processing</li>
            </ul>
            
            <p><strong>Want to change forwarding email?</strong></p>
            <p className="ml-4">Contact support to update your forwarding address.</p>
            
            <p><strong>Need more aliases?</strong></p>
            <p className="ml-4">You can generate up to 10 aliases per platform.</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

