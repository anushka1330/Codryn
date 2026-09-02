import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GitBranch, ArrowRight, CheckCircle, AlertCircle, Loader2, Code2 } from 'lucide-react'
import Button from '../components/ui/Button'
import styles from './ImportRepository.module.css'

const STEPS = [
  'Validating URL',
  'Connecting to GitHub',
  'Fetching repository info',
  'Reading file tree',
  'Importing source files',
  'Saving to database',
]

const DEMO_URL = 'https://github.com/expressjs/express'

export default function ImportRepository() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [state, setState] = useState('idle') // idle | loading | success | error
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [error, setError] = useState('')
  const [repository, setRepository] = useState(null)

  // Auto-submit if demo param
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setUrl(DEMO_URL)
    }
  }, [searchParams])

  async function handleImport(e) {
    e.preventDefault()
    if (!url.trim()) return

    setState('loading')
    setCurrentStep(0)
    setCompletedSteps([])
    setError('')
    setRepository(null)

    try {
      // Simulate step progression while request is running
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < STEPS.length - 1) {
            setCompletedSteps(c => [...c, prev])
            return prev + 1
          }
          clearInterval(stepInterval)
          return prev
        })
      }, 800)

      const res = await fetch('/api/repositories/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      clearInterval(stepInterval)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')

      setCompletedSteps([0, 1, 2, 3, 4, 5])
      setRepository(data.repository)
      setState('success')
    } catch (err) {
      setState('error')
      setError(err.message)
    }
  }

  function handleNavigate() {
    if (repository) {
      navigate(`/repository/${repository.id}/overview`)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.logo}>
          <Code2 size={20} className={styles.logoIcon} />
          <span>Codryn</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Analyze a Repository</h1>
          <p className={styles.subtitle}>
            Paste a GitHub repository URL and Codryn will import, analyze, and help you understand it.
          </p>
        </div>

        {/* URL Form */}
        <form onSubmit={handleImport} className={styles.form}>
          <div className={styles.urlInput}>
            <GitBranch size={18} className={styles.urlIcon} />
            <input
              type="url"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={state === 'loading'}
              className={styles.input}
              id="import-url-input"
              required
            />
          </div>
          <Button
            type="submit"
            size="lg"
            loading={state === 'loading'}
            disabled={state === 'loading' || !url.trim()}
            id="import-submit-btn"
          >
            {state === 'loading' ? 'Importing...' : 'Import & Analyze'}
            <ArrowRight size={16} />
          </Button>
        </form>

        <button
          type="button"
          className={styles.demoBtn}
          onClick={() => setUrl(DEMO_URL)}
          disabled={state === 'loading'}
        >
          Use demo repository (Express.js)
        </button>

        {/* Progress Steps */}
        {state === 'loading' && (
          <div className={styles.steps}>
            <p className={styles.stepsTitle}>Importing repository...</p>
            {STEPS.map((step, i) => {
              const isDone = completedSteps.includes(i)
              const isActive = i === currentStep
              return (
                <div key={i} className={`${styles.step} ${isDone ? styles.stepDone : isActive ? styles.stepActive : styles.stepPending}`}>
                  <div className={styles.stepIcon}>
                    {isDone
                      ? <CheckCircle size={15} />
                      : isActive
                        ? <Loader2 size={15} className={styles.spin} />
                        : <div className={styles.stepDot} />
                    }
                  </div>
                  <span className={styles.stepLabel}>{step}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Success */}
        {state === 'success' && repository && (
          <div className={styles.success}>
            <CheckCircle size={32} className={styles.successIcon} />
            <h2 className={styles.successTitle}>Repository imported!</h2>
            <p className={styles.successRepo}>{repository.full_name}</p>
            <p className={styles.successDesc}>
              {repository.description || 'Ready for analysis.'}
            </p>
            <div className={styles.successActions}>
              <Button onClick={handleNavigate} size="lg" id="import-view-btn">
                Open Repository Dashboard
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setState('idle'); setUrl(''); setRepository(null) }}
                id="import-another-btn"
              >
                Import Another
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className={styles.errorBox}>
            <AlertCircle size={20} className={styles.errorIcon} />
            <div>
              <p className={styles.errorTitle}>Import failed</p>
              <p className={styles.errorMsg}>{error}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setState('idle')} id="import-retry-btn">
              Try again
            </Button>
          </div>
        )}

        {/* Examples */}
        {state === 'idle' && (
          <div className={styles.examples}>
            <p className={styles.examplesLabel}>Try a public repository:</p>
            <div className={styles.examplesList}>
              {[
                'https://github.com/expressjs/express',
                'https://github.com/fastify/fastify',
                'https://github.com/vitejs/vite',
              ].map(ex => (
                <button
                  key={ex}
                  className={styles.exampleBtn}
                  onClick={() => setUrl(ex)}
                  type="button"
                >
                  <GitBranch size={12} />
                  {ex.replace('https://github.com/', '')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
