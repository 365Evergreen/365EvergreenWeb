import type { ClientPrincipal } from '../../types/auth'

type ToolsDrawerProps = {
  isOpen: boolean
  onClose: () => void
  user?: ClientPrincipal | null   // ✅ ADD THIS
}

export default function ToolsDrawer({ isOpen, onClose }: ToolsDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <aside className="drawer">
        <div className="drawer-header">
          Settings
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">
          <h3>Content</h3>
          <a href="/editor">Content dashboard</a>
          <a href="/editor/posts">Manage posts</a>
          <a href="/editor/media">Media library</a>

          <hr />

          <h3>Site</h3>
          <a href="/about">Site information</a>

          <hr />

          <h3>Account</h3>
          <a href="/.auth/logout">Sign out</a>
        </div>
      </aside>
    </>
  )
}