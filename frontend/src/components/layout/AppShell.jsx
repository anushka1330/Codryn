import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Breadcrumbs from './Breadcrumbs'
import styles from './AppShell.module.css'

/**
 * AppShell — wraps all repository dashboard pages.
 * Sidebar + Topbar + main content area with outlet.
 *
 * @param {object} props.repository - current repository data
 */
export default function AppShell({ repository }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(s => !s)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className={styles.main}>
        <Topbar
          repository={repository}
          onMenuClick={() => setMobileSidebarOpen(s => !s)}
        />
        <div className={styles.content}>
          <Breadcrumbs repository={repository} />
          <div className={styles.page}>
            <Outlet context={{ repository }} />
          </div>
        </div>
      </div>
    </div>
  )
}
