'use client'

import { useState } from 'react'
import { Container, Stack, Alert, Card } from '@autorestock/ui-kit'
import { 
  UserRegister, 
  ForwardingEmailSettings, 
  AliasCreator, 
  OnboardingStatus,
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
  const [createdAlias, setCreatedAlias] = useState<EmailAlias | null>(null)
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

  const handleAliasCreated = (alias: EmailAlias) => {
    setCreatedAlias(alias)
    setError(null)
    setCurrentStep(4)
  }

  const handleStatusChange = (status: OnboardingStatusType) => {
    setOnboardingStatus(status)
    setError(null)
  }

  const handleError = (err: any) => {
    setError(err?.message || 'An error occurred')
  }

  const steps = [
    { number: 1, title: 'User Registration', description: 'Create your user account' },
    { number: 2, title: 'Email Settings', description: 'Configure forwarding email' },
    { number: 3, title: 'Create Alias', description: 'Set up your email alias' },
    { number: 4, title: 'Review Status', description: 'Monitor your progress' },
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

          {/* Step 3: Alias Creation */}
          {currentStep >= 3 && createdUser && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 3: Create Email Alias
              </h2>
              <AliasCreator
                apiBase={config.userApiBase}
                authToken={config.authToken}
                tenantId={createdUser.tenantId || createdUser.id}
                userId={createdUser.id}
                user={createdUser}
                onSuccess={handleAliasCreated}
                onError={handleError}
              />
            </div>
          )}

          {/* Step 4: Status Monitoring */}
          {currentStep >= 4 && createdUser && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Step 4: Onboarding Status
              </h2>
              <OnboardingStatus
                apiBase={config.userApiBase}
                authToken={config.authToken}
                userId={createdUser.id}
                pollingInterval={5000}
                onStatusChange={handleStatusChange}
                onError={handleError}
              />
            </div>
          )}
        </Stack>
      </div>
    </div>
  )
}
