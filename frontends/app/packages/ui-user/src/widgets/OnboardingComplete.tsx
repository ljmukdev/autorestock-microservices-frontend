import React from 'react';
import { Button, Card, Alert, Stack } from '@autorestock/ui-kit';
import { User, EmailAlias } from '../types';

export interface OnboardingCompleteProps {
  user: User;
  alias: EmailAlias;
  aliases?: any[];
  platforms?: string[];
  onGoToDashboard?: () => void;
}

export const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({
  user,
  alias,
  aliases = [],
  platforms = [],
  onGoToDashboard
}) => {
  const handleCopyEmail = (email?: string) => {
    const fullAddress = email || `${alias.alias}@in.autorestock.app`;
    navigator.clipboard.writeText(fullAddress);
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      // Default: redirect to home or dashboard
      window.location.href = '/';
    }
  };

  return (
    <Card title="">
      <Stack spacing="xl">
        {/* Success Header */}
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
            You're All Set!
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Your AutoRestock account is fully configured and ready to use
          </p>
        </div>

        {/* Setup Summary */}
        <div style={{
          padding: '2rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          border: '2px solid #22c55e'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#166534' }}>
            ✅ Setup Complete
          </h3>

          <Stack spacing="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700'
              }}>
                ✓
              </div>
              <div>
                <strong>Account created</strong>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {user.email}
                  {user.isCompany && user.companyName && ` • ${user.companyName}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700'
              }}>
                ✓
              </div>
              <div>
                <strong>Email forwarding configured</strong>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Forwarding to: {user.forwardingEmail || user.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700'
              }}>
                ✓
              </div>
              <div>
                <strong>{aliases.length > 1 ? `${aliases.length} email aliases` : 'Email alias'} created</strong>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {aliases.length > 1 
                    ? aliases.map((a: any) => a.alias || a.localPart).join(', ') + '@in.autorestock.app'
                    : `${alias.alias}@in.autorestock.app`
                  }
                </div>
              </div>
            </div>

            {platforms.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#22c55e',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700'
                }}>
                  ✓
                </div>
                <div>
                  <strong>Platforms configured</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {platforms.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </Stack>
        </div>

        {/* Email Address Card */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #0ea5e9'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            📧 Your AutoRestock Email{aliases.length > 1 ? 's' : ''}
          </h3>
          
          <Stack spacing="md">
            {(aliases.length > 0 ? aliases : [alias]).map((a: any, idx: number) => {
              const emailAddress = a.alias || a.localPart;
              const fullEmail = `${emailAddress}@in.autorestock.app`;
              const forwardEmail = a.forwardTo || user.forwardingEmail || user.email;
              const platformName = a.platformName || a.service || '';
              
              return (
                <div key={idx} style={{ 
                  padding: '1rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px'
                }}>
                  {platformName && (
                    <div style={{ fontSize: '0.75rem', color: '#0c4a6e', marginBottom: '0.25rem', fontWeight: '600' }}>
                      {platformName.toUpperCase()}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    color: '#0ea5e9',
                    marginBottom: '0.25rem'
                  }}>
                    {fullEmail}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    → Forwards to: {forwardEmail}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyEmail(fullEmail)}
                  >
                    📋 Copy
                  </Button>
                </div>
              );
            })}
          </Stack>
        </div>

        {/* Next Steps */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          border: '1px solid #fbbf24'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#92400e' }}>
            🚀 What's Next?
          </h3>
          <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#78350f' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Start receiving order notifications automatically
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              View your dashboard to see processed emails
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Configure additional settings and integrations
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleGoToDashboard}
        >
          Go to Dashboard →
        </Button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Completed on: {new Date().toLocaleDateString()}
          </div>
        </div>
      </Stack>
    </Card>
  );
};

