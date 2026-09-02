import { Loader2 } from 'lucide-react'
import styles from './Button.module.css'

/**
 * Codryn Button component
 * 
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.disabled
 * @param {React.ReactNode} props.icon
 * @param {string} props.iconPosition - 'left' | 'right'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    loading ? styles['btn--loading'] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <Loader2 size={14} className={styles.spinner} />}
      {!loading && icon && iconPosition === 'left' && (
        <span className={styles.icon}>{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className={styles.icon}>{icon}</span>
      )}
    </button>
  )
}
