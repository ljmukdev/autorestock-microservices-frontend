import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Alert, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';
import { ForwardingEmailSettingsProps, User } from '../types';

export const ForwardingEmailSettings: React.FC<ForwardingEmailSettingsProps> = ({
  apiBase,
  authToken,
  userId,
  user,
  onSuccess,
  onError,
  themeOverrides,
}) => {
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);

  const { getUser, updateUser, loading, error } = useUserApi({ apiBase, authToken });

  // Load user data if not provided
  useEffect(() => {
    if (!currentUser && userId) {
      getUser(userId)
        .then(setCurrentUser)
        .catch(onError);
    }
  }, [userId, currentUser, getUser, onError]);

  // Set initial forwarding email from user data
  useEffect(() => {
    if (currentUser?.forwardingEmail) {
      setForwardingEmail(currentUser.forwardingEmail);
    }
  }, [currentUser]);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setValidationError('Forwarding email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(forwardingEmail)) {
      return;
    }

    try {
      const updatedUser = await updateUser(userId, {
        forwardingEmail: forwardingEmail.trim(),
      });
      
      setCurrentUser(updatedUser);
      onSuccess?.(updatedUser);
    } catch (err) {
      onError?.(err as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForwardingEmail(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const isEmailChanged = currentUser?.forwardingEmail !== forwardingEmail.trim();

  return (
    <Card title="Forwarding Email Settings">
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          {error && (
            <Alert variant="error" dismissible>
              {error}
            </Alert>
          )}

          {currentUser && (
            <Alert variant="info">
              Configuring forwarding email for <strong>{currentUser.email}</strong>
            </Alert>
          )}

          <Input
            label="Forwarding Email Address"
            type="email"
            value={forwardingEmail}
            onChange={handleInputChange}
            error={validationError}
            fullWidth
            disabled={loading}
            placeholder="notifications@example.com"
            helperText="All notifications and updates will be forwarded to this email address"
          />

          {currentUser?.forwardingEmail && (
            <Alert variant="warning">
              Current forwarding email: <strong>{currentUser.forwardingEmail}</strong>
            </Alert>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !isEmailChanged}
          >
            {isEmailChanged ? 'Update Forwarding Email' : 'No Changes to Save'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};
