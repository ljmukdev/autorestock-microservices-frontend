/**
 * MarketplaceEmailConnection.tsx
 * Optional IMAP credentials collection for marketplace email parsing
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@autorestock/ui-kit';
import { Button } from '@autorestock/ui-kit';
import { Mail, Eye, EyeOff, ChevronDown, ChevronUp, X, Plus, Lock, Shield } from 'lucide-react';
import { EmailIngestionConfig, DEFAULT_EMAIL_INGESTION_CONFIG, PROVIDER_CONFIGS } from '../types/EmailIngestionConfig';

interface MarketplaceEmailConnectionProps {
  value?: Partial<EmailIngestionConfig>;
  onChange?: (config: Partial<EmailIngestionConfig> | null) => void;
  errors?: Record<string, string>;
}

export default function MarketplaceEmailConnection({ value, onChange, errors = {} }: MarketplaceEmailConnectionProps) {
  const [isEnabled, setIsEnabled] = useState(value?.enabled || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<Partial<EmailIngestionConfig>>({
    ...DEFAULT_EMAIL_INGESTION_CONFIG,
    ...value
  });

  useEffect(() => {
    if (isEnabled) {
      onChange?.(config);
    } else {
      onChange?.(null);
    }
  }, [isEnabled, config]);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    setIsExpanded(newEnabled);
    
    if (!newEnabled) {
      // Clear consent when disabling
      setConfig(prev => ({ ...prev, gdprConsent: false, consentTs: '' }));
      onChange?.(null);
    }
  };

  const handleProviderChange = (provider: 'gmail' | 'privateemail' | 'other') => {
    const providerConfig = PROVIDER_CONFIGS[provider];
    
    setConfig(prev => ({
      ...prev,
      provider,
      // Only update if field is empty
      imapHost: prev.imapHost || providerConfig.imapHost,
      imapPort: prev.imapPort || providerConfig.imapPort,
      secure: prev.secure !== undefined ? prev.secure : providerConfig.secure
    }));
  };

  const handleFieldChange = (field: keyof EmailIngestionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleConsentChange = (checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      gdprConsent: checked,
      consentTs: checked ? new Date().toISOString() : ''
    }));
  };

  const addAllowedSender = (sender: string) => {
    if (sender.trim() && !config.allowedSenders?.includes(sender.trim())) {
      setConfig(prev => ({
        ...prev,
        allowedSenders: [...(prev.allowedSenders || []), sender.trim()]
      }));
    }
  };

  const removeAllowedSender = (sender: string) => {
    setConfig(prev => ({
      ...prev,
      allowedSenders: (prev.allowedSenders || []).filter(s => s !== sender)
    }));
  };

  const [newSenderInput, setNewSenderInput] = useState('');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Marketplace Email Connection</CardTitle>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Optional: Connect your email to automatically import orders from eBay and Vinted
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            
            {isEnabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isEnabled && isExpanded && (
        <CardContent className="space-y-6">
          {/* Information Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>We'll connect to your email via IMAP (read-only)</li>
                  <li>Only emails from eBay/Vinted will be processed</li>
                  <li>Other emails are ignored and never accessed</li>
                  <li>Order data is extracted and stored securely</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Email Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Provider *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'gmail', label: 'Gmail', icon: '📧' },
                { value: 'privateemail', label: 'Namecheap PrivateEmail', icon: '📬' },
                { value: 'other', label: 'Outlook/Other', icon: '📮' }
              ].map((provider) => (
                <button
                  key={provider.value}
                  type="button"
                  onClick={() => handleProviderChange(provider.value as any)}
                  className={`p-3 border-2 rounded-lg text-center transition-colors ${
                    config.provider === provider.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{provider.icon}</div>
                  <div className="text-xs font-medium">{provider.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* IMAP Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Host *
              </label>
              <input
                type="text"
                value={config.imapHost || ''}
                onChange={(e) => handleFieldChange('imapHost', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.imapHost ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="imap.gmail.com"
              />
              {errors.imapHost && (
                <p className="text-red-600 text-xs mt-1">{errors.imapHost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Port *
              </label>
              <input
                type="number"
                value={config.imapPort || 993}
                onChange={(e) => handleFieldChange('imapPort', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.imapPort ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="993"
              />
              {errors.imapPort && (
                <p className="text-red-600 text-xs mt-1">{errors.imapPort}</p>
              )}
            </div>
          </div>

          {/* Email Credentials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (Username) *
            </label>
            <input
              type="email"
              value={config.username || ''}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
            {errors.username && (
              <p className="text-red-600 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.appPassword || ''}
                onChange={(e) => handleFieldChange('appPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.appPassword && (
              <p className="text-red-600 text-xs mt-1">{errors.appPassword}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {config.provider === 'gmail' && 'Use an app-specific password, not your regular Gmail password. '}
              {config.provider === 'privateemail' && 'Use your email account password. '}
              {config.provider === 'other' && 'Use your email account password or app-specific password. '}
              <a href="#" className="text-blue-600 hover:underline">How to create app password?</a>
            </p>
          </div>

          {/* Mailbox and Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mailbox *
              </label>
              <input
                type="text"
                value={config.mailbox || 'INBOX'}
                onChange={(e) => handleFieldChange('mailbox', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mailbox ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="INBOX"
              />
              {errors.mailbox && (
                <p className="text-red-600 text-xs mt-1">{errors.mailbox}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 mt-7">
                <input
                  type="checkbox"
                  checked={config.secure !== false}
                  onChange={(e) => handleFieldChange('secure', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Use SSL/TLS (secure connection)
                </span>
              </label>
            </div>
          </div>

          {/* Allowed Senders */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Senders (Email Filters)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Only emails from these senders will be processed. Use * as wildcard (e.g., *@ebay.com)
            </p>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {(config.allowedSenders || []).map((sender, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{sender}</span>
                  <button
                    type="button"
                    onClick={() => removeAllowedSender(sender)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newSenderInput}
                onChange={(e) => setNewSenderInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAllowedSender(newSenderInput);
                    setNewSenderInput('');
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="*@ebay.com or seller@marketplace.com"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  addAllowedSender(newSenderInput);
                  setNewSenderInput('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* GDPR Consent */}
          <div className="border-t pt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Data Privacy & GDPR</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="gdprConsent"
                        checked={config.gdprConsent || false}
                        onChange={(e) => handleConsentChange(e.target.checked)}
                        className={`mt-1 rounded ${errors.gdprConsent ? 'border-red-300' : ''}`}
                      />
                      <label htmlFor="gdprConsent" className="text-sm text-yellow-800 flex-1">
                        <span className="font-medium">I consent to AutoRestock connecting via IMAP to retrieve only marketplace emails (eBay/Vinted).</span>
                        {' '}Other emails will not be accessed, processed, or stored.
                      </label>
                    </div>
                    
                    {errors.gdprConsent && (
                      <p className="text-red-600 text-sm ml-6">{errors.gdprConsent}</p>
                    )}

                    <div className="ml-6 text-xs text-yellow-700 space-y-1">
                      <p>📌 <strong>What we access:</strong> Only emails from addresses you specify above</p>
                      <p>🔒 <strong>How we store it:</strong> Encrypted and secured in our database</p>
                      <p>🗑️ <strong>Your rights:</strong> You can disconnect and delete your data anytime</p>
                      <p>⏱️ <strong>Retention:</strong> Data stored for accounting and business purposes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">🔐 Security & Privacy</p>
                <ul className="space-y-1 text-xs">
                  <li>• Your credentials are encrypted at rest</li>
                  <li>• IMAP connection uses SSL/TLS encryption</li>
                  <li>• We never log or display your password</li>
                  <li>• Read-only access - we never send or modify emails</li>
                  <li>• You can disconnect at any time from settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Provider-Specific Help */}
          {config.provider === 'gmail' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">📧 Gmail Setup Instructions:</p>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Enable IMAP in Gmail Settings → Forwarding and POP/IMAP</li>
                <li>Create an App Password: Google Account → Security → 2-Step Verification → App passwords</li>
                <li>Use the 16-character app password (not your regular password)</li>
              </ol>
            </div>
          )}

          {config.provider === 'privateemail' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">📬 Namecheap PrivateEmail Setup:</p>
              <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                <li>IMAP is enabled by default for PrivateEmail accounts</li>
                <li>Use your full email address as username</li>
                <li>Use your email account password</li>
                <li>No app-specific password needed</li>
              </ol>
            </div>
          )}

          {config.provider === 'other' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-900 mb-2">📮 Outlook/Other Setup:</p>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>Ensure IMAP is enabled in your email provider settings</li>
                <li>For Outlook.com: Use your Microsoft account email and password</li>
                <li>For Office 365: You may need an app password</li>
                <li>Check your provider's documentation for IMAP settings</li>
              </ol>
            </div>
          )}
        </CardContent>
      )}

      {/* Collapsed State Summary */}
      {isEnabled && !isExpanded && (
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{config.provider === 'gmail' ? 'Gmail' : config.provider === 'privateemail' ? 'Namecheap' : 'Other'}</span>
              {' • '}
              <span>{config.username || 'Not configured'}</span>
              {' • '}
              <span>{config.allowedSenders?.length || 0} allowed senders</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              Edit
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
