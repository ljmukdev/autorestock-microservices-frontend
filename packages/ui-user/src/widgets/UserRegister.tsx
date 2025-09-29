import React, { useState } from 'react';
import { Button, Input, Card, Alert, Stack } from '@autorestock/ui-kit';
import { useUserApi } from '../hooks/useUserApi';
import { UserRegisterProps, CreateUserRequest } from '../types';

export const UserRegister: React.FC<UserRegisterProps> = ({
  apiBase,
  authToken,
  onSuccess,
  onError,
  themeOverrides,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    forwardingEmail: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { createUser, loading, error } = useUserApi({ apiBase, authToken });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (formData.forwardingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.forwardingEmail)) {
      errors.forwardingEmail = 'Please enter a valid forwarding email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const user = await createUser(formData);
      onSuccess?.(user);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        forwardingEmail: '',
      });
      setValidationErrors({});
    } catch (err) {
      onError?.(err as any);
    }
  };

  const handleInputChange = (field: keyof CreateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <Card title="User Registration">
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          {error && (
            <Alert variant="error" dismissible>
              {error}
            </Alert>
          )}

          <Input
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={validationErrors.email}
            fullWidth
            disabled={loading}
            placeholder="user@example.com"
          />

          <Input
            label="First Name *"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            error={validationErrors.firstName}
            fullWidth
            disabled={loading}
            placeholder="John"
          />

          <Input
            label="Last Name *"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            error={validationErrors.lastName}
            fullWidth
            disabled={loading}
            placeholder="Doe"
          />

          <Input
            label="Forwarding Email (Optional)"
            type="email"
            value={formData.forwardingEmail}
            onChange={handleInputChange('forwardingEmail')}
            error={validationErrors.forwardingEmail}
            fullWidth
            disabled={loading}
            placeholder="forward@example.com"
            helperText="Email address where notifications will be forwarded"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Create User Account
          </Button>
        </Stack>
      </form>
    </Card>
  );
};
