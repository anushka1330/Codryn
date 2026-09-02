import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './Modal.module.css'

/**
 * Codryn Modal component
 * 
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {string} props.title
 * @param {'sm'|'md'|'lg'|'xl'} props.size
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeOnOverlay = true,
  className = '',
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={closeOnOverlay ? (e) => e.target === e.currentTarget && onClose?.() : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={`${styles.modal} ${styles[`modal--${size}`]} ${className}`} ref={dialogRef}>
        {(title || onClose) && (
          <div className={styles.header}>
            {title && <h3 id="modal-title" className={styles.title}>{title}</h3>}
            <button className={styles.close} onClick={onClose} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
