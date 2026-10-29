import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Layers, Box, FileCode2, Loader2, AlertCircle } from 'lucide-react'
import repositoryService from '../services/repositoryService'
import EmptyState from '../components/ui/EmptyState'
import styles from './Architecture.module.css'

export default function Architecture() {
  const { repository } = useOutletContext() || {}
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Architecture` : 'Codryn — Architecture'
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
        <span>Loading architecture...</span>
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

  const layers = analysis?.architecture?.layers || []
  const patterns = analysis?.architecture?.patterns || []

  if (layers.length === 0) {
    return (
      <div style={{padding:'var(--space-8)'}}>
        <h2 style={{marginBottom:'var(--space-2)',fontWeight:700}}>Architecture</h2>
        <p style={{color:'var(--text-muted)',marginBottom:'var(--space-6)',fontSize:'0.875rem'}}>Visual architecture overview — available after analysis.</p>
        <EmptyState 
          icon={<Layers size={22}/>} 
          title="No architecture data" 
          description="Run repository analysis from the Overview tab to detect architecture layers." 
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Architecture</h2>
        <p className={styles.subtitle}>Detected application layers and patterns</p>
      </div>

      <div className={styles.content}>
        <div className={styles.layersContainer}>
          {layers.map((layer, index) => (
            <div key={layer.name} className={styles.layerCard}>
              <div className={styles.layerHeader}>
                <div className={styles.layerIconWrapper}>
                  <Box size={18} />
                </div>
                <div>
                  <h3 className={styles.layerName}>{layer.name}</h3>
                  <p className={styles.layerDesc}>{layer.description}</p>
                </div>
              </div>
              
              {layer.files && layer.files.length > 0 && (
                <div className={styles.layerFiles}>
                  <div className={styles.fileListLabel}>Sample Files:</div>
                  <ul className={styles.fileList}>
                    {layer.files.map(file => (
                      <li key={file}>
                        <FileCode2 size={13} className={styles.fileIcon} />
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {index < layers.length - 1 && (
                <div className={styles.layerConnector}></div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Architecture Patterns</h3>
            {patterns.length > 0 ? (
              <ul className={styles.patternList}>
                {patterns.map(pattern => (
                  <li key={pattern} className={styles.patternItem}>{pattern}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.textMuted}>No specific patterns detected.</p>
            )}
          </div>
          
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Summary</h3>
            <p className={styles.textMuted}>{analysis.architecture.summary || 'Architecture flows between the detected layers above.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
