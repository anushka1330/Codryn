import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { GitBranch, FileCode2, Clock, Layers, Shield, Activity, Database, Key, Server, Rocket, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import repositoryService from '../services/repositoryService'
import styles from './RepositoryOverview.module.css'

export default function RepositoryOverview() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}
  const { toast } = useToast()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (repository?.full_name) {
      document.title = `Codryn — ${repository.full_name}`
    } else {
      document.title = 'Codryn — Repository Overview'
    }
  }, [repository])

  const handleAnalyze = async () => {
    try {
      setError(null)
      if (refreshAnalysis) {
        await refreshAnalysis()
      } else {
        await repositoryService.analyze(repository.id)
      }
      toast('Repository analysis completed successfully!', 'success')
    } catch (err) {
      setError(err.message)
      toast(err.message || 'Analysis failed', 'error')
    }
  }

  if (!repository) return <div className={styles.empty}>Loading...</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.repoName}>{repository.full_name}</h1>
          {repository.description && <p className={styles.desc}>{repository.description}</p>}
        </div>
        <div className={styles.headerActions}>
          <Badge variant={repository.status === 'analyzed' ? 'success' : 'warning'} dot>
            {repository.status}
          </Badge>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleAnalyze} 
            loading={analyzing}
            icon={<RefreshCw size={14} />}
          >
            {analysis ? 'Re-analyze' : 'Analyze Now'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className={styles.statsGrid}>
        {[
          { icon: <FileCode2 size={16}/>, label: 'Language', value: repository.language || '—' },
          { icon: <GitBranch size={16}/>, label: 'Branch', value: repository.default_branch || 'main' },
          { icon: <Clock size={16}/>, label: 'Imported', value: formatDate(repository.created_at) },
          { icon: <Layers size={16}/>, label: 'Status', value: repository.status || '—' },
        ].map((s,i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {analyzing ? (
        <div className={styles.loadingBox}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Analyzing repository...</span>
        </div>
      ) : !analysis ? (
        <div className={styles.analysisNote}>
          <Shield size={16} />
          <span>Run analysis to see architecture, tech stack, dependencies, APIs, and more.</span>
        </div>
      ) : (
        <div className={styles.analysisDashboard}>
          {/* Tech Stack */}
          {analysis.tech_stack && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Tech Stack</h3>
              <div className={styles.tagList}>
                {analysis.tech_stack.languages?.map(l => (
                  <span key={l.name || l} className={styles.tag}>
                    {l.name ? `${l.name} (${l.fileCount} files)` : l}
                  </span>
                ))}
                {analysis.tech_stack.frameworks?.map(f => <span key={f} className={styles.tag}>{f}</span>)}
                {analysis.tech_stack.databases?.map(d => <span key={d} className={styles.tag}>{d}</span>)}
                {analysis.tech_stack.uiLibraries?.map(u => <span key={u} className={styles.tag}>{u}</span>)}
                {analysis.tech_stack.testing?.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                {(!analysis.tech_stack.languages?.length && !analysis.tech_stack.frameworks?.length && !analysis.tech_stack.databases?.length) && 
                  <span className={styles.textMuted}>No specific frameworks detected.</span>
                }
              </div>
            </div>
          )}

          {/* Architecture */}
          {analysis.architecture && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}><Layers size={16} /> Architecture</h3>
              <p className={styles.textMuted}>{analysis.architecture.summary || 'No clear architecture pattern detected.'}</p>
              {analysis.architecture.patterns?.length > 0 && (
                <div className={styles.tagList} style={{marginTop: '8px'}}>
                  {analysis.architecture.patterns.map(p => <span key={p} className={styles.tag}>{p}</span>)}
                </div>
              )}
            </div>
          )}

          {/* APIs & DB */}
          <div className={styles.rowGrid}>
            {analysis.apis && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}><Server size={16} /> APIs</h3>
                <p className={styles.textMuted}>{analysis.apis.total} endpoints detected.</p>
              </div>
            )}
            {analysis.database_info && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}><Database size={16} /> Database</h3>
                <p className={styles.textMuted}>{analysis.database_info.total} models/tables detected.</p>
              </div>
            )}
          </div>

          {/* Auth & Deployment */}
          <div className={styles.rowGrid}>
            {analysis.authentication && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}><Key size={16} /> Authentication</h3>
                <div className={styles.tagList}>
                  {analysis.authentication.providers?.map(p => <span key={p} className={styles.tag}>{p}</span>)}
                  {analysis.authentication.providers?.length === 0 && <span className={styles.textMuted}>None detected</span>}
                </div>
              </div>
            )}
            {analysis.deployment && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}><Rocket size={16} /> Deployment</h3>
                <div className={styles.tagList}>
                  {analysis.deployment.platforms?.map(p => <span key={p} className={styles.tag}>{p}</span>)}
                  {analysis.deployment.platforms?.length === 0 && <span className={styles.textMuted}>None detected</span>}
                </div>
              </div>
            )}
          </div>

          {/* Project Health */}
          {analysis.project_health && (
            <div className={styles.card}>
              <div className={styles.healthHeader}>
                <h3 className={styles.cardTitle}><Activity size={16} /> Project Health</h3>
                <Badge variant={analysis.project_health.score >= 80 ? 'success' : analysis.project_health.score >= 50 ? 'warning' : 'danger'}>
                  Score: {analysis.project_health.score}
                </Badge>
              </div>
              <ul className={styles.healthList}>
                {analysis.project_health.categories?.map(c => (
                  <li key={c.name}>
                    <span className={styles.healthCat}>{c.name}:</span> {c.score}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}
