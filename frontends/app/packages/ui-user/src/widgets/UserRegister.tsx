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
    password: '',
    tenantName: '',
    firstName: '',
    lastName: '',
    companyName: '',
    forwardingEmail: '',
    isCompany: false,
    companyType: '',
    companyRegistrationNumber: '',
    isVatRegistered: false,
    vatNumber: '',
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

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Company-specific validation
    if (formData.isCompany) {
      if (!formData.companyName?.trim()) {
        errors.companyName = 'Company name is required';
      }
      
      if (!formData.companyType?.trim()) {
        errors.companyType = 'Company type is required';
      }
      
      if (formData.isVatRegistered && !formData.vatNumber?.trim()) {
        errors.vatNumber = 'VAT number is required when VAT registered';
      }
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
      // Map form data to backend's expected format
      const userData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        forwardingEmail: formData.forwardingEmail,
        isCompany: formData.isCompany,
      };

      // Set tenant name based on company or user name
      if (formData.isCompany && formData.companyName) {
        userData.tenantName = formData.companyName;
        userData.companyName = formData.companyName;
        userData.companyType = formData.companyType;
        userData.companyRegistrationNumber = formData.companyRegistrationNumber;
        userData.isVatRegistered = formData.isVatRegistered;
        userData.vatNumber = formData.vatNumber;
      } else {
        userData.tenantName = `${formData.firstName} ${formData.lastName}`.trim();
      }
      
      const user = await createUser(userData as CreateUserRequest);
      onSuccess?.(user);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        tenantName: '',
        firstName: '',
        lastName: '',
        companyName: '',
        forwardingEmail: '',
        isCompany: false,
        companyType: '',
        companyRegistrationNumber: '',
        isVatRegistered: false,
        vatNumber: '',
      });
      setValidationErrors({});
    } catch (err) {
      onError?.(err as any);
    }
  };

  const handleInputChange = (field: keyof CreateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleCheckboxChange = (field: keyof CreateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked,
    }));
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
            label="Password *"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={validationErrors.password}
            fullWidth
            disabled={loading}
            placeholder="At least 8 characters"
            helperText="Minimum 8 characters required"
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

          {/* Company Information Section */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={formData.isCompany}
                onChange={handleCheckboxChange('isCompany')}
                disabled={loading}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span>I am registering as a company</span>
            </label>

            {formData.isCompany && (
              <div style={{ marginTop: '1rem' }}>
                <Stack spacing="md">
                  <Input
                    label="Company Name *"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange('companyName')}
                    error={validationErrors.companyName}
                    fullWidth
                    disabled={loading}
                    placeholder="Your Company Ltd"
                  />

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      Company Type *
                    </label>
                    <select
                      value={formData.companyType}
                      onChange={handleInputChange('companyType')}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        fontSize: '1rem',
                        border: validationErrors.companyType ? '2px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select company type</option>
                      <option value="sole-trader">Sole Trader</option>
                      <option value="partnership">Partnership</option>
                      <option value="ltd">Limited Company (Ltd)</option>
                      <option value="plc">Public Limited Company (PLC)</option>
                      <option value="llp">Limited Liability Partnership (LLP)</option>
                      <option value="other">Other</option>
                    </select>
                    {validationErrors.companyType && (
                      <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {validationErrors.companyType}
                      </div>
                    )}
                  </div>

                  <Input
                    label="Company Registration Number"
                    type="text"
                    value={formData.companyRegistrationNumber}
                    onChange={handleInputChange('companyRegistrationNumber')}
                    error={validationErrors.companyRegistrationNumber}
                    fullWidth
                    disabled={loading}
                    placeholder="12345678"
                    helperText="Optional - Companies House number or equivalent"
                  />

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.isVatRegistered}
                      onChange={handleCheckboxChange('isVatRegistered')}
                      disabled={loading}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span>Company is VAT registered</span>
                  </label>

                  {formData.isVatRegistered && (
                    <Input
                      label="VAT Number *"
                      type="text"
                      value={formData.vatNumber}
                      onChange={handleInputChange('vatNumber')}
                      error={validationErrors.vatNumber}
                      fullWidth
                      disabled={loading}
                      placeholder="GB123456789"
                      helperText="Your VAT registration number"
                    />
                  )}
                </Stack>
              </div>
            )}
          </div>

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