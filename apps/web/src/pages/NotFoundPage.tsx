import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-shell page-shell--narrow">
      <section className="content-block">
        <h1>Page not found</h1>
        <p className="lead">
          The page you are looking for does not exist or has moved.
        </p>
        <Link to="/" className="button button--primary">
          Return to home
        </Link>
      </section>
    </div>
  )
}
