/**
 * UserRegistration.tsx
 * Component for user registration and account creation
 */

import React, { useState } from 'react';
import { Card } from '@autorestock/ui-kit';
import { Button } from '@autorestock/ui-kit';
import { User, Mail, Phone, Building, MapPin } from 'lucide-react';
import MarketplaceEmailConnection from './MarketplaceEmailConnection';
import { EmailIngestionConfig } from '../types/EmailIngestionConfig';

interface UserRegistrationProps {
  onRegistrationComplete?: (userData: any) => void;
  onLoginRedirect?: () => void;
}

interface UserFormData {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  businessType: string;
  acceptTerms: boolean;
}

export default function UserRegistration({ onRegistrationComplete, onLoginRedirect }: UserRegistrationProps) {
  const [formData, setFormData] = useState<UserFormData>({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'UK',
    businessType: 'individual',
    acceptTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailIngestion, setEmailIngestion] = useState<Partial<EmailIngestionConfig> | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    // Validate email ingestion if enabled
    if (emailIngestion) {
      if (!emailIngestion.gdprConsent) {
        newErrors.gdprConsent = 'You must consent to email access to enable this feature';
      }
      if (!emailIngestion.imapHost?.trim()) {
        newErrors.imapHost = 'IMAP host is required';
      }
      if (!emailIngestion.username?.trim()) {
        newErrors.username = 'Email address is required';
      }
      if (!emailIngestion.appPassword?.trim()) {
        newErrors.appPassword = 'App password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        businessName: formData.businessName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        businessType: formData.businessType
      };

      // Only include emailIngestion if enabled
      if (emailIngestion && emailIngestion.enabled) {
        payload.emailIngestion = emailIngestion;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onRegistrationComplete?.(data.user);
      } else {
        setErrors({ general: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6 border-b text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <User className="w-6 h-6" />
          <span className="text-xl font-semibold">Create Your Account</span>
        </div>
        <p className="text-gray-600">
          Join thousands of resellers using AutoRestock to grow their business
        </p>
      </div>
      
      <div className="p-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Business Information</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.businessName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your business name"
              />
              {errors.businessName && (
                <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual Seller</option>
                  <option value="business">Business Account</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Contact Information</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+44 20 1234 5678"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Marketplace Email Connection (Optional) */}
          <MarketplaceEmailConnection
            value={emailIngestion || undefined}
            onChange={setEmailIngestion}
            errors={errors}
          />

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className={`mt-1 ${errors.acceptTerms ? 'border-red-300' : ''}`}
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-600 text-sm">{errors.acceptTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onLoginRedirect}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </Card>
  );
}

