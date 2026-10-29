import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Zap, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { repositoryService } from '../services/repositoryService'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import styles from './TraceFeature.module.css'

export default function TraceFeature() {
  const { repository, analysis } = useOutletContext() || {}
  const [target, setTarget] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Trace Feature` : 'Codryn — Trace Feature'
  }, [repository])

  // Derive contextual sample suggestions from repository
  const suggestions = [
    ...(analysis?.apis?.routes?.slice(0, 3).map(r => `${r.method} ${r.path}`) || []),
    'User authentication flow',
    'Data validation & persistence',
    'Error handling & logging',
  ].slice(0, 4)

  const handleTrace = async (e, customTarget) => {
    if (e) e.preventDefault()
    const query = (customTarget || target).trim()
    if (!query || !repository || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await repositoryService.traceFeature(repository.id, query)
      setResult(res.result)
    } catch (err) {
      setError(err.message || 'Failed to trace feature.')
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
        <h2 className={styles.title}><Zap size={20} className={styles.titleIcon} /> Trace a Feature</h2>
        <p className={styles.subtitle}>
          Trace execution flow across your codebase from entry point through handlers, logic, and data layers.
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
              placeholder="e.g. 'User login flow', 'Game win check', or API route..."
              className={styles.input}
              disabled={loading}
              id="trace-input"
            />
          </div>
          <Button type="submit" loading={loading} disabled={!target.trim() || loading} id="trace-submit-btn">
            Trace Flow
          </Button>
        </form>

        {suggestions.length > 0 && (
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Suggestions:
            </span>
            {suggestions.map((s, idx) => (
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
                  transition: 'all 0.15s ease',
                }}
                onClick={() => {
                  setTarget(s)
                  handleTrace(null, s)
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
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
            title="Feature Flow Tracer"
            description="Enter a feature description or select a suggestion above to map its execution path across the repository."
          />
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Feature Execution Path</h3>
          <div className={styles.resultContent}>
            {formatContent(result)}
          </div>
        </div>
      )}
    </div>
  )
}
