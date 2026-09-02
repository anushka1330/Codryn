import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Zap, Search, Loader2, AlertCircle } from 'lucide-react'
import { repositoryService } from '../services/repositoryService'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import styles from './TraceFeature.module.css'

export default function TraceFeature() {
  const { repository } = useOutletContext() || {}
  const [target, setTarget] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTrace = async (e) => {
    e.preventDefault()
    if (!target.trim() || !repository || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await repositoryService.traceFeature(repository.id, target.trim())
      setResult(res.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content) => {
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />')
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  if (!repository) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}><Zap size={20} className={styles.titleIcon} /> Trace a Feature</h2>
        <p className={styles.subtitle}>
          Describe a feature and Codryn will map the complete code flow from UI to Database.
        </p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleTrace} className={styles.form}>
          <div className={styles.inputWrapper}>
            <Search size={16} className={styles.inputIcon} />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 'User login flow' or 'Payment processing'"
              className={styles.input}
              disabled={loading}
            />
          </div>
          <Button type="submit" loading={loading} disabled={!target.trim() || loading}>
            Trace Flow
          </Button>
        </form>
      </div>

      {loading && (
        <div className={styles.loadingBox}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Tracing feature across codebase...</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && !result && (
        <div className={styles.emptyContainer}>
          <EmptyState
            icon={<Zap size={24} />}
            title="Feature Tracer"
            description="Enter a feature description above to see its complete flow across the architecture."
          />
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Feature Flow</h3>
          <div className={styles.resultContent}>
            {formatContent(result)}
          </div>
        </div>
      )}
    </div>
  )
}
