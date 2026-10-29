import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Plus, Clock, Code2, ArrowRight, Loader2, Search, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import Logo from '../components/ui/Logo'
import styles from './Repositories.module.css'

const STATUS_VARIANT = {
  analyzed: 'success',
  analyzing: 'warning',
  pending: 'default',
  error: 'danger',
}

export default function Repositories() {
  const navigate = useNavigate()
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = 'Codryn — Repositories'
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const res = await fetch('/api/repositories')
        if (res.ok) {
          const data = await res.json()
          setRepos(data.repositories || [])
        } else {
          throw new Error('Unable to fetch repositories')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = repos.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      {/* Brand Navigation Bar */}
      <div className={styles.topNav}>
        <Logo to="/" size="sm" />
        <div className={styles.topNavActions}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Repositories</h1>
          <p className={styles.subtitle}>Your analyzed codebases</p>
        </div>
        <Button onClick={() => navigate('/repositories/import')} icon={<Plus size={15} />} id="add-repo-btn">
          Analyze Repository
        </Button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      {repos.length > 0 && (
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search repositories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              id="repo-search"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={styles.loadingRow}>
          <Loader2 size={20} className={styles.spinner} />
          <span>Loading repositories...</span>
        </div>
      ) : filtered.length === 0 && search ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No repositories found"
          description={`No results for "${search}"`}
        />
      ) : repos.length === 0 ? (
        <EmptyState
          icon={<GitBranch size={22} />}
          title="No repositories yet"
          description="Paste a GitHub URL to analyze your first repository and get AI-powered codebase intelligence."
          action={
            <Button onClick={() => navigate('/repositories/import')} id="empty-state-analyze-btn">
              Analyze a Repository
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map(repo => (
            <button
              key={repo.id}
              className={styles.repoCard}
              onClick={() => navigate(`/repository/${repo.id}/overview`)}
              id={`repo-card-${repo.id}`}
            >
              <div className={styles.repoHeader}>
                <div className={styles.repoMeta}>
                  <Code2 size={14} className={styles.repoIcon} />
                  <span className={styles.repoFullName}>{repo.full_name}</span>
                </div>
                <Badge variant={STATUS_VARIANT[repo.status] || 'default'} dot>
                  {repo.status}
                </Badge>
              </div>

              {repo.description && (
                <p className={styles.repoDesc}>{repo.description}</p>
              )}

              <div className={styles.repoFooter}>
                {repo.language && (
                  <span className={styles.repoPill}>{repo.language}</span>
                )}
                <div className={styles.repoTime}>
                  <Clock size={11} />
                  <span>{formatDate(repo.updated_at)}</span>
                </div>
                <ArrowRight size={14} className={styles.arrow} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
