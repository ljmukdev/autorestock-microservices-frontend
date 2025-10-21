import React from 'react';
import { Card, Alert, Stack } from '@autorestock/ui-kit';

export interface EmailWhitelistInstructionsProps {
  forwardingEmail: string;
}

export const EmailWhitelistInstructions: React.FC<EmailWhitelistInstructionsProps> = ({
  forwardingEmail
}) => {
  return (
    <Card title="📮 Prevent Emails Going to Spam">
      <Stack spacing="md">
        <Alert variant="warning">
          <strong>Important:</strong> Forwarded emails often arrive in spam folders initially. 
          Follow these steps to ensure AutoRestock emails always reach your inbox.
        </Alert>

        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '2px solid #0ea5e9'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0c4a6e' }}>
            Whitelist AutoRestock Emails
          </h3>

          <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem', color: '#0c4a6e' }}>
              In your email inbox (<strong>{forwardingEmail}</strong>), do the following:
            </p>

            {/* Gmail Instructions */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0c4a6e' }}>
                📧 If you use Gmail:
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  When AutoRestock email arrives (even in spam), <strong>open it</strong>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Click <strong>"Not spam"</strong> button at the top
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Click the <strong>three dots (⋮)</strong> menu
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Select <strong>"Filter messages like this"</strong>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  In the filter, add: From contains <code>@in.autorestock.app</code>
                </li>
                <li>
                  Choose <strong>"Never send it to Spam"</strong> and click Create Filter
                </li>
              </ol>
            </div>

            {/* Outlook Instructions */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0c4a6e' }}>
                📧 If you use Outlook/Office 365:
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  When AutoRestock email arrives (check junk folder), <strong>open it</strong>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Click <strong>"Not Junk"</strong> at the top
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Right-click the email → <strong>"Add sender to Safe Senders"</strong>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Alternatively: Go to Settings → Mail → Junk email
                </li>
                <li>
                  Add <code>@in.autorestock.app</code> to Safe senders list
                </li>
              </ol>
            </div>

            {/* General Instructions */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0c4a6e' }}>
                📧 For Other Email Providers:
              </h4>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  Mark AutoRestock emails as <strong>"Not Spam"</strong>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Add <code>@in.autorestock.app</code> to your safe senders list
                </li>
                <li>
                  Create a filter to always move emails from <code>@in.autorestock.app</code> to inbox
                </li>
              </ol>
            </div>
          </div>
        </div>

        <Alert variant="success">
          <strong>✅ Pro Tip:</strong> After whitelisting, all future emails from AutoRestock will go straight to your inbox!
        </Alert>
      </Stack>
    </Card>
  );
};








