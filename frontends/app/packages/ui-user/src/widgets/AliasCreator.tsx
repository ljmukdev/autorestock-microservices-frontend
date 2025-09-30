import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Alert, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';
import { AliasCreatorProps, CreateAliasRequest } from '../types';

export const AliasCreator: React.FC<AliasCreatorProps> = ({
  apiBase,
  authToken,
  tenantId,
  userId,
  user,
  onSuccess,
  onError,
  themeOverrides,
}) => {
  const [alias, setAlias] = useState('');
  const [validationError, setValidationError] = useState('');

  const { createAlias, loading, error } = useUserApi({ apiBase, authToken });

  // Generate smart alias suggestion on component mount
  useEffect(() => {
    if (user) {
      const suggestedAlias = generateSmartAlias(user);
      setAlias(suggestedAlias);
    }
  }, [user]);

  const generateSmartAlias = (userData: any): string => {
    let baseName = '';

    if (userData.isCompany && userData.companyName) {
      // Use company name
      baseName = userData.companyName;
    } else if (userData.firstName && userData.lastName) {
      // Use user's name
      baseName = `${userData.firstName}${userData.lastName}`;
    } else if (userData.firstName) {
      baseName = userData.firstName;
    } else {
      // Fallback to email username
      baseName = userData.email.split('@')[0];
    }

    // Clean the name: lowercase, remove special chars, replace spaces with hyphens
    let cleanName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens

    // Ensure it's between 3-20 characters
    if (cleanName.length < 3) {
      cleanName = cleanName + '-' + Math.random().toString(36).substr(2, 4);
    }
    if (cleanName.length > 20) {
      cleanName = cleanName.substring(0, 20);
    }

    return cleanName;
  };

  const validateAlias = (aliasValue: string): boolean => {
    if (!aliasValue.trim()) {
      setValidationError('Alias is required');
      return false;
    }
    
    // Validation for email alias format (lowercase alphanumeric, dots, underscores, hyphens)
    const aliasRegex = /^[a-z0-9._-]+$/;
    if (!aliasRegex.test(aliasValue.trim())) {
      setValidationError('Alias can only contain lowercase letters, numbers, dots, underscores, and hyphens');
      return false;
    }

    if (aliasValue.trim().length < 3) {
      setValidationError('Alias must be at least 3 characters long');
      return false;
    }

    if (aliasValue.trim().length > 50) {
      setValidationError('Alias must be less than 50 characters');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAlias(alias)) {
      return;
    }

    try {
      const newAlias = await createAlias({
        tenantId,
        alias: alias.trim(),
      });
      
      onSuccess?.(newAlias);
      setAlias('');
      setValidationError('');
    } catch (err) {
      onError?.(err as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase(); // Force lowercase
    setAlias(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const generateRandomSuggestion = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4);
    setAlias(`user-${timestamp}-${random}`);
  };

  return (
    <Card title="Create Email Alias">
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          {error && (
            <Alert variant="error" dismissible>
              {error}
            </Alert>
          )}

          {user && (
            <Alert variant="info">
              {user.isCompany && user.companyName ? (
                <>Creating alias for <strong>{user.companyName}</strong></>
              ) : (
                <>Creating alias for <strong>{user.firstName} {user.lastName}</strong></>
              )}
            </Alert>
          )}

          <div>
            <Input
              label="Email Alias"
              type="text"
              value={alias}
              onChange={handleInputChange}
              error={validationError}
              fullWidth
              disabled={loading}
              placeholder="my-alias"
              helperText="This will create an alias like: my-alias@in.autorestock.app"
            />
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#6b7280',
              fontFamily: 'monospace'
            }}>
              Your email will be: <strong>{alias || 'your-alias'}@in.autorestock.app</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateRandomSuggestion}
              disabled={loading}
            >
              Generate Random
            </Button>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              or edit the suggestion above
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !alias.trim()}
          >
            Create Email Alias
          </Button>

          <Alert variant="warning">
            <strong>Note:</strong> Once created, this alias cannot be changed. 
            Choose carefully as it will be used for email communications.
          </Alert>
        </Stack>
      </form>
    </Card>
  );
};