import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ExternalLink, User, ChevronDown, FolderGit2, PlusCircle, Settings as SettingsIcon, Menu } from 'lucide-react'
import SearchModal from '../ui/SearchModal'
import NotificationPanel from './NotificationPanel'
import styles from './Topbar.module.css'

export default function Topbar({ repository, onMenuClick }) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <header className={styles.topbar}>
      {/* Mobile hamburger menu toggle */}
      <button
        type="button"
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Toggle repository navigation"
        id="topbar-menu-toggle"
      >
        <Menu size={18} />
      </button>

      {/* Repository context */}
      <div className={styles.repoContext}>
        {repository ? (
          <>
            <span className={styles.repoOwner}>{repository.owner}</span>
            <span className={styles.repoDivider}>/</span>
            <span className={styles.repoName}>{repository.name}</span>
            {repository.url && (
              <a
                href={repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.repoLink}
                title="Open on GitHub"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </>
        ) : (
          <span className={styles.repoPlaceholder}>Select a repository</span>
        )}
      </div>

      <div className={styles.actions}>
        {/* Search */}
        <button
          className={styles.iconBtn}
          aria-label="Search"
          id="topbar-search-btn"
          title="Search (Ctrl+K)"
          onClick={() => setSearchModalOpen(true)}
        >
          <Search size={16} />
        </button>

        {/* Notifications */}
        <div className={styles.notifWrapper}>
          <button
            className={styles.iconBtn}
            aria-label="Notifications"
            id="topbar-notifications-btn"
            title="Notifications"
            onClick={() => setNotificationsOpen(prev => !prev)}
          >
            <Bell size={16} />
            {unreadCount > 0 && <span className={styles.badgeDot} />}
          </button>
          <NotificationPanel
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            onUnreadCountChange={setUnreadCount}
          />
        </div>

        {/* User / Workspace Menu */}
        <div className={styles.userMenu}>
          <button
            className={styles.userBtn}
            onClick={() => setUserMenuOpen(s => !s)}
            id="topbar-user-btn"
            aria-label="Workspace menu"
          >
            <div className={styles.avatar}>
              <User size={14} />
            </div>
            <ChevronDown size={12} className={userMenuOpen ? styles.chevronUp : ''} />
          </button>

          {userMenuOpen && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                id="menu-settings-btn"
              >
                <SettingsIcon size={14} /> Settings
              </button>
              <div className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                onClick={() => { setUserMenuOpen(false); navigate('/repositories'); }}
                id="menu-repositories-btn"
              >
                <FolderGit2 size={14} /> All Repositories
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => { setUserMenuOpen(false); navigate('/repositories/import'); }}
                id="menu-import-btn"
              >
                <PlusCircle size={14} /> Import Repository
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        currentRepository={repository}
      />
    </header>
  )
}
