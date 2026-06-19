import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import { usePrimaryNavigation } from '../hooks/usePrimaryNavigation'

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigationItems = usePrimaryNavigation()

  function toggleMenu() {
    setIsMenuOpen((currentState) => !currentState)
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader
        items={navigationItems}
        isMenuOpen={isMenuOpen}
        onToggleMenu={toggleMenu}
        onCloseMenu={closeMenu}
      />
      <main id="main-content" className="main-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
