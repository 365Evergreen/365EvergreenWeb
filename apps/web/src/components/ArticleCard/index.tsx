import { Link } from 'react-router-dom'
import type { ViewMode } from '../ViewToggle'
import type { BlogPost } from '../../hooks/useBlogPosts'
import styles from './ArticleCard.module.css'

function formatUkDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface ArticleCardProps {
  article: BlogPost
  view?: ViewMode
}

export function ArticleCard({ article, view = 'grid' }: ArticleCardProps) {
  return (
    <article className={`${styles.card} ${view === 'list' ? styles.cardList : ''}`}>
      {article.featuredImage && (
        <Link to={`/blog/${article.slug}`} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
          <img src={article.featuredImage} alt="" className={styles.image} />
        </Link>
      )}
      <div className={styles.body}>
      <div className={styles.meta}>
        <time className={styles.date} dateTime={article.publishedAt}>
          {formatUkDate(article.publishedAt)}
        </time>
        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
      <h2 className={styles.title}>
        <Link to={`/blog/${article.slug}`} className={styles.titleLink}>
          {article.title}
        </Link>
      </h2>
      {article.description && (
        <p className={styles.excerpt}>{article.description}</p>
      )}
      <Link to={`/blog/${article.slug}`} className={styles.readMore}>
        Read more →
      </Link>
      </div>
    </article>
  )
}
