import { Link } from 'react-router-dom'
import styles from './LatestPosts.module.scss'
import type { LatestPostsProps } from './LatestPosts.types'

export default function LatestPosts({
  heading,
  posts,
  viewAllLabel,
  viewAllLink,
}: LatestPostsProps) {
  return (
    <section className={styles.section} aria-labelledby="latest-posts-heading">
      <header className={styles.header}>
        <div>
          <h2 id="latest-posts-heading" className={styles.title}>
            {heading}
          </h2>
          <p className={styles.intro}>
            Recent thinking on clarity, structure, and practical Microsoft 365 outcomes.
          </p>
        </div>
        {viewAllLabel && viewAllLink ? (
          <Link className={styles.viewAll} to={viewAllLink}>
            {viewAllLabel}
          </Link>
        ) : null}
      </header>

      <ul className={styles.grid}>
        {posts.slice(0, 4).map((post) => (
          <li key={post.title}>
            <Link className={styles.cardLink} to={post.linkTo}>
              <article className={styles.card}>
                {post.meta ? <p className={styles.meta}>{post.meta}</p> : null}
                <h3 className={styles.cardTitle}>{post.title}</h3>
                {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
