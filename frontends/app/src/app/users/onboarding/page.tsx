'use client'

import { useState } from 'react'
import { Container, Stack, Alert, Card } from '@autorestock/ui-kit'
import { 
  UserRegister, 
  ForwardingEmailSettings,
  EmailStrategySelector,
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

  const handleEmailUpdated = (user: User) => {
    setCreatedUser(user)
    setError(null)
    setCurrentStep(3)
  }

  const handleStrategySelected = (strategy: 'single' | 'multiple') => {
    setEmailStrategy(strategy)
    setError(null)
    setCurrentStep(4)
  }

  const handleSingleAliasCreated = (alias: EmailAlias) => {
    setCreatedAliases([alias])
    setError(null)
    setCurrentStep(5)
  }

  const handleMultipleAliasesCreated = (aliases: any[]) => {
    setCreatedAliases(aliases)
    setError(null)
    setCurrentStep(5)
  }

  const handlePlatformsConfigured = (platforms: string[]) => {
    setConfiguredPlatforms(platforms)
    setError(null)
    setCurrentStep(6)
  }

  const handleEmailTestComplete = () => {
    setError(null)
    setCurrentStep(7)
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
    { number: 2, title: 'Email', description: 'Forwarding' },
    { number: 3, title: 'Strategy', description: 'Choose setup' },
    { number: 4, title: 'Aliases', description: 'Create emails' },
    { number: 5, title: 'Platforms', description: 'Setup guides' },
    { number: 6, title: 'Test', description: 'Verify' },
    { number: 7, title: 'Done!', description: 'All set' },
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
                  // Auto-fill the form with test data
                  const emailField = document.querySelector('input[type="email"]') as HTMLInputElement;
                  const firstNameField = document.querySelector('input[placeholder*="first" i]') as HTMLInputElement;
                  const lastNameField = document.querySelector('input[placeholder*="last" i]') as HTMLInputElement;
                  const companyCheckbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
                  
                  if (emailField) emailField.value = 'ebay@ljmuk.co.uk';
                  if (firstNameField) firstNameField.value = 'Jake';
                  if (lastNameField) lastNameField.value = 'Loynes';
                  
                  // Trigger checkbox click
                  if (companyCheckbox && !companyCheckbox.checked) {
                    companyCheckbox.click();
                    
                    // Wait for company fields to appear, then fill them
                    setTimeout(() => {
                      const companyNameField = document.querySelector('input[placeholder*="company name" i]') as HTMLInputElement;
                      const companyRegField = document.querySelector('input[placeholder*="registration" i]') as HTMLInputElement;
                      const companyTypeSelect = document.querySelector('select') as HTMLSelectElement;
                      
                      if (companyNameField) companyNameField.value = 'LJMUK Ltd';
                      if (companyRegField) companyRegField.value = '15866416';
                      if (companyTypeSelect) companyTypeSelect.value = 'limited';
                      
                      alert('✅ Form auto-filled with test data!');
                    }, 100);
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

          {/* Step 2: Email Settings */}
          {currentStep >= 2 && createdUser && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 2: Email Settings
              </h2>
              <ForwardingEmailSettings
                apiBase={config.userApiBase}
                authToken={config.authToken}
                userId={createdUser.id}
                user={createdUser}
                onSuccess={handleEmailUpdated}
                onError={handleError}
              />
            </div>
          )}

          {/* Step 3: Email Strategy Selection */}
          {currentStep >= 3 && createdUser && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 3: Choose Your Email Setup
              </h2>
              <EmailStrategySelector
                onSelectStrategy={handleStrategySelected}
              />
            </div>
          )}

          {/* Step 4: Alias Creation (Single or Multiple) */}
          {currentStep >= 4 && createdUser && emailStrategy && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 4: Create Your Email {emailStrategy === 'multiple' ? 'Aliases' : 'Alias'}
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
                  onSuccess={handleMultipleAliasesCreated}
                  onError={handleError}
                />
              )}
            </div>
          )}

          {/* Step 5: Platform Configuration */}
          {currentStep >= 5 && createdUser && createdAliases.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 5: Add Email to Your Platforms
              </h2>
              <PlatformConfiguration
                alias={createdAliases[0].alias}
                fullAddress={`${createdAliases[0].alias}@in.autorestock.app`}
                forwardingEmail={createdUser.forwardingEmail || createdUser.email || ''}
                aliases={createdAliases}
                onComplete={handlePlatformsConfigured}
                onSkip={() => setCurrentStep(6)}
              />
            </div>
          )}

          {/* Step 6: Email Delivery Test */}
          {currentStep >= 6 && createdUser && createdAliases.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 6: Test Email Delivery
              </h2>
              <EmailDeliveryTest
                alias={createdAliases[0].alias}
                fullAddress={`${createdAliases[0].alias}@in.autorestock.app`}
                forwardingEmail={createdUser.forwardingEmail || createdUser.email || ''}
                userId={createdUser.id}
                apiBase={config.userApiBase}
                authToken={config.authToken}
                onTestSuccess={handleEmailTestComplete}
                onSkip={() => setCurrentStep(7)}
              />
            </div>
          )}

          {/* Step 7: Onboarding Complete */}
          {currentStep >= 7 && createdUser && createdAliases.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 7: All Done!
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
