import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Crosshair, Search, Loader2, AlertCircle } from 'lucide-react'
import { repositoryService } from '../services/repositoryService'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import styles from './ChangeImpact.module.css'

export default function ChangeImpact() {
  const { repository } = useOutletContext() || {}
  const [target, setTarget] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImpact = async (e) => {
    e.preventDefault()
    if (!target.trim() || !repository || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await repositoryService.changeImpact(repository.id, target.trim())
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
        <h2 className={styles.title}><Crosshair size={20} className={styles.titleIcon} /> Change Impact</h2>
        <p className={styles.subtitle}>
          Enter a file, function, or component to see what would break if you changed it.
        </p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleImpact} className={styles.form}>
          <div className={styles.inputWrapper}>
            <Search size={16} className={styles.inputIcon} />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 'AuthService.js' or 'loginUser()'"
              className={styles.input}
              disabled={loading}
            />
          </div>
          <Button type="submit" loading={loading} disabled={!target.trim() || loading}>
            Analyze Impact
          </Button>
        </form>
      </div>

      {loading && (
        <div className={styles.loadingBox}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Analyzing dependencies and impact...</span>
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
            icon={<Crosshair size={24} />}
            title="Impact Analysis"
            description="Enter a target above to analyze its dependencies and the blast radius of potential changes."
          />
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Impact Analysis Result</h3>
          <div className={styles.resultContent}>
            {formatContent(result)}
          </div>
        </div>
      )}
    </div>
  )
}
