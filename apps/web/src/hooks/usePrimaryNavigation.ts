export type NavigationItem = {
  label: string
  to: string
}

const primaryNavigationItems: NavigationItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Platform', to: '/platform' },
  { label: 'Blog', to: '/blog' },
  { label: 'Editor', to: '/editor' },
  { label: 'About', to: '/about' },
]

export function usePrimaryNavigation(): NavigationItem[] {
  return primaryNavigationItems
}
