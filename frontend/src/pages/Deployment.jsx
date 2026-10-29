import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Rocket, Box, GitBranch, FileCode2, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import styles from './AnalysisPages.module.css'

export default function Deployment() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Deployment` : 'Codryn — Deployment'
  }, [repository])

  const dep = analysis?.deployment
  const hasAnalysis = Boolean(analysis)

  const platforms = dep?.platforms || []
  const containers = dep?.containers || []
  const cicd = dep?.cicd || []
  const configs = dep?.configs || []

  const hasFindings = platforms.length > 0 || containers.length > 0 || cicd.length > 0 || configs.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            <Rocket size={22} className={styles.titleIcon} />
            Deployment & CI/CD
          </h1>
          <p className={styles.subtitle}>
            Detected cloud platforms, containerization (Docker/Kubernetes), CI/CD pipelines, and infrastructure manifests.
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
          <Rocket size={36} className={styles.noticeIcon} />
          <h2 className={styles.noticeTitle}>Repository Not Yet Analyzed</h2>
          <p className={styles.noticeDesc}>
            Run repository analysis to discover Dockerfiles, CI/CD pipelines, and hosting configurations.
          </p>
          <Button onClick={refreshAnalysis} loading={analyzing} icon={<RefreshCw size={14} />}>
            Run Analysis Now
          </Button>
        </div>
      ) : hasFindings ? (
        <div className={styles.grid}>
          {/* Platforms */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Rocket size={16} /> Hosting & Cloud Platforms
              </h3>
              <Badge variant="default">{platforms.length}</Badge>
            </div>
            {platforms.length > 0 ? (
              <div className={styles.badgeList}>
                {platforms.map((p, i) => (
                  <Badge key={i} variant="primary">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className={styles.subtitle}>No specific cloud deployment manifests detected.</p>
            )}
          </div>

          {/* Containers */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Box size={16} /> Containers & Orchestration
              </h3>
              <Badge variant="default">{containers.length}</Badge>
            </div>
            {containers.length > 0 ? (
              <div className={styles.badgeList}>
                {containers.map((c, i) => (
                  <Badge key={i} variant="success">{c}</Badge>
                ))}
              </div>
            ) : (
              <p className={styles.subtitle}>No Docker, Docker Compose, or Kubernetes files found.</p>
            )}
          </div>

          {/* CI/CD Workflows */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <GitBranch size={16} /> CI / CD Pipelines
              </h3>
              <Badge variant="default">{cicd.length}</Badge>
            </div>
            {cicd.length > 0 ? (
              <div className={styles.badgeList}>
                {cicd.map((ci, i) => (
                  <Badge key={i} variant="secondary">{ci}</Badge>
                ))}
              </div>
            ) : (
              <p className={styles.subtitle}>No GitHub Actions, GitLab CI, or Jenkins pipelines detected.</p>
            )}
          </div>

          {/* Config Files */}
          {configs.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <FileCode2 size={16} /> Config Files
                </h3>
                <Badge variant="default">{configs.length}</Badge>
              </div>
              <ul className={styles.fileList}>
                {configs.map((f, i) => (
                  <li key={i} className={styles.fileItem}>
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
          <h2 className={styles.noticeTitle}>No Deployment Configurations Detected</h2>
          <p className={styles.noticeDesc}>
            No Dockerfiles, CI/CD workflows, or cloud platform manifests were found in this repository.
          </p>
        </div>
      )}
    </div>
  )
}
