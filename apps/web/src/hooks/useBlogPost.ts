import { useEffect, useState } from 'react'
import type { BlogPost } from './useBlogPosts'

interface RegistryEntry {
  id?: string
  ID?: string
  pageId?: string
  slug?: string
  title?: string
  summary?: string
  description?: string
  status?: string
  tags?: unknown
  featuredImage?: string
  publishedDate?: string
  publishedAt?: string
  content?: { path?: string }
  contentPath?: string
}

interface UseBlogPostResult {
  post: BlogPost | null
  bodyHtml: string
  loading: boolean
  error: string | null
}

function normalizeRegistryEntry(entry: RegistryEntry): BlogPost {
  return {
    id: String(entry.id ?? entry.ID ?? entry.pageId ?? entry.slug ?? ''),
    pageId: String(entry.id ?? entry.slug ?? ''),
    slug: String(entry.slug ?? ''),
    title: String(entry.title ?? 'Untitled'),
    description: String(entry.summary ?? entry.description ?? ''),
    status: String(entry.status ?? 'draft'),
    tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
    featuredImage: typeof entry.featuredImage === 'string' ? entry.featuredImage : undefined,
    publishedAt: String(entry.publishedDate ?? entry.publishedAt ?? ''),
    contentPath: typeof entry.content?.path === 'string'
      ? entry.content.path
      : typeof entry.contentPath === 'string'
        ? entry.contentPath
        : undefined,
  }
}

function resolveContentPath(post: BlogPost): string {
  if (!post.contentPath) {
    return `/dummy-content/${post.slug}.html`
  }

  if (post.contentPath.startsWith('http://') || post.contentPath.startsWith('https://')) {
    return post.contentPath
  }

  if (post.contentPath.startsWith('/')) {
    return post.contentPath
  }

  return `/${post.contentPath}`
}

async function fetchRegistry(): Promise<BlogPost[]> {
  const res = await fetch('/dummy-content/posts-registry.json')
  if (!res.ok) throw new Error(`Failed to load registry (${res.status})`)
  const data = await res.json()
  const entries = Array.isArray(data) ? data : [data]
  return entries.map(normalizeRegistryEntry)
}

export function useBlogPost(slug: string): UseBlogPostResult {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [bodyHtml, setBodyHtml] = useState('')
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      return
    }

    let canceled = false

    async function loadPost() {
      setLoading(true)
      setError(null)
      setPost(null)
      setBodyHtml('')

      try {
        const posts = await fetchRegistry()
        const found = posts.find((entry) => entry.slug === slug)
        if (!found) {
          throw new Error('Article not found')
        }

        const contentUrl = resolveContentPath(found)
        const contentResponse = await fetch(contentUrl)
        if (!contentResponse.ok) {
          if (contentUrl !== `/dummy-content/${found.slug}.html`) {
            const fallbackResponse = await fetch(`/dummy-content/${found.slug}.html`)
            if (!fallbackResponse.ok) {
              throw new Error(`Unable to load article content (${contentResponse.status})`)
            }
            if (!canceled) {
              setPost(found)
              setBodyHtml(await fallbackResponse.text())
            }
            return
          }
          throw new Error(`Unable to load article content (${contentResponse.status})`)
        }

        const contentType = contentResponse.headers.get('content-type') || ''
        let html = ''
        if (contentType.includes('application/json') || contentUrl.endsWith('.json')) {
          const json = await contentResponse.json()
          html = String(json.html || (json.content && json.content.html) || '')
        } else {
          html = await contentResponse.text()
        }

        if (!canceled) {
          setPost(found)
          setBodyHtml(html)
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Failed to load article')
        }
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    loadPost()

    return () => {
      canceled = true
    }
  }, [slug])

  return { post, bodyHtml, loading, error }
}
