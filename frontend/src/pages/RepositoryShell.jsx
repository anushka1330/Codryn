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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRepository() {
      try {
        setLoading(true)
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
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (repoId) fetchRepository()
  }, [repoId, navigate])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <LoadingSpinner size="lg" showLabel label="Loading repository..." />
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

  return <AppShell repository={repository} />
}
