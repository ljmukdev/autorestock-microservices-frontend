import { useState } from 'react'
import { Container, Alert } from '@autorestock/ui-kit'
import { UserRegister } from '@autorestock/ui-user'
import { User } from '@autorestock/ui-user'

const RegisterPage = () => {
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app'
  const authToken = import.meta.env.VITE_AUTH_TOKEN

  const handleUserCreated = (user: User) => {
    setCreatedUser(user)
    setError(null)
    
    // Store user ID for other widgets
    localStorage.setItem('sandbox_user_id', user.id)
    localStorage.setItem('sandbox_tenant_id', user.id) // Using user ID as tenant ID for demo
  }

  const handleError = (err: any) => {
    setError(err?.message || 'An error occurred')
    setCreatedUser(null)
  }

  return (
    <Container maxWidth="md" padding="lg">
      <div className="page-header">
        <h1 className="page-title">User Registration</h1>
        <p className="page-description">
          Test the UserRegister widget for creating new user accounts
        </p>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {createdUser && (
        <Alert variant="success" style={{ marginBottom: '2rem' }}>
          <strong>Success!</strong> User created successfully.
          <br />
          <strong>User ID:</strong> {createdUser.id}
          <br />
          <strong>Email:</strong> {createdUser.email}
          <br />
          <strong>Name:</strong> {createdUser.firstName} {createdUser.lastName}
        </Alert>
      )}

      <div className="widget-demo">
        <div className="widget-demo-header">
          <h2 className="widget-demo-title">UserRegister Widget</h2>
        </div>
        <p className="widget-demo-description">
          This widget handles user registration with form validation and API integration.
          The created user ID will be stored for use in other widgets.
        </p>

        <UserRegister
          apiBase={apiBase}
          authToken={authToken}
          onSuccess={handleUserCreated}
          onError={handleError}
        />
      </div>
    </Container>
  )
}

export default RegisterPage
