import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function SignInPage() {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)

    // ✅ Prefer explicitly provided return target
    let returnTo = params.get('returnTo')

    if (!returnTo) {
      const currentPath = location.pathname + location.search

      // ✅ Prevent redirect loop
      if (location.pathname === '/signin') {
        returnTo = '/'
      } else {
        returnTo = currentPath
      }
    }

    const loginUrl =
      `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(returnTo)}`

    window.location.assign(loginUrl)
  }, [location.pathname, location.search]) // ✅ more precise dependency

  return (
    <div className="page-shell page-shell--narrow">
      <section className="content-block">
        <p className="lead">Redirecting to sign-in…</p>
      </section>
    </div>
  )
}