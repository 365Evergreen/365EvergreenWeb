import { Link } from 'react-router-dom'
import type { HeroProps } from './Hero.types'
import styles from './Hero.module.scss'

export default function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaLink,
  imageSrc,
  imageAlt,
}: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Microsoft 365 clarity</p>
          <h1 id="home-hero-title" className={styles.title}>
            {title}
          </h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {ctaLabel && ctaLink ? (
          <Link to={ctaLink} className={styles.cta}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
      <div className={styles.image}>
        <img className={styles.imageElement} src={imageSrc} alt={imageAlt} />
      </div>
    </section>
  )
}
