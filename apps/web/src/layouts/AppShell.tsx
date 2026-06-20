import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import ToolsDrawer from '../components/ToolsDrawer/ToolsDrawer'
import { usePrimaryNavigation } from '../hooks/usePrimaryNavigation'
//import type { ClientPrincipal } from '../../types/auth'

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)

  const {
    items: navigationItems,
    user,
    loading,
  } = usePrimaryNavigation()

  function toggleMenu() {
    setIsMenuOpen((currentState) => !currentState)
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  function openTools() {
    setIsToolsOpen(true)
  }

  function closeTools() {
    setIsToolsOpen(false)
  }

  // Prevent flicker before auth is known
  if (loading) {
    return (
      <div className="app-shell">
        <SiteHeader
          items={navigationItems}
          user={user}
          isMenuOpen={isMenuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          onToggleTools={openTools}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        items={navigationItems}
        user={user}
        isMenuOpen={isMenuOpen}
        onToggleMenu={toggleMenu}
        onCloseMenu={closeMenu}
        onToggleTools={openTools}
      />

      <ToolsDrawer
        isOpen={isToolsOpen}
        onClose={closeTools}
        user={user}
      />

      <main id="main-content" className="main-content">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

export default AppShell