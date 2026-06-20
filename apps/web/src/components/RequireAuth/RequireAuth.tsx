import { Navigate, useLocation } from 'react-router-dom'

export function RequireAuth({
  user,
  loading,
  children
}: {
  user: null | { userDetails: string; userRoles?: string[] }
  loading: boolean
  children: React.ReactNode
}) {
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return (
      <Navigate
        to={`/signin?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <>{children}</>
}