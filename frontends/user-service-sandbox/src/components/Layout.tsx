import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@autorestock/ui-kit'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  const resetSandbox = () => {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Reload the page
    window.location.reload()
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/register', label: 'Register' },
    { path: '/settings', label: 'Settings' },
    { path: '/alias', label: 'Alias' },
    { path: '/status', label: 'Status' },
  ]

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">AutoRestock User Service - Sandbox</h1>
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Reset Controls */}
      <div className="reset-controls">
        <Button
          variant="outline"
          size="sm"
          onClick={resetSandbox}
        >
          🔄 Reset Sandbox
        </Button>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
