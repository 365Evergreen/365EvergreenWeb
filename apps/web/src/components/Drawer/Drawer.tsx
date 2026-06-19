import { useEffect } from 'react'
import styles from './Drawer.module.scss'

type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  children: React.ReactNode
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
}: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
        aria-describedby="drawer-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id="drawer-heading" className={styles.title}>
              {title}
            </h2>
            <p id="drawer-description" className={styles.description}>
              {description}
            </p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close drawer">
            Close
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </aside>
    </div>
  )
}
