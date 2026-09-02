import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info:    <Info size={16} />,
}

function ToastItem({ id, type = 'info', message, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 4000)
    return () => clearTimeout(t)
  }, [id, onRemove])

  return (
    <div className={`${styles.toast} ${styles[`toast--${type}`]}`}>
      <span className={styles.toastIcon}>{ICONS[type]}</span>
      <p className={styles.toastMessage}>{message}</p>
      <button className={styles.toastClose} onClick={() => onRemove(id)} aria-label="Dismiss">
        <X size={12} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className={styles.container} aria-live="polite">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
