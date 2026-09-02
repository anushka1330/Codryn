import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import styles from './Breadcrumbs.module.css'

const ROUTE_LABELS = {
  repositories: 'Repositories',
  import: 'Import',
  overview: 'Overview',
  architecture: 'Architecture',
  files: 'Files',
  dependencies: 'Dependencies',
  apis: 'APIs',
  database: 'Database',
  authentication: 'Authentication',
  setup: 'Setup',
  deployment: 'Deployment',
  chat: 'Chat',
  trace: 'Trace Feature',
  impact: 'Change Impact',
  health: 'Project Health',
  repository: 'Repository',
}

export default function Breadcrumbs({ repository }) {
  // Build crumbs from path segments
  const crumbs = []
  const pathParts = window.location.pathname.split('/').filter(Boolean)

  pathParts.forEach((part, i) => {
    const isId = /^\d+$/.test(part) || part.length > 20
    if (isId) return // skip ID segments

    const label = ROUTE_LABELS[part] || part
    const path = '/' + pathParts.slice(0, i + 1).join('/')
    crumbs.push({ label, path })
  })

  if (crumbs.length <= 1) return null

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link to="/" className={styles.home}>
        <Home size={13} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className={styles.crumbGroup}>
          <ChevronRight size={12} className={styles.separator} />
          {i < crumbs.length - 1 ? (
            <Link to={crumb.path} className={styles.crumb}>{crumb.label}</Link>
          ) : (
            <span className={styles.crumbActive}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
