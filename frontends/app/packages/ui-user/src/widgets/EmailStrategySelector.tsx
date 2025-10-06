import React, { useState } from 'react';
import { Button, Card, Stack } from '@autorestock/ui-kit';

export interface EmailStrategyProps {
  onSelectStrategy: (strategy: 'single' | 'multiple') => void;
}

export const EmailStrategySelector: React.FC<EmailStrategyProps> = ({
  onSelectStrategy
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'single' | 'multiple' | null>(null);

  const handleContinue = () => {
    if (selectedStrategy) {
      onSelectStrategy(selectedStrategy);
    }
  };

  return (
    <Card title="How Would You Like to Receive Emails?">
      <Stack spacing="lg">
        <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1rem' }}>
          Choose how you want to organize your email notifications from different platforms:
        </div>

        {/* Option 1: Single Email */}
        <div
          onClick={() => setSelectedStrategy('single')}
          style={{
            padding: '1.5rem',
            border: selectedStrategy === 'single' ? '3px solid #0ea5e9' : '2px solid #e5e7eb',
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: selectedStrategy === 'single' ? '#f0f9ff' : 'white',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <input
              type="radio"
              checked={selectedStrategy === 'single'}
              onChange={() => setSelectedStrategy('single')}
              style={{ marginTop: '0.25rem', width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📧 One Email for Everything
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Simple and straightforward - use one email address to receive notifications from all your platforms.
              </p>
              <div style={{
                padding: '1rem',
                backgroundColor: selectedStrategy === 'single' ? 'white' : '#f9fafb',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Example:
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#0ea5e9', fontWeight: '600' }}>
                  yourname@in.autorestock.app
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  ↓ Receives emails from: eBay, Vinted, and all platforms
                </div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#16a34a' }}>
                ✓ Best for: Simple setup, less to manage
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Multiple Emails */}
        <div
          onClick={() => setSelectedStrategy('multiple')}
          style={{
            padding: '1.5rem',
            border: selectedStrategy === 'multiple' ? '3px solid #0ea5e9' : '2px solid #e5e7eb',
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: selectedStrategy === 'multiple' ? '#f0f9ff' : 'white',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <input
              type="radio"
              checked={selectedStrategy === 'multiple'}
              onChange={() => setSelectedStrategy('multiple')}
              style={{ marginTop: '0.25rem', width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📨 Separate Email for Each Platform
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Better organization - use different email addresses for different platforms, each forwarding to your preferred inbox.
              </p>
              <div style={{
                padding: '1rem',
                backgroundColor: selectedStrategy === 'multiple' ? 'white' : '#f9fafb',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Example:
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#0ea5e9', fontWeight: '600' }}>
                    ebay-yourname@in.autorestock.app
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '1rem' }}>
                    → Forwards to: ebay@yourcompany.com
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#0ea5e9', fontWeight: '600' }}>
                    vinted-yourname@in.autorestock.app
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '1rem' }}>
                    → Forwards to: vinted@yourcompany.com
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#16a34a' }}>
                ✓ Best for: Multiple inboxes, better organization, separate platform management
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinue}
          disabled={!selectedStrategy}
        >
          {selectedStrategy ? 'Continue →' : 'Select an option to continue'}
        </Button>
      </Stack>
    </Card>
  );
};


