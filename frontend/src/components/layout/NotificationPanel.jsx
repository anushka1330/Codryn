import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react'
import styles from './NotificationPanel.module.css'

export default function NotificationPanel({ isOpen, onClose, onUnreadCountChange }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('codryn_read_notifications') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    // Fetch real repository events from API
    fetch('/api/repositories')
      .then(r => r.json())
      .then(d => {
        const repos = d.repositories || []
        const notifs = repos.map(r => ({
          id: `repo-${r.id}-${r.status}`,
          repoId: r.id,
          title: r.full_name,
          message: r.status === 'analyzed'
            ? 'Analysis completed successfully. Architecture and insights ready.'
            : r.status === 'error'
              ? (r.error_message || 'Import error occurred.')
              : 'Repository is being imported and indexed.',
          type: r.status === 'error' ? 'error' : 'success',
          time: r.updated_at || r.created_at,
        }))
        setNotifications(notifs)
      })
      .catch(() => setNotifications([]))
  }, [isOpen])

  // Compute unread count
  useEffect(() => {
    const unread = notifications.filter(n => !readIds.includes(n.id)).length
    if (onUnreadCountChange) onUnreadCountChange(unread)
  }, [notifications, readIds, onUnreadCountChange])

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    setReadIds(allIds)
    localStorage.setItem('codryn_read_notifications', JSON.stringify(allIds))
  }

  const handleItemClick = (n) => {
    if (!readIds.includes(n.id)) {
      const updated = [...readIds, n.id]
      setReadIds(updated)
      localStorage.setItem('codryn_read_notifications', JSON.stringify(updated))
    }
    navigate(`/repository/${n.repoId}/overview`)
    onClose()
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length

  return (
    <div className={styles.dropdown} id="notification-panel" role="region" aria-label="Notifications">
      <div className={styles.header}>
        <span className={styles.title}>
          <Bell size={14} /> Notifications
          {unreadCount > 0 && <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>({unreadCount})</span>}
        </span>
        {unreadCount > 0 && (
          <button className={styles.markReadBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <ul className={styles.list}>
          {notifications.map(n => {
            const isUnread = !readIds.includes(n.id)
            return (
              <li
                key={n.id}
                className={`${styles.item} ${isUnread ? styles.itemUnread : ''}`}
                onClick={() => handleItemClick(n)}
              >
                <div className={styles.itemIcon}>
                  {n.type === 'error' ? (
                    <AlertCircle size={15} style={{ color: 'var(--danger)' }} />
                  ) : (
                    <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  )}
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTitle}>{n.title}</div>
                  <div className={styles.itemMsg}>{n.message}</div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          No notifications yet. Status updates will appear here when repositories are analyzed.
        </div>
      )}
    </div>
  )
}
