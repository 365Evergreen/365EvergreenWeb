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
}

export default function SiteHeader({
  items,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
}: SiteHeaderProps) {
  const menuButtonLabel = isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
  const menuButtonText = isMenuOpen ? 'Close' : 'Menu'
  const navigationClassName = isMenuOpen
    ? `${styles.navigation} ${styles.open}`
    : styles.navigation

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
        <Link
          className={styles.brand}
          to="/"
          aria-label="365 Evergreen Home"
          onClick={onCloseMenu}
        >
          365 Evergreen
        </Link>
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
      </div>
    </header>
  )
}
