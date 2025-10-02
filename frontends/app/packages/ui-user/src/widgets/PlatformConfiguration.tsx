import React, { useState } from 'react';
import { Button, Card, Alert, Stack } from '@autorestock/ui-kit';

interface Platform {
  id: string;
  name: string;
  icon: string;
  steps: string[];
  helpUrl: string;
}

export interface PlatformConfigurationProps {
  alias: string;
  fullAddress: string;
  forwardingEmail: string;
  aliases?: any[];
  onComplete: (configuredPlatforms: string[]) => void;
  onSkip?: () => void;
}

const PLATFORMS: Platform[] = [
  {
    id: 'ebay',
    name: 'eBay',
    icon: '🛒',
    steps: [
      'Log into eBay.com and go to Account Settings',
      'Click on your profile',
      'Find "Contact info" section',
      'Click "Edit" next to Email address',
      'Add your AutoRestock email',
      'eBay will send a verification email to your AutoRestock address',
      'Check your forwarding inbox and click the verification link'
    ],
    helpUrl: 'https://accountsettings.ebay.com/profile'
  },
  {
    id: 'vinted',
    name: 'Vinted',
    icon: '👕',
    steps: [
      'Log into Vinted.com',
      'Go to Settings → Account',
      'Update your email address',
      'Verify the email when prompted'
    ],
    helpUrl: 'https://www.vinted.com/settings/account'
  }
];

export const PlatformConfiguration: React.FC<PlatformConfigurationProps> = ({
  alias,
  fullAddress,
  forwardingEmail,
  aliases = [],
  onComplete,
  onSkip
}) => {
  const [configuredPlatforms, setConfiguredPlatforms] = useState<Set<string>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [gdprAgreed, setGdprAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  // Helper to get email for specific platform
  const getEmailForPlatform = (platformId: string) => {
    if (aliases.length > 1) {
      const platformAlias = aliases.find((a: any) => a.platform === platformId || a.service === platformId);
      return platformAlias ? `${platformAlias.alias}@in.autorestock.app` : fullAddress;
    }
    return fullAddress;
  };

  const handleCopyEmail = (email?: string) => {
    navigator.clipboard.writeText(email || fullAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const togglePlatform = (platformId: string) => {
    const newSet = new Set(configuredPlatforms);
    if (newSet.has(platformId)) {
      newSet.delete(platformId);
    } else {
      newSet.add(platformId);
    }
    setConfiguredPlatforms(newSet);
  };

  const handleContinue = () => {
    console.log('Button clicked!', { gdprAgreed, signature, configuredPlatforms: Array.from(configuredPlatforms) });
    if (gdprAgreed && signature.trim()) {
      console.log('Calling onComplete...');
      onComplete(Array.from(configuredPlatforms));
    } else {
      console.log('Validation failed:', { gdprAgreed, signatureLength: signature.trim().length });
    }
  };

  const isFormValid = configuredPlatforms.size > 0 && gdprAgreed && signature.trim().length > 0;

  const handleSkipForNow = () => {
    onSkip?.();
  };

  return (
    <Card title="Add Your Email to Selling Platforms">
      <Stack spacing="lg">
        {/* Narrative Header */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '2px solid #0ea5e9'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0c4a6e' }}>
            📧 Why Update Your Email on Selling Platforms?
          </h3>
          <div style={{ fontSize: '0.95rem', color: '#0c4a6e', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              By adding your AutoRestock email address to your selling platforms (eBay, Vinted, etc.), 
              we can automatically receive and process your order notifications, sales confirmations, 
              and inventory updates.
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              This allows AutoRestock to:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li>Automatically import your purchases and sales</li>
              <li>Track fees and expenses for accurate accounting</li>
              <li>Monitor inventory levels in real-time</li>
              <li>Generate reports and insights for your business</li>
            </ul>
            <p>
              <strong>Your email address:</strong>{' '}
              <span style={{ fontFamily: 'monospace', backgroundColor: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {fullAddress}
              </span>
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Forwards to: <strong>{forwardingEmail}</strong>
            </p>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={fullAddress}
              readOnly
              style={{
                flex: 1,
                padding: '0.625rem',
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                fontFamily: 'monospace'
              }}
            />
            <Button
              variant={copiedEmail ? 'primary' : 'outline'}
              onClick={() => handleCopyEmail()}
            >
              {copiedEmail ? '✓ Copied' : 'Copy Email'}
            </Button>
          </div>

          <Alert variant="info">
            <strong>Next:</strong> Add this email address to your selling platforms to start receiving order notifications automatically.
          </Alert>
        </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Add these email addresses to your platforms:
              </h3>

              <Stack spacing="md">
            {PLATFORMS.map((platform) => {
              const platformEmail = getEmailForPlatform(platform.id);
              return (
              <div
                key={platform.id}
                style={{
                  border: configuredPlatforms.has(platform.id) ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  backgroundColor: configuredPlatforms.has(platform.id) ? '#f0f9ff' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{platform.icon}</div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {platform.name}
                    </h4>

                    {/* Platform-Specific Email */}
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      border: '1px solid #0ea5e9'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#0c4a6e', marginBottom: '0.25rem' }}>
                        Your {platform.name} email:
                      </div>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#0ea5e9',
                        marginBottom: '0.5rem'
                      }}>
                        {platformEmail}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyEmail(platformEmail)}
                      >
                        {copiedEmail ? '✓ Copied' : 'Copy Email'}
                      </Button>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                      <strong>Quick Steps:</strong>
                      <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                        {platform.steps.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={configuredPlatforms.has(platform.id)}
                          onChange={() => togglePlatform(platform.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500' }}>I've added this email to {platform.name}</span>
                      </label>

                      <a
                        href={platform.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          marginLeft: 'auto',
                          color: '#0ea5e9',
                          textDecoration: 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        Help Guide →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </Stack>
        </div>

        <Alert variant="warning">
          <strong>Important:</strong> Most platforms will send you a verification email. 
          Check your inbox at <strong>{forwardingEmail}</strong> and click the verification links to complete the setup.
        </Alert>

        {/* GDPR Disclaimer */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fefce8',
          borderRadius: '12px',
          border: '2px solid #facc15'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#854d0e' }}>
            🔒 Data Privacy & GDPR Compliance
          </h3>
          
          <div style={{ fontSize: '0.875rem', color: '#713f12', lineHeight: '1.6', marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>How we use your data:</strong>
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              AutoRestock will process emails received at your designated email address ({fullAddress}) 
              for the sole purposes of:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li>Importing purchase and sales data from your selling platforms</li>
              <li>Tracking fees, expenses, and financial transactions</li>
              <li>Managing inventory levels and stock information</li>
              <li>Generating business reports and analytics</li>
              <li>Providing insights and functionality essential to the AutoRestock platform</li>
            </ul>
            
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>Your data protection rights:</strong>
            </p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li>Your data will be stored securely and encrypted</li>
              <li>We will NEVER share your data with third parties for marketing purposes</li>
              <li>You have the right to access, modify, or delete your data at any time</li>
              <li>You can export your data or close your account at any time</li>
              <li>We comply with UK GDPR and data protection regulations</li>
            </ul>

            <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
              By continuing, you consent to AutoRestock processing emails sent to your designated email address 
              for the purposes described above, in accordance with our Privacy Policy and GDPR requirements.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={gdprAgreed}
                onChange={(e) => setGdprAgreed(e.target.checked)}
                style={{ 
                  width: '20px', 
                  height: '20px',
                  cursor: 'pointer',
                  marginTop: '0.125rem'
                }}
              />
              <span style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                <strong>I agree</strong> to AutoRestock processing my email data for the purposes stated above. 
                I understand my data will not be shared with third parties and that I can withdraw consent at any time.
              </span>
            </label>
          </div>

          {/* Signature Box */}
          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#713f12'
            }}>
              Type your full name to sign: *
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Your full name"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #facc15',
                borderRadius: '8px',
                fontFamily: 'cursive',
                backgroundColor: 'white'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>
              This serves as your electronic signature confirming your agreement
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
            disabled={!isFormValid}
          >
            {configuredPlatforms.size > 0 
              ? `Continue to Email Test (${configuredPlatforms.size} platform${configuredPlatforms.size !== 1 ? 's' : ''})` 
              : 'Select at least one platform to continue'}
          </Button>
        </div>

        {isFormValid && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleSkipForNow}
          >
            Skip email test (I'll test later)
          </Button>
        )}
      </Stack>
    </Card>
  );
};

