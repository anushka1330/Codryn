import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ExternalLink, User, ChevronDown, LogOut, Settings } from 'lucide-react'
import styles from './Topbar.module.css'

export default function Topbar({ repository }) {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className={styles.topbar}>
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
          onClick={() => setSearchOpen(s => !s)}
          aria-label="Search"
          id="topbar-search-btn"
        >
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications" id="topbar-notifications-btn">
          <Bell size={16} />
        </button>

        {/* User menu */}
        <div className={styles.userMenu}>
          <button
            className={styles.userBtn}
            onClick={() => setUserMenuOpen(s => !s)}
            id="topbar-user-btn"
          >
            <div className={styles.avatar}>
              <User size={14} />
            </div>
            <ChevronDown size={12} className={userMenuOpen ? styles.chevronUp : ''} />
          </button>

          {userMenuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); navigate('/settings') }}>
                <Settings size={14} /> Settings
              </button>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); navigate('/login') }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
