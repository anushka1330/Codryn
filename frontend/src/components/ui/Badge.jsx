import styles from './Badge.module.css'

/**
 * Codryn Badge component
 * 
 * @param {'default'|'success'|'warning'|'danger'|'info'|'accent'} props.variant
 * @param {'sm'|'md'} props.size
 * @param {React.ReactNode} props.dot - show a status dot
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  style,
  ...rest
}) {
  const classes = [
    styles.badge,
    styles[`badge--${variant}`],
    styles[`badge--${size}`],
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} style={style} {...rest}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  )
}
