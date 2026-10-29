import { NavLink, useParams } from 'react-router-dom'
import {
  LayoutDashboard, FolderTree, Database,
  Rocket, Server, MessageSquare, Zap,
  Activity, ChevronRight, ChevronLeft, Layers,
  Crosshair, Package, Key, Settings, X
} from 'lucide-react'
import Logo from '../ui/Logo'
import styles from './Sidebar.module.css'

const REPOSITORY_NAV = [
  { label: 'Overview',      path: 'overview',       icon: <LayoutDashboard size={16} /> },
  { label: 'Architecture',  path: 'architecture',   icon: <Layers size={16} /> },
  { label: 'Files',         path: 'files',          icon: <FolderTree size={16} /> },
  { label: 'Dependencies',  path: 'dependencies',   icon: <Package size={16} /> },
  { label: 'APIs',          path: 'apis',           icon: <Server size={16} /> },
  { label: 'Database',      path: 'database',       icon: <Database size={16} /> },
  { label: 'Auth',          path: 'authentication', icon: <Key size={16} /> },
  { label: 'Setup',         path: 'setup',          icon: <Settings size={16} /> },
  { label: 'Deployment',    path: 'deployment',     icon: <Rocket size={16} /> },
]

const AI_NAV = [
  { label: 'Chat',          path: 'chat',           icon: <MessageSquare size={16} /> },
  { label: 'Trace Feature', path: 'trace',          icon: <Zap size={16} /> },
  { label: 'Change Impact', path: 'impact',         icon: <Crosshair size={16} /> },
  { label: 'Project Health',path: 'health',         icon: <Activity size={16} /> },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }) {
  const { repoId } = useParams()

  function NavItem({ item }) {
    const base = repoId ? `/repository/${repoId}/${item.path}` : '#'
    return (
      <NavLink
        to={base}
        onClick={() => onMobileClose?.()}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''} ${collapsed ? styles.navItemCollapsed : ''}`
        }
        title={collapsed ? item.label : undefined}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
      </NavLink>
    )
  }

  const sidebarClasses = [
    styles.sidebar,
    collapsed ? styles.sidebarCollapsed : '',
    mobileOpen ? styles.sidebarMobileOpen : '',
  ].filter(Boolean).join(' ')

  return (
    <aside className={sidebarClasses}>
      {/* Header with Logo & optional Mobile Close */}
      <div className={styles.logoHeader}>
        <Logo
          to="/repositories"
          size="sm"
          showText={!collapsed}
          className={styles.logo}
        />
        {mobileOpen && (
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className={styles.nav}>
        {/* Repository section */}
        {!collapsed && (
          <span className={styles.sectionLabel}>Repository</span>
        )}
        {REPOSITORY_NAV.map(item => (
          <NavItem key={item.path} item={item} />
        ))}

        <div className={styles.divider} />

        {/* AI section */}
        {!collapsed && (
          <span className={styles.sectionLabel}>AI</span>
        )}
        {AI_NAV.map(item => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        className={styles.collapseBtn}
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
