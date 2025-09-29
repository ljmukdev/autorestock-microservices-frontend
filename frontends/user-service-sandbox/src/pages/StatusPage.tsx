import { useState } from 'react'
import { Container, Alert, Button } from '@autorestock/ui-kit'
import { OnboardingStatus } from '@autorestock/ui-user'
import type { OnboardingStatus as OnboardingStatusType } from '@autorestock/ui-user'

const StatusPage = () => {
  const [status, setStatus] = useState<OnboardingStatusType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app'
  const authToken = import.meta.env.VITE_AUTH_TOKEN

  // Get user ID from localStorage
  const userId = localStorage.getItem('sandbox_user_id')

  const handleStatusChange = (newStatus: OnboardingStatusType) => {
    setStatus(newStatus)
    setError(null)
  }

  const handleError = (err: any) => {
    setError(err?.message || 'An error occurred')
    setStatus(null)
  }

  const handleCreateTestUser = () => {
    // Create a test user ID if none exists
    const testUserId = `test-user-${Date.now()}`
    localStorage.setItem('sandbox_user_id', testUserId)
    window.location.reload()
  }

  if (!userId) {
    return (
      <Container maxWidth="md" padding="lg">
        <div className="page-header">
          <h1 className="page-title">Onboarding Status</h1>
          <p className="page-description">
            Monitor the progress of user onboarding
          </p>
        </div>

        <Alert variant="warning">
          <strong>No User ID Found</strong>
          <br />
          You need to create a user first or provide a user ID to test this widget.
          <br />
          <br />
          <Button 
            variant="primary" 
            onClick={handleCreateTestUser}
            style={{ marginTop: '1rem' }}
          >
            Create Test User ID
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" padding="lg">
      <div className="page-header">
        <h1 className="page-title">Onboarding Status</h1>
        <p className="page-description">
          Test the OnboardingStatus widget with real-time polling
        </p>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {status && (
        <Alert 
          variant={status.isComplete ? "success" : "info"} 
          style={{ marginBottom: '2rem' }}
        >
          <strong>Current Status:</strong> {status.isComplete ? 'Complete' : 'In Progress'}
          <br />
          <strong>Progress:</strong> {
            Object.values(status.steps).filter(Boolean).length
          } / {Object.keys(status.steps).length} steps completed
        </Alert>
      )}

      <div className="widget-demo">
        <div className="widget-demo-header">
          <h2 className="widget-demo-title">OnboardingStatus Widget</h2>
        </div>
        <p className="widget-demo-description">
          This widget monitors the onboarding progress for a user with automatic polling.
          It shows which steps are completed and updates in real-time.
        </p>

        <Alert variant="info" style={{ marginBottom: '1rem' }}>
          <strong>Monitoring User ID:</strong> {userId}
          <br />
          <strong>Polling Interval:</strong> 5 seconds
        </Alert>

        <OnboardingStatus
          apiBase={apiBase}
          authToken={authToken}
          userId={userId}
          pollingInterval={5000}
          onStatusChange={handleStatusChange}
          onError={handleError}
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Testing Notes:</h3>
        <ul>
          <li>The widget automatically polls the API every 5 seconds</li>
          <li>Polling stops when onboarding is marked as complete</li>
          <li>Each step completion is reflected in real-time</li>
          <li>Use the other pages to complete the onboarding steps</li>
        </ul>
      </div>
    </Container>
  )
}

export default StatusPage
