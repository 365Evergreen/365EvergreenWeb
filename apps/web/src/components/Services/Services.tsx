import { Link } from 'react-router-dom'
import styles from './Services.module.scss'
import type { ServicesProps } from './Services.types'

export default function Services({ heading, services }: ServicesProps) {
  return (
    <section className={styles.section} aria-labelledby="services-heading">
      <header className={styles.header}>
        <h2 id="services-heading" className={styles.title}>
          {heading}
        </h2>
        <p className={styles.intro}>
          We shape practical Microsoft 365 environments that are clear, usable, and easy
          to maintain.
        </p>
      </header>

      <ul className={styles.grid}>
        {services.map((service) => (
          <li key={service.title}>
            <Link to={service.linkTo} className={styles.cardLink}>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
                <p className={styles.cardAction}>{service.linkLabel}</p>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
