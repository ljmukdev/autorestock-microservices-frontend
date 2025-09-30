import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">AutoRestock</h1>
          <ul className="nav-links">
            <li>
              <Link href="/users/onboarding" className="nav-link">
                User Onboarding
              </Link>
            </li>
            <li>
              <Link href="/vinted" className="nav-link">
                Vinted (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/purchases" className="nav-link">
                Purchases (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/sales" className="nav-link">
                Sales (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/profit" className="nav-link">
                Profit (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/settings" className="nav-link">
                Settings (Coming Soon)
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Welcome to AutoRestock</h1>
          <p className="page-description">
            Your comprehensive inventory management and automation platform
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              User Management
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Set up user accounts, configure email forwarding, and manage onboarding.
            </p>
            <Link 
              href="/users/onboarding" 
              style={{
                display: 'inline-block',
                background: '#0ea5e9',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Start User Setup
            </Link>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Inventory Management
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Track purchases, sales, and profit margins across all your channels.
            </p>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Coming Soon
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem', 
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Automation
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Automate buying, selling, and inventory management workflows.
            </p>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

