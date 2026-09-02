import styles from './LoadingSpinner.module.css'

/**
 * Codryn LoadingSpinner
 * 
 * @param {'sm'|'md'|'lg'|'xl'} props.size
 * @param {string} props.label - accessible label and optional visible text
 * @param {boolean} props.fullPage - center in the viewport
 */
export default function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  fullPage = false,
  showLabel = false,
  className = '',
}) {
  const wrapper = [
    styles.wrapper,
    fullPage ? styles['wrapper--fullPage'] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapper} role="status" aria-label={label}>
      <div className={`${styles.spinner} ${styles[`spinner--${size}`]}`} />
      {showLabel && <p className={styles.label}>{label}</p>}
    </div>
  )
}
