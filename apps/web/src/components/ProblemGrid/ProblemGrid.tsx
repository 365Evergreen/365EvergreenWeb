import styles from './ProblemGrid.module.scss'
import type { ProblemGridProps } from './ProblemGrid.types'

export default function ProblemGrid({
  heading,
  cards,
  conclusion,
}: ProblemGridProps) {
  return (
    <section className={styles.section} aria-labelledby="problem-grid-heading">
      <header className={styles.header}>
        <h2 id="problem-grid-heading" className={styles.title}>
          {heading}
        </h2>
        <p className={styles.intro}>
          If these feel familiar, you are not alone. Many teams hit the same limits as
          their Microsoft 365 footprint grows.
        </p>
      </header>

      <ul className={styles.grid}>
        {cards.map((card) => (
          <li key={card.title} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </li>
        ))}
      </ul>

      <p className={styles.conclusion}>{conclusion}</p>
    </section>
  )
}
