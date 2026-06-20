import type { ClientPrincipal } from '../../types/auth'
import styles from './ToolsDrawer.module.scss'

type ToolsDrawerProps = {
  isOpen: boolean
  onClose: () => void
  user?: ClientPrincipal | null   // ✅ ADD THIS
}

export default function ToolsDrawer({ isOpen, onClose, user }: ToolsDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Drawer */}
      <aside
  className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
>
        <div className={styles.header}>
          <div className={styles.title}>Settings</div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <h3>Content</h3>
          <a href="/editor">Content dashboard</a>
          <a href="/editor/posts">Manage posts</a>
          <a href="/editor/media">Media library</a>

          <hr />

          <h3>Site</h3>
          <a href="/about">Site information</a>

          <hr />

          <h3>Account</h3>
          {user ? (
            <span>{user.userDetails}</span>
          ) : (
            <a href="/.auth/logout">Sign out</a>
          )}
        </div>
      </aside>
    </>
  )
}