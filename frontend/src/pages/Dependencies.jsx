import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Network, Package, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import styles from './AnalysisPages.module.css'

export default function Dependencies() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Dependencies` : 'Codryn — Dependencies'
  }, [repository])

  const deps = analysis?.dependencies
  const hasAnalysis = Boolean(analysis)

  const production = deps?.production || []
  const development = deps?.development || []
  const notable = deps?.notable || []
  const total = deps?.total || 0

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            <Network size={22} className={styles.titleIcon} />
            Package Dependencies
          </h1>
          <p className={styles.subtitle}>
            Dependencies and build tools extracted from package.json, requirements.txt, and manifests.
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
          <Network size={36} className={styles.noticeIcon} />
          <h2 className={styles.noticeTitle}>Repository Not Yet Analyzed</h2>
          <p className={styles.noticeDesc}>
            Run repository analysis to extract and categorize package dependencies.
          </p>
          <Button onClick={refreshAnalysis} loading={analyzing} icon={<RefreshCw size={14} />}>
            Run Analysis Now
          </Button>
        </div>
      ) : total > 0 ? (
        <div>
          {/* Notable Packages */}
          {notable.length > 0 && (
            <div className={styles.card} style={{ marginBottom: 'var(--space-5)' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Sparkles size={16} /> Notable Libraries & Frameworks
                </h3>
                <Badge variant="primary">{notable.length}</Badge>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Version</th>
                      <th>Purpose / Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notable.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{p.version || 'latest'}</td>
                        <td><Badge variant="secondary">{p.purpose}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className={styles.grid}>
            {/* Production Dependencies */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Package size={16} /> Production ({production.length})
                </h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {production.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{p.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.version || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Development Dependencies */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Package size={16} /> Development ({development.length})
                </h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {development.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{p.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.version || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noticeCard}>
          <CheckCircle2 size={36} style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }} />
          <h2 className={styles.noticeTitle}>No Package Dependencies Found</h2>
          <p className={styles.noticeDesc}>
            This repository contains no package.json or requirements.txt file with declared external dependencies.
          </p>
        </div>
      )}
    </div>
  )
}
