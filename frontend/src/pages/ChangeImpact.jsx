import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Crosshair, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { repositoryService } from '../services/repositoryService'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import styles from './ChangeImpact.module.css'

export default function ChangeImpact() {
  const { repository } = useOutletContext() || {}
  const [target, setTarget] = useState('')
  const [files, setFiles] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Change Impact` : 'Codryn — Change Impact'
  }, [repository])

  // Load repository files for quick suggestion chips
  useEffect(() => {
    if (!repository?.id) return
    repositoryService.listFiles(repository.id).then(res => {
      setFiles(res.files || [])
    }).catch(() => {})
  }, [repository])

  const sampleFiles = files.slice(0, 5).map(f => f.path)

  const handleImpact = async (e, customTarget) => {
    if (e) e.preventDefault()
    const query = (customTarget || target).trim()
    if (!query || !repository || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await repositoryService.changeImpact(repository.id, query)
      setResult(res.result)
    } catch (err) {
      setError(err.message || 'Failed to analyze change impact.')
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content) => {
    if (!content) return null
    let formatted = content
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1rem; font-weight: 700; margin: 16px 0 8px 0; color: var(--text-primary);">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 style="font-size: 0.95rem; font-weight: 600; margin: 12px 0 6px 0; color: var(--text-primary);">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; color: #38bdf8;">$1</code>')
      .replace(/\n\n/g, '<br /><br />')
      .replace(/\n/g, '<br />')
    return <div dangerouslySetInnerHTML={{ __html: formatted }} style={{ lineHeight: 1.6 }} />
  }

  if (!repository) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}><Crosshair size={20} className={styles.titleIcon} /> Change Impact Analysis</h2>
        <p className={styles.subtitle}>
          Analyze dependencies and references to see which components, APIs, and files are affected before you modify code.
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
              placeholder="e.g. 'authRoutes.js', 'User.java', or a function name..."
              className={styles.input}
              disabled={loading}
              id="impact-input"
            />
          </div>
          <Button type="submit" loading={loading} disabled={!target.trim() || loading} id="impact-submit-btn">
            Analyze Impact
          </Button>
        </form>

        {sampleFiles.length > 0 && (
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Suggestion: pick a file:
            </span>
            {sampleFiles.map((file, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => {
                  setTarget(file)
                  handleImpact(null, file)
                }}
              >
                {file.split('/').pop()}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.loadingBox}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Analyzing cross-file dependencies and reference graph...</span>
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
            title="Impact Analyzer"
            description="Enter a file path, class, or symbol above to inspect its fan-out impact across the repository."
          />
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Impact Assessment</h3>
          <div className={styles.resultContent}>
            {formatContent(result)}
          </div>
        </div>
      )}
    </div>
  )
}
