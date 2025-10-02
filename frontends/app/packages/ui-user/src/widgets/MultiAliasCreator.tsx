import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Alert, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';

interface PlatformAlias {
  platform: string;
  platformName: string;
  icon: string;
  enabled: boolean;
  alias: string;
  forwardTo: string;
}

export interface MultiAliasCreatorProps {
  apiBase: string;
  authToken?: string;
  tenantId: string;
  userId: string;
  user: any;
  defaultForwardingEmail: string;
  platformEmailConfig?: Array<{ platform: string; email: string }>; // Pre-configured platform-specific emails from Step 2
  onSuccess: (aliases: any[]) => void;
  onError?: (error: any) => void;
}

const AVAILABLE_PLATFORMS = [
  { id: 'ebay', name: 'eBay', icon: '🛒' },
  { id: 'vinted', name: 'Vinted', icon: '👕' }
];

export const MultiAliasCreator: React.FC<MultiAliasCreatorProps> = ({
  apiBase,
  authToken,
  tenantId,
  userId,
  user,
  defaultForwardingEmail,
  platformEmailConfig,
  onSuccess,
  onError
}) => {
  const [platforms, setPlatforms] = useState<PlatformAlias[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createAlias } = useUserApi({ apiBase, authToken });

  // Initialize platforms
  useEffect(() => {
    console.log('MultiAliasCreator - Initializing with:', {
      platformEmailConfig,
      defaultForwardingEmail,
      user
    });
    
    const baseName = generateBaseName(user);
    
    const initialPlatforms: PlatformAlias[] = AVAILABLE_PLATFORMS.map(p => {
      // Use pre-configured email from Step 2 if available
      const configuredEmail = platformEmailConfig?.find(config => config.platform === p.id)?.email;
      
      console.log(`Platform ${p.id}:`, {
        configuredEmail,
        platformEmailConfig,
        found: platformEmailConfig?.find(config => config.platform === p.id)
      });
      
      // Fallback: auto-generate from domain
      let forwardEmail = configuredEmail;
      if (!forwardEmail) {
        const emailDomain = defaultForwardingEmail.includes('@') 
          ? defaultForwardingEmail.split('@')[1] 
          : 'ljmuk.co.uk';
        forwardEmail = `${p.id}@${emailDomain}`;
        console.log(`${p.id}: No configured email, using fallback: ${forwardEmail}`);
      } else {
        console.log(`${p.id}: Using configured email: ${forwardEmail}`);
      }
      
      return {
        platform: p.id,
        platformName: p.name,
        icon: p.icon,
        enabled: true,
        alias: `${p.id}-${baseName}`,
        forwardTo: forwardEmail
      };
    });
    
    console.log('Final platforms:', initialPlatforms);
    setPlatforms(initialPlatforms);
  }, [user, defaultForwardingEmail, platformEmailConfig]);

  const generateBaseName = (userData: any): string => {
    if (userData.isCompany && userData.companyName) {
      return userData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 15);
    } else if (userData.firstName && userData.lastName) {
      return `${userData.firstName}${userData.lastName}`.toLowerCase();
    }
    return 'user';
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.platform === platformId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const updateAlias = (platformId: string, newAlias: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.platform === platformId ? { ...p, alias: newAlias.toLowerCase() } : p
      )
    );
  };

  const updateForwardTo = (platformId: string, newEmail: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.platform === platformId ? { ...p, forwardTo: newEmail } : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const enabledPlatforms = platforms.filter(p => p.enabled);

      if (enabledPlatforms.length === 0) {
        setError('Please select at least one platform');
        setLoading(false);
        return;
      }

      // Validate all aliases and forwarding emails
      for (const platform of enabledPlatforms) {
        if (!platform.alias.trim()) {
          setError(`Alias for ${platform.platformName} is required`);
          setLoading(false);
          return;
        }
        if (!platform.forwardTo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(platform.forwardTo)) {
          setError(`Valid forwarding email for ${platform.platformName} is required`);
          setLoading(false);
          return;
        }
      }

      // Create aliases one by one
      const createdAliases = [];
      for (const platform of enabledPlatforms) {
        const result = await createAlias({
          tenantId,
          alias: platform.alias,
          forwardTo: platform.forwardTo,
          service: platform.platform
        });
        createdAliases.push({
          ...result,
          platform: platform.platform,
          platformName: platform.platformName
        });
      }

      onSuccess(createdAliases);
    } catch (err: any) {
      setError(err.message || 'Failed to create aliases');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const enabledCount = platforms.filter(p => p.enabled).length;

  return (
    <Card title="Create Email Aliases for Your Platforms">
      <form onSubmit={handleSubmit}>
        <Stack spacing="lg">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <Alert variant="info">
            <strong>Platform-Specific Emails:</strong> Each platform will have its own email address. 
            We've automatically suggested forwarding addresses based on your domain (e.g., ebay@yourdomain.com, vinted@yourdomain.com). 
            You can edit these if you want to use different inboxes.
          </Alert>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Configure Each Platform:
            </h3>

            <Stack spacing="md">
              {platforms.map((platform) => (
                <div
                  key={platform.platform}
                  style={{
                    padding: '1.5rem',
                    border: platform.enabled ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: platform.enabled ? '#f0f9ff' : '#f9fafb',
                    opacity: platform.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={platform.enabled}
                        onChange={() => togglePlatform(platform.platform)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '1.5rem' }}>{platform.icon}</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                        {platform.platformName}
                      </span>
                    </label>
                  </div>

                  {platform.enabled && (
                    <Stack spacing="md">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                          Email Alias:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Input
                            type="text"
                            value={platform.alias}
                            onChange={(e) => updateAlias(platform.platform, e.target.value)}
                            fullWidth
                            disabled={loading}
                          />
                          <span style={{ fontSize: '1rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                            @in.autorestock.app
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Suggested: {platform.alias}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                          Forward {platform.platformName} emails to:
                        </label>
                        <Input
                          type="email"
                          value={platform.forwardTo}
                          onChange={(e) => updateForwardTo(platform.platform, e.target.value)}
                          fullWidth
                          disabled={loading}
                          placeholder="platform-specific@email.com"
                        />
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          💡 Tip: Use different inboxes for better organization
                        </div>
                      </div>
                    </Stack>
                  )}
                </div>
              ))}
            </Stack>
          </div>

          <Alert variant="warning">
            <strong>Note:</strong> Each alias will be created with its own Cloudflare routing rule. 
            You can manage these later if needed.
          </Alert>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || enabledCount === 0}
          >
            {loading 
              ? 'Creating aliases...' 
              : `Create ${enabledCount} Email ${enabledCount === 1 ? 'Alias' : 'Aliases'}`}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};

