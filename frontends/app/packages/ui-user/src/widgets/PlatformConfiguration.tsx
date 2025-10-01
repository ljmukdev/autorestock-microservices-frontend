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
  onComplete: (configuredPlatforms: string[]) => void;
  onSkip?: () => void;
}

const PLATFORMS: Platform[] = [
  {
    id: 'ebay',
    name: 'eBay',
    icon: '🛒',
    steps: [
      'Log into eBay.com',
      'Click "My eBay" → "Account Settings"',
      'Navigate to "Communication Preferences"',
      'Under "Email notifications", click "Edit"',
      'Add email and verify'
    ],
    helpUrl: 'https://www.ebay.com/help/account/account-settings/changing-account-settings'
  },
  {
    id: 'vinted',
    name: 'Vinted',
    icon: '👕',
    steps: [
      'Open Vinted app or website',
      'Go to Settings',
      'Select "Notifications"',
      'Add email and verify'
    ],
    helpUrl: 'https://www.vinted.com/help'
  },
  {
    id: 'depop',
    name: 'Depop',
    icon: '👗',
    steps: [
      'Open Depop app',
      'Go to Profile → Settings',
      'Select "Notifications"',
      'Add email and verify'
    ],
    helpUrl: 'https://depophelp.zendesk.com'
  },
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    icon: '📱',
    steps: [
      'Go to Facebook Marketplace',
      'Click Settings',
      'Navigate to Notifications',
      'Add email and verify'
    ],
    helpUrl: 'https://www.facebook.com/help/marketplace'
  }
];

export const PlatformConfiguration: React.FC<PlatformConfigurationProps> = ({
  alias,
  fullAddress,
  forwardingEmail,
  onComplete,
  onSkip
}) => {
  const [configuredPlatforms, setConfiguredPlatforms] = useState<Set<string>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(fullAddress);
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
    onComplete(Array.from(configuredPlatforms));
  };

  const handleSkipForNow = () => {
    onSkip?.();
  };

  return (
    <Card title="Add Your Email to Selling Platforms">
      <Stack spacing="lg">
        <Alert variant="success">
          <strong>🎉 Your email address is ready!</strong>
          <div style={{ marginTop: '0.5rem', fontSize: '1.125rem', fontFamily: 'monospace' }}>
            <strong>{fullAddress}</strong>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Forwards to: {forwardingEmail}
          </div>
        </Alert>

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
              variant={copiedEmail ? 'success' : 'outline'}
              onClick={handleCopyEmail}
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
            Select the platforms you use:
          </h3>

          <Stack spacing="md">
            {PLATFORMS.map((platform) => (
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
            ))}
          </Stack>
        </div>

        <Alert variant="warning">
          <strong>Note:</strong> Most platforms will send you a verification email. 
          Check your inbox at <strong>{forwardingEmail}</strong> and click the verification links.
        </Alert>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
            disabled={configuredPlatforms.size === 0}
          >
            Continue to Email Test ({configuredPlatforms.size} platform{configuredPlatforms.size !== 1 ? 's' : ''} selected)
          </Button>
        </div>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={handleSkipForNow}
        >
          Skip for now (I'll add platforms later)
        </Button>
      </Stack>
    </Card>
  );
};

