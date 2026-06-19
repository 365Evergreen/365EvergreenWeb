import { Link } from 'react-router-dom'
import styles from './HomepageCta.module.scss'
import type { HomepageCtaProps } from './HomepageCta.types'

export default function HomepageCta({
  heading,
  supportingText,
  buttonLabel,
  buttonLink,
}: HomepageCtaProps) {
  return (
    <section className={styles.section} aria-labelledby="homepage-cta-heading">
      <div className={styles.content}>
        <h2 id="homepage-cta-heading" className={styles.heading}>
          {heading}
        </h2>
        <p className={styles.supportingText}>{supportingText}</p>
      </div>
      <Link to={buttonLink} className={styles.button}>
        {buttonLabel}
      </Link>
    </section>
  )
}
