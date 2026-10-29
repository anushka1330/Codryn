import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Activity, CheckCircle, AlertTriangle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import repositoryService from '../services/repositoryService'
import EmptyState from '../components/ui/EmptyState'
import styles from './ProjectHealth.module.css'

export default function ProjectHealth() {
  const { repository } = useOutletContext() || {}
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Project Health` : 'Codryn — Project Health'
  }, [repository])

  useEffect(() => {
    async function fetchAnalysis() {
      if (!repository) return
      try {
        setLoading(true)
        const res = await repositoryService.getAnalysis(repository.id)
        setAnalysis(res.analysis)
      } catch (err) {
        if (err.status !== 404) setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [repository])

  if (!repository) return null

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Loader2 size={24} className={styles.spinner} />
        <span>Loading health data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={16} />
        {error}
      </div>
    )
  }

  const health = analysis?.project_health

  if (!health) {
    return (
      <div style={{padding:'var(--space-8)'}}>
        <h2 style={{marginBottom:'var(--space-2)',fontWeight:700}}>Project Health</h2>
        <EmptyState 
          icon={<Activity size={22}/>} 
          title="No health data" 
          description="Run repository analysis from the Overview tab to calculate the project health score." 
        />
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'info': return <CheckCircle size={16} color="var(--success)" />
      case 'warning': return <AlertTriangle size={16} color="var(--warning)" />
      case 'danger': return <XCircle size={16} color="var(--danger)" />
      default: return <AlertCircle size={16} color="var(--text-muted)" />
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}><Activity size={20} className={styles.titleIcon} /> Project Health</h2>
        <p className={styles.subtitle}>
          Estimated repository health based on automated static analysis.
        </p>
      </div>

      <div className={styles.scoreCard}>
        <div className={styles.scoreCircle} style={{ borderColor: getScoreColor(health.score), color: getScoreColor(health.score) }}>
          {health.score}
        </div>
        <div className={styles.scoreText}>
          <h3>Overall Health Score</h3>
          <p>{health.note}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Categories</h3>
          <div className={styles.categories}>
            {health.categories?.map(c => (
              <div key={c.name} className={styles.categoryItem}>
                <span className={styles.catName}>{c.name}</span>
                <span className={`${styles.catStatus} ${c.score === 'Good' ? styles.statusGood : styles.statusWarn}`}>
                  {c.score}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Findings</h3>
          <div className={styles.findings}>
            {health.findings?.length > 0 ? (
              health.findings.map((f, i) => (
                <div key={i} className={styles.findingItem}>
                  <div className={styles.findingHeader}>
                    {getSeverityIcon(f.severity)}
                    <span className={styles.findingCat}>{f.category}</span>
                  </div>
                  <p className={styles.findingMsg}>{f.message}</p>
                  {f.files && f.files.length > 0 && (
                    <ul className={styles.findingFiles}>
                      {f.files.map(file => (
                        <li key={file}>{file}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noFindings}>
                <CheckCircle size={20} color="var(--success)" />
                <p>No critical findings detected! Great job.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
