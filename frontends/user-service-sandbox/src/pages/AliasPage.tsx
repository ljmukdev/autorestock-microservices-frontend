import { useState } from 'react'
import { Container, Alert, Button } from '@autorestock/ui-kit'
import { AliasCreator } from '@autorestock/ui-user'
import { EmailAlias } from '@autorestock/ui-user'

const AliasPage = () => {
  const [createdAlias, setCreatedAlias] = useState<EmailAlias | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_USER_API_BASE || 'https://autorestock-user-service-production.up.railway.app'
  const authToken = import.meta.env.VITE_AUTH_TOKEN

  // Get user and tenant IDs from localStorage
  const userId = localStorage.getItem('sandbox_user_id')
  const tenantId = localStorage.getItem('sandbox_tenant_id')

  const handleAliasCreated = (alias: EmailAlias) => {
    setCreatedAlias(alias)
    setError(null)
  }

  const handleError = (err: any) => {
    setError(err?.message || 'An error occurred')
    setCreatedAlias(null)
  }

  const handleCreateTestTenant = () => {
    // Create test IDs if none exist
    const testUserId = userId || `test-user-${Date.now()}`
    const testTenantId = `test-tenant-${Date.now()}`
    
    localStorage.setItem('sandbox_user_id', testUserId)
    localStorage.setItem('sandbox_tenant_id', testTenantId)
    window.location.reload()
  }

  if (!userId || !tenantId) {
    return (
      <Container maxWidth="md" padding="lg">
        <div className="page-header">
          <h1 className="page-title">Alias Creator</h1>
          <p className="page-description">
            Create email aliases for tenants
          </p>
        </div>

        <Alert variant="warning">
          <strong>Missing User or Tenant ID</strong>
          <br />
          You need both a user ID and tenant ID to test this widget.
          <br />
          <br />
          <Button 
            variant="primary" 
            onClick={handleCreateTestTenant}
            style={{ marginTop: '1rem' }}
          >
            Create Test IDs
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" padding="lg">
      <div className="page-header">
        <h1 className="page-title">Alias Creator</h1>
        <p className="page-description">
          Test the AliasCreator widget for creating email aliases
        </p>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {createdAlias && (
        <Alert variant="success" style={{ marginBottom: '2rem' }}>
          <strong>Success!</strong> Email alias created successfully.
          <br />
          <strong>Alias ID:</strong> {createdAlias.id}
          <br />
          <strong>Alias:</strong> {createdAlias.alias}
          <br />
          <strong>Tenant ID:</strong> {createdAlias.tenantId}
          <br />
          <strong>Active:</strong> {createdAlias.isActive ? 'Yes' : 'No'}
        </Alert>
      )}

      <div className="widget-demo">
        <div className="widget-demo-header">
          <h2 className="widget-demo-title">AliasCreator Widget</h2>
        </div>
        <p className="widget-demo-description">
          This widget allows users to create email aliases for their tenant.
          It includes validation and generates suggestions for alias names.
        </p>

        <Alert variant="info" style={{ marginBottom: '1rem' }}>
          <strong>Testing with:</strong>
          <br />
          User ID: {userId}
          <br />
          Tenant ID: {tenantId}
        </Alert>

        <AliasCreator
          apiBase={apiBase}
          authToken={authToken}
          tenantId={tenantId}
          userId={userId}
          onSuccess={handleAliasCreated}
          onError={handleError}
        />
      </div>
    </Container>
  )
}

export default AliasPage

