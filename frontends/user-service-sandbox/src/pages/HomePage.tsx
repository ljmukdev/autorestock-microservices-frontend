import { Container, Card, Stack, Alert } from '@autorestock/ui-kit'

const HomePage = () => {
  const apiBase = import.meta.env.VITE_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app'

  return (
    <Container maxWidth="lg" padding="lg">
      <div className="page-header">
        <h1 className="page-title">User Service Sandbox</h1>
        <p className="page-description">
          Test the AutoRestock User Service UI widgets in isolation
        </p>
      </div>

      <Stack spacing="lg">
        <Alert variant="info">
          <strong>API Base URL:</strong> {apiBase}
          <br />
          This sandbox environment allows you to test individual widgets and flows
          without the complexity of the full application.
        </Alert>

        <Card title="Available Widgets" padding="lg">
          <Stack spacing="md">
            <div>
              <h3>UserRegister</h3>
              <p>Create new user accounts with email validation and form handling.</p>
            </div>
            
            <div>
              <h3>ForwardingEmailSettings</h3>
              <p>Configure email forwarding for existing users.</p>
            </div>
            
            <div>
              <h3>AliasCreator</h3>
              <p>Create email aliases for tenants.</p>
            </div>
            
            <div>
              <h3>OnboardingStatus</h3>
              <p>Monitor the progress of user onboarding with real-time updates.</p>
            </div>
          </Stack>
        </Card>

        <Card title="Testing Instructions" padding="lg">
          <Stack spacing="md">
            <div>
              <h4>1. Start with Registration</h4>
              <p>Navigate to the Register page to create a new user account.</p>
            </div>
            
            <div>
              <h4>2. Configure Settings</h4>
              <p>Use the Settings page to set up email forwarding.</p>
            </div>
            
            <div>
              <h4>3. Create Alias</h4>
              <p>Generate an email alias for your tenant.</p>
            </div>
            
            <div>
              <h4>4. Monitor Progress</h4>
              <p>Check the Status page to see your onboarding progress.</p>
            </div>
            
            <div>
              <h4>5. Reset When Done</h4>
              <p>Use the Reset button to clear all data and start fresh.</p>
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export default HomePage

