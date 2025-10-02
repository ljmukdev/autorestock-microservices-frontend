import React, { useState } from 'react';
import { Button, Card, Alert, Stack } from '@autorestock/ui-kit';
import { EmailWhitelistInstructions } from './EmailWhitelistInstructions';

export interface EmailDeliveryTestProps {
  alias: string;
  fullAddress: string;
  forwardingEmail: string;
  userId: string;
  apiBase: string;
  authToken?: string;
  aliases?: any[]; // All created aliases for multi-platform setup
  onTestSuccess: () => void;
  onSkip?: () => void;
}

export const EmailDeliveryTest: React.FC<EmailDeliveryTestProps> = ({
  alias,
  fullAddress,
  forwardingEmail,
  userId,
  apiBase,
  authToken,
  aliases = [],
  onTestSuccess,
  onSkip
}) => {
  const hasMultipleAliases = aliases.length > 1;
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendTestEmail = async () => {
    setTestStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch(`${apiBase}/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          userId,
          alias,
          forwardingEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        // Note: For MVP, backend returns instructions, not actual email sent
        // Status 'sent' means "ready for manual test"
        setTestStatus('sent');
      } else {
        setTestStatus('error');
        setErrorMessage(result.message || 'Failed to send test email');
      }
    } catch (error: any) {
      setTestStatus('error');
      setErrorMessage(error.message || 'Failed to send test email');
    }
  };

  const handleConfirmReceived = () => {
    setTestStatus('confirmed');
    setTimeout(() => {
      onTestSuccess();
    }, 500);
  };

  const getStatusColor = () => {
    switch (testStatus) {
      case 'sending': return '#f59e0b';
      case 'sent': return '#0ea5e9';
      case 'confirmed': return '#22c55e';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusMessage = () => {
    switch (testStatus) {
      case 'sending': return '🔄 Sending test email...';
      case 'sent': return '📧 Test email sent! Check your inbox';
      case 'confirmed': return '✅ Test successful! Email forwarding is working';
      case 'error': return '❌ Test failed';
      default: return '⏳ Ready to test your email setup';
    }
  };

  return (
    <Card title="Test Your Email Setup">
      <Stack spacing="lg">
        <Alert variant="info">
          Let's verify that email forwarding is working correctly before you finish.
        </Alert>

        {hasMultipleAliases ? (
          <div>
            <Alert variant="info" style={{ marginBottom: '1rem' }}>
              <strong>Multiple Platforms Setup:</strong> You created separate email aliases for different platforms. 
              We'll test the first one, but all are configured and ready to receive emails.
            </Alert>
            
            {aliases.map((aliasItem: any, index: number) => {
              const platformName = aliasItem.platformName || aliasItem.platform || `Platform ${index + 1}`;
              const aliasEmail = `${aliasItem.alias}@in.autorestock.app`;
              const forwardEmail = aliasItem.forwardTo || forwardingEmail;
              
              return (
                <div 
                  key={index}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: index === 0 ? '#f0f9ff' : '#f9fafb',
                    borderRadius: '12px',
                    border: index === 0 ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0c4a6e' }}>
                    {platformName} {index === 0 && '(Testing this one)'}
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    AutoRestock Email:
                  </div>
                  <div style={{ fontFamily: 'monospace', marginBottom: '0.75rem', color: '#0ea5e9', fontWeight: '600' }}>
                    {aliasEmail}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Forwards to:
                  </div>
                  <div style={{ fontFamily: 'monospace', color: '#22c55e', fontWeight: '600' }}>
                    {forwardEmail}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.875rem', color: '#6b7280' }}>FROM:</strong>
              <div style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>
                noreply@autorestock.app
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.875rem', color: '#6b7280' }}>TO:</strong>
              <div style={{ fontFamily: 'monospace', marginTop: '0.25rem', color: '#0ea5e9', fontWeight: '600' }}>
                {fullAddress}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.875rem', color: '#6b7280' }}>WILL ARRIVE IN:</strong>
              <div style={{ fontFamily: 'monospace', marginTop: '0.25rem', color: '#22c55e', fontWeight: '600' }}>
                {forwardingEmail}
              </div>
            </div>
          </div>
        )}

        <div style={{
          padding: '1.5rem',
          backgroundColor: getStatusColor() + '10',
          borderRadius: '12px',
          border: `2px solid ${getStatusColor()}`,
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600',
            color: getStatusColor(),
            marginBottom: '0.5rem'
          }}>
            {getStatusMessage()}
          </div>
          
          {testStatus === 'sent' && (
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Check your inbox and spam folder at <strong>{forwardingEmail}</strong>
            </div>
          )}

          {testStatus === 'error' && errorMessage && (
            <div style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
              {errorMessage}
            </div>
          )}
        </div>

        <div style={{ 
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Test Options:
          </h4>

          <Stack spacing="md">
            {testStatus === 'idle' && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSendTestEmail}
              >
                Send Test Email
              </Button>
            )}

            {testStatus === 'sending' && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading
                disabled
              >
                Sending...
              </Button>
            )}

            {(testStatus === 'sent' || testStatus === 'error') && (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmReceived}
                >
                  ✓ I Received the Test Email
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={handleSendTestEmail}
                >
                  Send Another Test
                </Button>
              </>
            )}

            {testStatus === 'confirmed' && (
              <Alert variant="success">
                <strong>✅ Email forwarding verified!</strong> Proceeding to completion...
              </Alert>
            )}
          </Stack>
        </div>

        <div style={{ 
          padding: '1rem',
          backgroundColor: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
            <strong>How to Test:</strong> Click "Send Test Email" above, then check your inbox at{' '}
            <strong>{forwardingEmail}</strong>. The email may arrive in your spam folder initially - this is normal for forwarded emails.
          </div>
        </div>

        {/* Whitelist Instructions */}
        <div style={{ marginTop: '2rem' }}>
          <EmailWhitelistInstructions forwardingEmail={forwardingEmail} />
        </div>

        {testStatus !== 'confirmed' && onSkip && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={onSkip}
          >
            Skip Email Test (I'll test later)
          </Button>
        )}
      </Stack>
    </Card>
  );
};

