import { useState, useEffect, useCallback } from 'react'

export interface BlogPost {
  id: string
  pageId: string
  slug: string
  title: string
  description: string
  status: string
  tags: string[]
  featuredImage?: string
  publishedAt: string
  contentPath?: string
}

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

interface UseBlogPostsResult {
  posts: BlogPost[]
  allTags: string[]
  loading: boolean
  error: string | null
  refetch: () => void
}

function mapRegistryEntry(entry: RegistryEntry): BlogPost {
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

export function useBlogPosts(): UseBlogPostsResult {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/dummy-content/posts-registry.json')
      if (!res.ok) throw new Error(`Failed to load registry (${res.status})`)
      const data = await res.json()
      const entries = Array.isArray(data) ? data : [data]
      const normalized = entries.map(mapRegistryEntry)
      const published = normalized.filter((post) => post.status === 'published')
      published.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      setPosts(published)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()

  return { posts, allTags, loading, error, refetch: fetchPosts }
}
