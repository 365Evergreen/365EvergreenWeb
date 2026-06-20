import { useEffect, useState } from 'react';

export type NavigationItem = {
  label: string;
  to: string;
};

/**
 * SWA client principal shape
 */
type ClientPrincipal = {
  userId: string;
  userDetails: string;
  userRoles: string[];
};

/**
 * Static navigation (public)
 */
const publicItems: NavigationItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Platform', to: '/platform' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
];

/**
 * Conditional items
 */
const editorItem: NavigationItem = {
  label: 'Editor',
  to: '/editor',
};

const loginItem: NavigationItem = {
  label: 'Sign in',
  to: '/signin',
};

const logoutItem: NavigationItem = {
  label: 'Sign out',
  to: '/signin?mode=logout',
};

/**
 * Hook: Primary navigation
 */
export function usePrimaryNavigation() {
  const [items, setItems] = useState<NavigationItem[]>(publicItems);
  const [user, setUser] = useState<ClientPrincipal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/.auth/me');

        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await res.json();

        const principal: ClientPrincipal | null =
          data?.clientPrincipal ?? null;

        setUser(principal);

        // ✅ Build navigation dynamically
        if (principal) {
          const isAuthenticated =
            principal.userRoles?.includes('authenticated');

          // You can extend this later for admin roles
          const nav = [...publicItems];

          if (isAuthenticated) {
            nav.push(editorItem);
          }

          nav.push(logoutItem);

          setItems(nav);
        } else {
          setItems([...publicItems, loginItem]);
        }
      } catch {
        // Fail safe: public only
        setUser(null);
        setItems([...publicItems, loginItem]);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    items,
    user,
    isAuthenticated: !!user,
    loading,
  };
}