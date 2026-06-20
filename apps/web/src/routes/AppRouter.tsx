import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import SignInPage from '../pages/SigninPage/SigninPage'
import { RequireAuth } from '../components/RequireAuth/RequireAuth'
import { usePrimaryNavigation } from '../hooks/usePrimaryNavigation'

const HomePage = lazy(() => import('../pages/HomePage'))
const PlatformPage = lazy(() => import('../pages/PlatformPage'))
const BlogPage = lazy(() => import('../pages/BlogPage/index'))
const BlogPostPage = lazy(() => import('../pages/BlogPostPage/index'))
const EditorPage = lazy(() => import('../pages/EditorPage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function PageLoading() {
  return (
    <div className="page-shell page-shell--narrow">
      <section className="content-block">
        <p className="lead">Loading page...</p>
      </section>
    </div>
  )
}

export function AppRouter() {
  // ✅ bring auth state into router
  const { user, loading } = usePrimaryNavigation()

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />

            {/* ✅ Protected route */}
            <Route
              path="/editor"
              element={
                <RequireAuth user={user} loading={loading}>
                  <EditorPage />
                </RequireAuth>
              }
            />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
