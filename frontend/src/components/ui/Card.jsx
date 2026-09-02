import styles from './Card.module.css'

/**
 * Codryn Card component
 *
 * @param {'default'|'elevated'|'flat'|'accent'} props.variant
 * @param {boolean} props.hoverable
 * @param {boolean} props.clickable
 */
export default function Card({
  children,
  variant = 'default',
  hoverable = false,
  clickable = false,
  className = '',
  style,
  onClick,
  padding,
  ...rest
}) {
  const classes = [
    styles.card,
    styles[`card--${variant}`],
    hoverable ? styles['card--hoverable'] : '',
    clickable ? styles['card--clickable'] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      style={{ padding, ...style }}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className = '', style }) {
  return (
    <div className={`${styles.cardHeader} ${className}`} style={style}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className = '', style }) {
  return (
    <div className={`${styles.cardBody} ${className}`} style={style}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '', style }) {
  return (
    <div className={`${styles.cardFooter} ${className}`} style={style}>
      {children}
    </div>
  )
}
