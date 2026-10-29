import { useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Database, Table, Layers, RefreshCw, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import styles from './AnalysisPages.module.css'

export default function DatabasePage() {
  const { repository, analysis, refreshAnalysis, analyzing } = useOutletContext() || {}
  const navigate = useNavigate()

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Database` : 'Codryn — Database'
  }, [repository])

  const db = analysis?.database_info
  const hasAnalysis = Boolean(analysis)

  const models = db?.models || []
  const sqlTables = db?.sqlTables || []
  const total = db?.total || 0

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>
            <Database size={22} className={styles.titleIcon} />
            Database & Data Models
          </h1>
          <p className={styles.subtitle}>
            Detected database models, ORM schemas (Prisma, Mongoose, Sequelize, TypeORM), and SQL table definitions.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshAnalysis}
            loading={analyzing}
            icon={<RefreshCw size={14} />}
          >
            {hasAnalysis ? 'Re-analyze' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {!hasAnalysis ? (
        <div className={styles.noticeCard}>
          <Database size={36} className={styles.noticeIcon} />
          <h2 className={styles.noticeTitle}>Repository Not Yet Analyzed</h2>
          <p className={styles.noticeDesc}>
            Run repository analysis to discover database models, entities, and SQL schemas.
          </p>
          <Button onClick={refreshAnalysis} loading={analyzing} icon={<RefreshCw size={14} />}>
            Run Analysis Now
          </Button>
        </div>
      ) : total > 0 ? (
        <div className={styles.grid}>
          {/* ORM Models */}
          {models.length > 0 && (
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Layers size={16} /> ORM Entities & Schemas
                </h3>
                <Badge variant="primary">{models.length}</Badge>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Model Name</th>
                      <th>ORM / Type</th>
                      <th>Source File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                        <td><Badge variant="secondary">{m.type}</Badge></td>
                        <td
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--accent)' }}
                          onClick={() => navigate(`/repository/${repository.id}/files?path=${encodeURIComponent(m.file)}`)}
                        >
                          {m.file}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SQL Tables */}
          {sqlTables.length > 0 && (
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Table size={16} /> SQL Tables
                </h3>
                <Badge variant="default">{sqlTables.length}</Badge>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Table Name</th>
                      <th>Definition File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sqlTables.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                        <td
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--accent)' }}
                          onClick={() => navigate(`/repository/${repository.id}/files?path=${encodeURIComponent(t.file)}`)}
                        >
                          {t.file}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noticeCard}>
          <CheckCircle2 size={36} style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }} />
          <h2 className={styles.noticeTitle}>No Database Schemas Detected</h2>
          <p className={styles.noticeDesc}>
            No Prisma schemas, Mongoose models, Sequelize definitions, or SQL CREATE TABLE statements were detected in this repository.
          </p>
        </div>
      )}
    </div>
  )
}
