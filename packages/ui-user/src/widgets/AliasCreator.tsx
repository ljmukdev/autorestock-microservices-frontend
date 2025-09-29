import React, { useState } from 'react';
import { Button, Input, Card, Alert, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';
import { AliasCreatorProps, CreateAliasRequest } from '../types';

export const AliasCreator: React.FC<AliasCreatorProps> = ({
  apiBase,
  authToken,
  tenantId,
  userId,
  onSuccess,
  onError,
  themeOverrides,
}) => {
  const [alias, setAlias] = useState('');
  const [validationError, setValidationError] = useState('');

  const { createAlias, loading, error } = useUserApi({ apiBase, authToken });

  const validateAlias = (aliasValue: string): boolean => {
    if (!aliasValue.trim()) {
      setValidationError('Alias is required');
      return false;
    }
    
    // Basic validation for email alias format
    const aliasRegex = /^[a-zA-Z0-9._-]+$/;
    if (!aliasRegex.test(aliasValue.trim())) {
      setValidationError('Alias can only contain letters, numbers, dots, underscores, and hyphens');
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
    const value = e.target.value;
    setAlias(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const generateSuggestedAlias = () => {
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

          <Alert variant="info">
            Creating alias for tenant <strong>{tenantId}</strong>
          </Alert>

          <Input
            label="Email Alias"
            type="text"
            value={alias}
            onChange={handleInputChange}
            error={validationError}
            fullWidth
            disabled={loading}
            placeholder="my-alias"
            helperText="This will create an alias like: my-alias@autorestock.com"
          />

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateSuggestedAlias}
              disabled={loading}
            >
              Generate Suggestion
            </Button>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              or create your own
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
