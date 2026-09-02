import styles from './EmptyState.module.css'

/**
 * Codryn EmptyState component
 *
 * @param {React.ReactNode} props.icon
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} props.action - CTA button/element
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
