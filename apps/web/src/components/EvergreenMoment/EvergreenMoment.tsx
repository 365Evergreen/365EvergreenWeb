import styles from './EvergreenMoment.module.scss'
import type { EvergreenMomentProps } from './EvergreenMoment.types'

export default function EvergreenMoment({
  heading,
  statement,
  detail,
}: EvergreenMomentProps) {
  return (
    <section className={styles.section} aria-labelledby="evergreen-moment-heading">
      <div className={styles.content}>
        <h2 id="evergreen-moment-heading" className={styles.heading}>
          {heading}
        </h2>
        <p className={styles.statement}>{statement}</p>
        <p className={styles.detail}>{detail}</p>
      </div>

      <svg
        className={styles.graphic}
        viewBox="0 0 960 220"
        role="img"
        aria-label="A calm line drawing that grows into a structured branch"
      >
        <path className={styles.lineBase} pathLength="1" d="M20 170H940" />
        <path className={styles.lineGrow} pathLength="1" d="M80 170C240 170 260 90 390 90H540" />
        <path
          className={styles.lineBranchLeft}
          pathLength="1"
          d="M540 90C620 90 640 55 700 55H840"
        />
        <path
          className={styles.lineBranchRight}
          pathLength="1"
          d="M540 90C620 90 640 125 700 125H840"
        />
        <path
          className={styles.lineStructure}
          pathLength="1"
          d="M700 55V125M760 55V125M820 55V125"
        />
      </svg>
    </section>
  )
}
