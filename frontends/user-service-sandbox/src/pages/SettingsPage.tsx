import { useState } from 'react'
import { Container, Alert, Button } from '@autorestock/ui-kit'
import { ForwardingEmailSettings } from '@autorestock/ui-user'
import { User } from '@autorestock/ui-user'

const SettingsPage = () => {
  const [updatedUser, setUpdatedUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app'
  const authToken = import.meta.env.VITE_AUTH_TOKEN

  // Get user ID from localStorage (set by RegisterPage)
  const userId = localStorage.getItem('sandbox_user_id')

  const handleEmailUpdated = (user: User) => {
    setUpdatedUser(user)
    setError(null)
  }

  const handleError = (err: any) => {
    setError(err?.message || 'An error occurred')
    setUpdatedUser(null)
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
          <h1 className="page-title">Email Settings</h1>
          <p className="page-description">
            Configure forwarding email settings for a user
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
        <h1 className="page-title">Email Settings</h1>
        <p className="page-description">
          Test the ForwardingEmailSettings widget for configuring email forwarding
        </p>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {updatedUser && (
        <Alert variant="success" style={{ marginBottom: '2rem' }}>
          <strong>Success!</strong> Forwarding email updated successfully.
          <br />
          <strong>User ID:</strong> {updatedUser.id}
          <br />
          <strong>Forwarding Email:</strong> {updatedUser.forwardingEmail}
        </Alert>
      )}

      <div className="widget-demo">
        <div className="widget-demo-header">
          <h2 className="widget-demo-title">ForwardingEmailSettings Widget</h2>
        </div>
        <p className="widget-demo-description">
          This widget allows users to configure their forwarding email address.
          It loads the current user data and provides a form to update the forwarding email.
        </p>

        <Alert variant="info" style={{ marginBottom: '1rem' }}>
          <strong>Testing with User ID:</strong> {userId}
        </Alert>

        <ForwardingEmailSettings
          apiBase={apiBase}
          authToken={authToken}
          userId={userId}
          onSuccess={handleEmailUpdated}
          onError={handleError}
        />
      </div>
    </Container>
  )
}

export default SettingsPage

