import styles from './Outcome.module.scss'
import type { OutcomeProps } from './Outcome.types'

export default function Outcome({ heading, points }: OutcomeProps) {
  return (
    <section className={styles.section} aria-labelledby="outcome-heading">
      <header className={styles.header}>
        <h2 id="outcome-heading" className={styles.title}>
          {heading}
        </h2>
        <p className={styles.intro}>
          A better setup does not mean more complexity. It means clearer structure, less
          friction, and more time for meaningful work.
        </p>
      </header>

      <div className={styles.lineTrack} aria-hidden="true">
        <span className={styles.line} />
      </div>

      <ul className={styles.list}>
        {points.map((point) => (
          <li key={point.title} className={styles.item}>
            <h3 className={styles.itemTitle}>{point.title}</h3>
            <p className={styles.itemDescription}>{point.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
