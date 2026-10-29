import { useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Shield, Key, Lock, FileCode2, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import styles from './AnalysisPages.module.css'

export default function AuthenticationPage() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}
  const navigate = useNavigate()

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Authentication` : 'Codryn — Authentication'
  }, [repository])

  const auth = analysis?.authentication
  const hasAnalysis = Boolean(analysis)

  const providers = auth?.providers || []
  const patterns = auth?.patterns || []
  const authFiles = auth?.files || []
  const middleware = auth?.middleware || []

  const hasFindings = providers.length > 0 || patterns.length > 0 || authFiles.length > 0 || middleware.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            <Shield size={22} className={styles.titleIcon} />
            Authentication Analysis
          </h1>
          <p className={styles.subtitle}>
            Detected authentication patterns, identity providers, authorization flows, and security middleware across the codebase.
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
          <Shield size={36} className={styles.noticeIcon} />
          <h2 className={styles.noticeTitle}>Repository Not Yet Analyzed</h2>
          <p className={styles.noticeDesc}>
            Run repository analysis to automatically detect authentication mechanisms, token schemes, and security middleware.
          </p>
          <Button onClick={refreshAnalysis} loading={analyzing} icon={<RefreshCw size={14} />}>
            Run Analysis Now
          </Button>
        </div>
      ) : hasFindings ? (
        <div className={styles.grid}>
          {/* Identity Providers */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Key size={16} /> Identity Providers
              </h3>
              <Badge variant="default">{providers.length}</Badge>
            </div>
            {providers.length > 0 ? (
              <div className={styles.badgeList}>
                {providers.map((p, i) => (
                  <Badge key={i} variant="primary">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className={styles.subtitle}>No third-party identity providers (OAuth, Clerk, Auth0) detected.</p>
            )}
          </div>

          {/* Patterns & Mechanisms */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Lock size={16} /> Auth Mechanisms
              </h3>
              <Badge variant="default">{patterns.length}</Badge>
            </div>
            {patterns.length > 0 ? (
              <div className={styles.badgeList}>
                {patterns.map((pat, i) => (
                  <Badge key={i} variant="success">{pat}</Badge>
                ))}
              </div>
            ) : (
              <p className={styles.subtitle}>No specific session, cookie, or token storage patterns identified.</p>
            )}
          </div>

          {/* Auth-Related Files */}
          {authFiles.length > 0 && (
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <FileCode2 size={16} /> Auth-Related Files
                </h3>
                <Badge variant="default">{authFiles.length}</Badge>
              </div>
              <ul className={styles.fileList}>
                {authFiles.map((file, i) => (
                  <li
                    key={i}
                    className={styles.fileItem}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/repository/${repository.id}/files?path=${encodeURIComponent(file)}`)}
                    title="Open in file explorer"
                  >
                    <FileCode2 size={14} className={styles.fileItemIcon} />
                    <span>{file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Middleware Files */}
          {middleware.length > 0 && (
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Shield size={16} /> Security Middleware
                </h3>
                <Badge variant="default">{middleware.length}</Badge>
              </div>
              <ul className={styles.fileList}>
                {middleware.map((file, i) => (
                  <li key={i} className={styles.fileItem}>
                    <Shield size={14} className={styles.fileItemIcon} />
                    <span>{file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noticeCard}>
          <CheckCircle2 size={36} style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }} />
          <h2 className={styles.noticeTitle}>No Authentication Patterns Detected</h2>
          <p className={styles.noticeDesc}>
            Static analysis of source files found no authentication frameworks, OAuth providers, JWT tokens, or session middleware. This is normal for libraries, CLI utilities, games, and frontend-only applications.
          </p>
        </div>
      )}
    </div>
  )
}
