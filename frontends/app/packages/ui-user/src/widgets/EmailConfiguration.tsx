import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Alert, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';
import { User } from '../types';

export interface EmailConfigurationProps {
  apiBase: string;
  authToken?: string;
  userId: string;
  user: User;
  onSuccess: (strategy: 'single' | 'multiple', emailConfig: any) => void;
  onError?: (error: any) => void;
}

interface PlatformEmail {
  platform: string;
  platformName: string;
  icon: string;
  email: string;
}

const PLATFORMS = [
  { id: 'ebay', name: 'eBay', icon: '🛒' },
  { id: 'vinted', name: 'Vinted', icon: '👕' }
];

export const EmailConfiguration: React.FC<EmailConfigurationProps> = ({
  apiBase,
  authToken,
  userId,
  user,
  onSuccess,
  onError
}) => {
  const [separateEmails, setSeparateEmails] = useState(false);
  const [singleEmail, setSingleEmail] = useState('');
  const [platformEmails, setPlatformEmails] = useState<PlatformEmail[]>([]);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const { updateUser } = useUserApi({ apiBase, authToken });

  // Initialize platform emails
  useEffect(() => {
    const userDomain = user.email.includes('@') ? user.email.split('@')[1] : 'example.com';
    const initialPlatforms: PlatformEmail[] = PLATFORMS.map(p => ({
      platform: p.id,
      platformName: p.name,
      icon: p.icon,
      email: `${p.id}@${userDomain}`
    }));
    setPlatformEmails(initialPlatforms);
    
    // Set initial single email
    if (user.email) {
      setSingleEmail(user.email);
    }
  }, [user]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    if (!separateEmails) {
      // Single email validation
      if (!singleEmail.trim()) {
        setValidationError('Email address is required');
        return;
      }
      if (!validateEmail(singleEmail)) {
        setValidationError('Please enter a valid email address');
        return;
      }
    } else {
      // Platform emails validation
      for (const platform of platformEmails) {
        if (!platform.email.trim()) {
          setValidationError(`Email for ${platform.platformName} is required`);
          return;
        }
        if (!validateEmail(platform.email)) {
          setValidationError(`Please enter a valid email for ${platform.platformName}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Update user with default forwarding email
      const defaultEmail = separateEmails ? platformEmails[0].email : singleEmail;
      await updateUser(userId, {
        forwardingEmail: defaultEmail.trim()
      });

      // Pass configuration to next step
      const emailConfig = separateEmails
        ? { platformEmails: platformEmails.map(p => ({ platform: p.platform, email: p.email.trim() })) }
        : { defaultEmail: singleEmail.trim() };

      onSuccess(separateEmails ? 'multiple' : 'single', emailConfig);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save email configuration');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlatformEmail = (platformId: string, email: string) => {
    setPlatformEmails(prev =>
      prev.map(p =>
        p.platform === platformId ? { ...p, email } : p
      )
    );
    if (validationError) setValidationError('');
  };

  return (
    <Card title="Email Configuration">
      <form onSubmit={handleSubmit}>
        <Stack spacing="lg">
          {validationError && (
            <Alert variant="error">
              {validationError}
            </Alert>
          )}

          <Alert variant="info">
            Configure how you want to receive order notifications from your selling platforms.
          </Alert>

          {/* Strategy Selection */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={separateEmails}
                onChange={(e) => {
                  setSeparateEmails(e.target.checked);
                  setValidationError('');
                }}
                disabled={loading}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  marginTop: '0.125rem'
                }}
              />
              <div>
                <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Use separate email addresses for each platform
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'normal' }}>
                  Better organization - receive eBay notifications in one inbox, Vinted in another
                </div>
              </div>
            </label>
          </div>

          {/* Single Email Mode */}
          {!separateEmails && (
            <div>
              <Input
                label="Where should we forward all platform notifications?"
                type="email"
                value={singleEmail}
                onChange={(e) => {
                  setSingleEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                fullWidth
                disabled={loading}
                placeholder="notifications@example.com"
                helperText="All order notifications from eBay, Vinted, and other platforms will be forwarded here"
              />
            </div>
          )}

          {/* Multiple Email Mode */}
          {separateEmails && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Configure forwarding address for each platform:
              </h3>
              <Stack spacing="md">
                {platformEmails.map((platform) => (
                  <div
                    key={platform.platform}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{platform.icon}</span>
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                        {platform.platformName}
                      </span>
                    </div>
                    <Input
                      label={`Forward ${platform.platformName} emails to:`}
                      type="email"
                      value={platform.email}
                      onChange={(e) => updatePlatformEmail(platform.platform, e.target.value)}
                      fullWidth
                      disabled={loading}
                      placeholder={`${platform.platform}@example.com`}
                    />
                  </div>
                ))}
              </Stack>
              <Alert variant="warning" style={{ marginTop: '1rem' }}>
                <strong>Note:</strong> Make sure these email addresses exist and you have access to them.
              </Alert>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Continue to Create Email Aliases
          </Button>
        </Stack>
      </form>
    </Card>
  );
};

