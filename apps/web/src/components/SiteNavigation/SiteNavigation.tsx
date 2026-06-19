import { NavLink } from 'react-router-dom'
import type { NavigationItem } from '../../hooks/usePrimaryNavigation'
import styles from './SiteNavigation.module.scss'

type SiteNavigationProps = {
  items: NavigationItem[]
  onNavigate: () => void
}

function getNavLinkClassName({
  isActive,
  isPending,
}: {
  isActive: boolean
  isPending: boolean
}) {
  const classNames = [styles.link]

  if (isActive) {
    classNames.push(styles.active)
  }

  if (isPending) {
    classNames.push(styles.pending)
  }

  return classNames.join(' ')
}

export default function SiteNavigation({ items, onNavigate }: SiteNavigationProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.to}>
          <NavLink className={getNavLinkClassName} to={item.to} onClick={onNavigate}>
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
