import { useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Server, Link2, FileCode2, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import styles from './AnalysisPages.module.css'

export default function APIs() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}
  const navigate = useNavigate()

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} APIs` : 'Codryn — APIs'
  }, [repository])

  const apiData = analysis?.apis
  const hasAnalysis = Boolean(analysis)

  const routes = apiData?.routes || []
  const files = apiData?.files || []
  const total = apiData?.total || 0

  const getMethodClass = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return styles.methodGet
      case 'POST': return styles.methodPost
      case 'PUT': return styles.methodPut
      case 'PATCH': return styles.methodPatch
      case 'DELETE': return styles.methodDelete
      default: return styles.methodGet
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            <Server size={22} className={styles.titleIcon} />
            API Endpoints & Routes
          </h1>
          <p className={styles.subtitle}>
            Detected HTTP endpoints, REST routes, and handlers (Express, Next.js, FastAPI, Flask).
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshAnalysis}
            loading={analyzing}
            icon={<RefreshCw size={14} />}
          >
            {hasAnalysis ? 'Re-analyze' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {!hasAnalysis ? (
        <div className={styles.noticeCard}>
          <Server size={36} className={styles.noticeIcon} />
          <h2 className={styles.noticeTitle}>Repository Not Yet Analyzed</h2>
          <p className={styles.noticeDesc}>
            Run repository analysis to automatically discover route handlers and endpoints.
          </p>
          <Button onClick={refreshAnalysis} loading={analyzing} icon={<RefreshCw size={14} />}>
            Run Analysis Now
          </Button>
        </div>
      ) : total > 0 ? (
        <div>
          <div className={styles.card} style={{ marginBottom: 'var(--space-5)' }}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Link2 size={16} /> Detected Endpoints
              </h3>
              <Badge variant="primary">{total} routes</Badge>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Method</th>
                    <th>Route Path</th>
                    <th>Handler File</th>
                    <th style={{ width: '70px' }}>Line</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <span className={`${styles.methodBadge} ${getMethodClass(r.method)}`}>
                          {r.method}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.path}
                      </td>
                      <td
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--accent)' }}
                        onClick={() => navigate(`/repository/${repository.id}/files?path=${encodeURIComponent(r.file)}`)}
                      >
                        {r.file}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {r.line ? `L${r.line}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {files.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <FileCode2 size={16} /> Route Definition Files
                </h3>
                <Badge variant="default">{files.length}</Badge>
              </div>
              <ul className={styles.fileList}>
                {files.map((f, i) => (
                  <li
                    key={i}
                    className={styles.fileItem}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/repository/${repository.id}/files?path=${encodeURIComponent(f)}`)}
                  >
                    <FileCode2 size={14} className={styles.fileItemIcon} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noticeCard}>
          <CheckCircle2 size={36} style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }} />
          <h2 className={styles.noticeTitle}>No API Routes Detected</h2>
          <p className={styles.noticeDesc}>
            No HTTP route definitions (Express router, Next.js API routes, FastAPI endpoints) were found in this repository.
          </p>
        </div>
      )}
    </div>
  )
}
