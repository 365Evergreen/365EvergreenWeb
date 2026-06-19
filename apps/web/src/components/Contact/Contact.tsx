import { type FormEvent, useState } from 'react'
import styles from './Contact.module.scss'
import type { ContactProps } from './Contact.types'

export default function Contact({
  heading,
  supportingText,
  emailAddress,
}: ContactProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <section className={styles.section} aria-labelledby="contact-heading">
      <header className={styles.header}>
        <h2 id="contact-heading" className={styles.title}>
          {heading}
        </h2>
        <p className={styles.supportingText}>{supportingText}</p>
      </header>

      <div className={styles.content}>
        <div className={styles.direct}>
          <p className={styles.directLabel}>Prefer email?</p>
          <a href={`mailto:${emailAddress}`} className={styles.emailLink}>
            {emailAddress}
          </a>
          <p className={styles.trust}>No spam, just a reply.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-name">
              Name
            </label>
            <input
              className={styles.input}
              id="contact-name"
              name="name"
              autoComplete="name"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-email">
              Email
            </label>
            <input
              className={styles.input}
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-message">
              Message
            </label>
            <textarea
              className={styles.textarea}
              id="contact-message"
              name="message"
              required
            />
          </div>
          <button className={styles.button} type="submit">
            Send message
          </button>
          {isSubmitted ? (
            <p className={styles.success} role="status">
              Thanks, we will reply shortly.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
