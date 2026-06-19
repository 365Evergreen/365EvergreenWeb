import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'

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
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
