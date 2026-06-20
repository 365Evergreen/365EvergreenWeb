import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { NavigationItem } from '../../hooks/usePrimaryNavigation'
import SiteNavigation from '../SiteNavigation'
import styles from './SiteHeader.module.scss'

type SiteHeaderProps = {
  items: NavigationItem[]
  isMenuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onToggleTools: () => void
  user?: {
    userDetails: string
    userRoles?: string[]
  } | null
}

export default function SiteHeader({
  items,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onToggleTools,
  user,
}: SiteHeaderProps) {
  const menuButtonLabel = isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
  const menuButtonText = isMenuOpen ? 'Close' : 'Menu'

  const navigationClassName = isMenuOpen
    ? `${styles.navigation} ${styles.open}`
    : styles.navigation

  const isAuthenticated = !!user

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCloseMenu])

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link
            className={styles.brand}
            to="/"
            aria-label="365 Evergreen Home"
            onClick={onCloseMenu}
          >
            <img
              className={styles.brandLogo}
              src="https://sa365evergreenwebsite.blob.core.windows.net/$web/assets/Evergreen_Logo__100px.png"
              alt="365 Evergreen"
            />
            <span className={styles.brandText}>365 Evergreen</span>
          </Link>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={onToggleMenu}
          aria-label={menuButtonLabel}
        >
          {menuButtonText}
        </button>

        <nav
          id="primary-navigation"
          className={navigationClassName}
          aria-label="Main navigation"
        >
          <SiteNavigation items={items} onNavigate={onCloseMenu} />
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <span className={styles.userName}>{user.userDetails}</span>

              <a href="/.auth/logout" className={styles.signOut}>
                Sign out
              </a>

              <button
                type="button"
                className={styles.toolsButton}
                onClick={onToggleTools}
                aria-label="Open settings"
              >
                ⚙
              </button>
            </>
          ) : (
            <a href="/.auth/login/aad" className={styles.signIn}>
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  )
}