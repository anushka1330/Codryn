import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Terminal, Copy, Check, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import styles from './AnalysisPages.module.css'

export default function Setup() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Setup Guide` : 'Codryn — Setup Guide'
  }, [repository])

  const steps = analysis?.setup?.steps || []
  const hasAnalysis = Boolean(analysis)

  const copyCommand = (cmd, index) => {
    navigator.clipboard.writeText(cmd)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            <Terminal size={22} className={styles.titleIcon} />
            Setup & Run Instructions
          </h1>
          <p className={styles.subtitle}>
            Step-by-step instructions detected from project configuration files, dependency manifests, and scripts.
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
          <Terminal size={36} className={styles.noticeIcon} />
          <h2 className={styles.noticeTitle}>Repository Not Yet Analyzed</h2>
          <p className={styles.noticeDesc}>
            Run repository analysis to generate setup, installation, environment configuration, and startup instructions.
          </p>
          <Button onClick={refreshAnalysis} loading={analyzing} icon={<RefreshCw size={14} />}>
            Run Analysis Now
          </Button>
        </div>
      ) : steps.length > 0 ? (
        <div className={styles.stepsList}>
          {steps.map((st, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepBadge}>{st.step || i + 1}</div>
                <h3 className={styles.stepTitle}>{st.title}</h3>
                {st.command && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ marginLeft: 'auto', padding: '4px 8px', height: '28px' }}
                    onClick={() => copyCommand(st.command, i)}
                    title="Copy command"
                  >
                    {copiedIndex === i ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                    <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>
                      {copiedIndex === i ? 'Copied' : 'Copy'}
                    </span>
                  </Button>
                )}
              </div>
              {st.command && (
                <pre className={styles.codeBox}>{st.command}</pre>
              )}
              {st.note && (
                <div className={styles.noteBox}>Note: {st.note}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noticeCard}>
          <CheckCircle2 size={36} style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }} />
          <h2 className={styles.noticeTitle}>No Special Setup Steps Required</h2>
          <p className={styles.noticeDesc}>
            This repository contains no package manifests or build scripts requiring multi-step installation.
          </p>
        </div>
      )}
    </div>
  )
}
