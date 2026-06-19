import { useParams, Link } from 'react-router-dom'
import { useBlogPost } from '../../hooks/useBlogPost'
import styles from './BlogPostPage.module.css'

function formatUkDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { post, bodyHtml, loading, error } = useBlogPost(slug)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p>Loading article…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <a href="/blog" className={styles.back}>← Back to Blog</a>
          <h1 className={styles.heading}>Unable to load article</h1>
          <p className={styles.notFound}>{error}</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.heading}>Article not found</h1>
          <p className={styles.notFound}>
            The article you are looking for does not exist.{' '}
            <Link to="/blog" className={styles.backLink}>Back to Blog</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/blog" className={styles.back}>← Back to Blog</Link>
        <div className={styles.meta}>
          <time className={styles.date} dateTime={post.publishedAt}>
            {formatUkDate(post.publishedAt)}
          </time>
          {post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag: string) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        <h1 className={styles.heading}>{post.title}</h1>
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </div>
  )
}
