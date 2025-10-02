'use client'

import { useState } from 'react'
import { Container, Stack, Alert, Card } from '@autorestock/ui-kit'
import { 
  UserRegister, 
  EmailConfiguration,
  AliasCreator,
  MultiAliasCreator,
  OnboardingStatus,
  PlatformConfiguration,
  EmailDeliveryTest,
  OnboardingComplete,
  User,
  EmailAlias
} from '@autorestock/ui-user'
import { useConfig } from '@/providers/ConfigProvider'

// Define the type locally to avoid naming conflicts
interface OnboardingStatusType {
  userId: string;
  steps: {
    userRegistered: boolean;
    forwardingEmailSet: boolean;
    aliasCreated: boolean;
  };
  isComplete: boolean;
  completedAt?: string;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [emailStrategy, setEmailStrategy] = useState<'single' | 'multiple' | null>(null)
  const [emailConfig, setEmailConfig] = useState<any>(null)
  const [createdAliases, setCreatedAliases] = useState<any[]>([])
  const [configuredPlatforms, setConfiguredPlatforms] = useState<string[]>([])
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatusType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const config = useConfig()

  const handleUserCreated = (user: User) => {
    setCreatedUser(user)
    setError(null)
    setCurrentStep(2)
  }

  const handleEmailConfigured = (strategy: 'single' | 'multiple', config: any) => {
    setEmailStrategy(strategy)
    setEmailConfig(config)
    setError(null)
    setCurrentStep(3)
  }

  const handleSingleAliasCreated = (alias: EmailAlias) => {
    setCreatedAliases([alias])
    setError(null)
    setCurrentStep(4)
  }

  const handleMultipleAliasesCreated = (aliases: any[]) => {
    setCreatedAliases(aliases)
    setError(null)
    setCurrentStep(4)
  }

  const handlePlatformsConfigured = (platforms: string[]) => {
    console.log('handlePlatformsConfigured called with:', platforms);
    setConfiguredPlatforms(platforms)
    setError(null)
    console.log('Setting current step to 5');
    setCurrentStep(5)
  }

  const handleEmailTestComplete = () => {
    setError(null)
    setCurrentStep(6)
  }

  const handleStatusChange = (status: OnboardingStatusType) => {
    setOnboardingStatus(status)
    setError(null)
  }

  const handleError = (err: any) => {
    setError(err?.message || 'An error occurred')
  }

  const steps = [
    { number: 1, title: 'Register', description: 'Create account' },
    { number: 2, title: 'Email Setup', description: 'Configure forwarding' },
    { number: 3, title: 'Aliases', description: 'Create emails' },
    { number: 4, title: 'Platforms', description: 'Setup guides' },
    { number: 5, title: 'Test', description: 'Verify' },
    { number: 6, title: 'Done!', description: 'All set' },
  ]

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">AutoRestock</h1>
          <ul className="nav-links">
            <li>
              <a href="/" className="nav-link">Home</a>
            </li>
            <li>
              <a href="/users/onboarding" className="nav-link active">User Onboarding</a>
            </li>
            <li>
              <button
                onClick={() => {
                  const secret = prompt('Enter admin secret:');
                  if (!secret) return;
                  if (!confirm('Clear ALL database data? This cannot be undone!')) return;
                  
                  fetch('https://autorestock-user-service-production.up.railway.app/api/v1/admin/clear-database', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ secret })
                  })
                  .then(r => r.json())
                  .then(data => {
                    if (data.success) {
                      alert(`✅ Database cleared!\nDeleted: ${data.deleted.users} users, ${data.deleted.tenants} tenants, ${data.deleted.aliases} aliases`);
                      window.location.reload();
                    } else {
                      alert(`❌ Error: ${data.message || data.error}`);
                    }
                  })
                  .catch(err => alert(`❌ Failed: ${err.message}`));
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginRight: '0.5rem'
                }}
              >
                🗑️ Clear DB
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  // Helper to trigger React onChange event
                  const setNativeValue = (element: HTMLInputElement | HTMLSelectElement, value: string) => {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
                    
                    if (valueSetter && valueSetter !== prototypeValueSetter) {
                      prototypeValueSetter?.call(element, value);
                    } else {
                      valueSetter?.call(element, value);
                    }
                    
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                  };
                  
                  // Find inputs by placeholder
                  const emailField = document.querySelector('input[placeholder="user@example.com"]') as HTMLInputElement;
                  const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;
                  const firstNameField = document.querySelector('input[placeholder="John"]') as HTMLInputElement;
                  const lastNameField = document.querySelector('input[placeholder="Doe"]') as HTMLInputElement;
                  const companyCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
                  
                  // Fill basic fields
                  if (emailField) setNativeValue(emailField, 'ebay@ljmuk.co.uk');
                  if (passwordField) setNativeValue(passwordField, 'TestPassword123!');
                  if (firstNameField) setNativeValue(firstNameField, 'Jake');
                  if (lastNameField) setNativeValue(lastNameField, 'Loynes');
                  
                  // Click company checkbox if not checked
                  if (companyCheckbox && !companyCheckbox.checked) {
                    companyCheckbox.click();
                    
                    // Wait for company fields to appear
                    setTimeout(() => {
                      const companyNameField = Array.from(document.querySelectorAll('input[type="text"]'))
                        .find(input => (input as HTMLInputElement).value === '' && 
                              input.previousElementSibling?.textContent?.includes('Company Name')) as HTMLInputElement;
                      const companyRegField = Array.from(document.querySelectorAll('input[type="text"]'))
                        .find(input => input.previousElementSibling?.textContent?.includes('Company Registration')) as HTMLInputElement;
                      const companyTypeSelect = document.querySelector('select') as HTMLSelectElement;
                      
                      if (companyNameField) setNativeValue(companyNameField, 'LJMUK Ltd');
                      if (companyRegField) setNativeValue(companyRegField, '15866416');
                      if (companyTypeSelect) setNativeValue(companyTypeSelect, 'limited');
                      
                      alert('✅ Form auto-filled with test data!');
                    }, 200);
                  } else {
                    alert('✅ Form auto-filled with test data!');
                  }
                }}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                ➕ Auto-Fill Form
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">User Onboarding</h1>
          <p className="page-description">
            Complete your AutoRestock setup with these essential steps
          </p>
        </div>

        {error && (
          <Alert variant="error" style={{ marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Progress Steps */}
        <Card title="Onboarding Progress" padding="lg" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {steps.map((step, index) => (
              <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: step.number <= currentStep ? '#0ea5e9' : '#e5e7eb',
                  color: step.number <= currentStep ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  marginRight: '0.5rem'
                }}>
                  {step.number <= currentStep ? '✓' : step.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: step.number <= currentStep ? '#1f2937' : '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    {step.title}
                  </div>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '0.75rem' 
                  }}>
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '2rem',
                    height: '2px',
                    backgroundColor: step.number < currentStep ? '#0ea5e9' : '#e5e7eb',
                    margin: '0 1rem'
                  }} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Stack spacing="xl">
          {/* Step 1: User Registration */}
          {currentStep >= 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 1: User Registration
              </h2>
              <UserRegister
                apiBase={config.userApiBase}
                authToken={config.authToken}
                onSuccess={handleUserCreated}
                onError={handleError}
              />
            </div>
          )}

          {/* Step 2: Email Configuration (Combined) */}
          {currentStep >= 2 && createdUser && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 2: Email Configuration
              </h2>
              <EmailConfiguration
                apiBase={config.userApiBase}
                authToken={config.authToken}
                userId={createdUser.id}
                user={createdUser}
                onSuccess={handleEmailConfigured}
                onError={handleError}
              />
            </div>
          )}

          {/* Step 3: Alias Creation (Single or Multiple) */}
          {currentStep >= 3 && createdUser && emailStrategy && emailConfig && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 3: Create Your Email {emailStrategy === 'multiple' ? 'Aliases' : 'Alias'}
              </h2>
              {emailStrategy === 'single' ? (
                <AliasCreator
                  apiBase={config.userApiBase}
                  authToken={config.authToken}
                  tenantId={createdUser.tenantId || createdUser.id}
                  userId={createdUser.id}
                  user={createdUser}
                  onSuccess={handleSingleAliasCreated}
                  onError={handleError}
                />
              ) : (
                <MultiAliasCreator
                  apiBase={config.userApiBase}
                  authToken={config.authToken}
                  tenantId={createdUser.tenantId || createdUser.id}
                  userId={createdUser.id}
                  user={createdUser}
                  defaultForwardingEmail={createdUser.forwardingEmail || createdUser.email || ''}
                  platformEmailConfig={emailConfig?.platformEmails}
                  onSuccess={handleMultipleAliasesCreated}
                  onError={handleError}
                />
              )}
            </div>
          )}

          {/* Step 4: Platform Configuration */}
          {currentStep >= 4 && createdUser && createdAliases.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 4: Add Email to Your Platforms
              </h2>
              <PlatformConfiguration
                alias={createdAliases[0].alias}
                fullAddress={`${createdAliases[0].alias}@in.autorestock.app`}
                forwardingEmail={createdUser.forwardingEmail || createdUser.email || ''}
                aliases={createdAliases}
                onComplete={handlePlatformsConfigured}
                onSkip={() => setCurrentStep(5)}
              />
            </div>
          )}

          {/* Step 5: Email Delivery Test */}
          {currentStep >= 5 && createdUser && createdAliases.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 5: Test Email Delivery
              </h2>
              <EmailDeliveryTest
                alias={createdAliases[0].alias}
                fullAddress={`${createdAliases[0].alias}@in.autorestock.app`}
                forwardingEmail={createdUser.forwardingEmail || createdUser.email || ''}
                userId={createdUser.id}
                apiBase={config.userApiBase}
                authToken={config.authToken}
                aliases={createdAliases}
                onTestSuccess={handleEmailTestComplete}
                onSkip={() => setCurrentStep(6)}
              />
            </div>
          )}

          {/* Step 6: Onboarding Complete */}
          {currentStep >= 6 && createdUser && createdAliases.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 6: All Done!
              </h2>
              <OnboardingComplete
                user={createdUser}
                alias={createdAliases[0]}
                aliases={createdAliases}
                platforms={configuredPlatforms}
                onGoToDashboard={() => window.location.href = '/'}
              />
            </div>
          )}
        </Stack>
      </div>
    </div>
  )
}
