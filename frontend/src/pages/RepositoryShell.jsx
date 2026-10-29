import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import LoadingSpinner from '../components/ui/LoadingSpinner'

/**
 * RepositoryShell — fetches repository data and passes it to AppShell.
 * Acts as the data boundary for the repository workspace.
 */
export default function RepositoryShell() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  const [repository, setRepository] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalysis = async (id) => {
    try {
      const res = await fetch(`/api/repositories/${id}/analysis`)
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.analysis || null)
      } else {
        setAnalysis(null)
      }
    } catch {
      setAnalysis(null)
    }
  }

  const refreshAnalysis = async () => {
    if (!repository?.id) return
    try {
      setAnalyzing(true)
      const res = await fetch(`/api/repositories/${repository.id}/analyze`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Analysis failed')
      }
      await fetchAnalysis(repository.id)
      const repoRes = await fetch(`/api/repositories/${repository.id}`)
      if (repoRes.ok) {
        const repoData = await repoRes.json()
        if (repoData.repository) setRepository(repoData.repository)
      }
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/repositories/${repoId}`)
        if (!res.ok) {
          if (res.status === 404) {
            navigate('/repositories', { replace: true })
            return
          }
          throw new Error('Failed to load repository')
        }
        const data = await res.json()
        setRepository(data.repository)
        await fetchAnalysis(repoId)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (repoId) loadData()
  }, [repoId, navigate])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <LoadingSpinner size="lg" showLabel label="Loading repository workspace..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--danger)' }}>Failed to load repository</p>
        <button onClick={() => navigate('/repositories')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to repositories
        </button>
      </div>
    )
  }

  return (
    <AppShell
      repository={repository}
      analysis={analysis}
      refreshAnalysis={refreshAnalysis}
      analyzing={analyzing}
    />
  )
}
