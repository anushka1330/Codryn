import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

/**
 * Codryn brand Cat mark vector icon
 */
export function CatIcon({ size = 'md', className = '' }) {
  const dim = size === 'sm' ? 22 : size === 'lg' ? 36 : 28

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.icon} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="codrynLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Cat Head, Ears & Body Outline matching Codryn branding */}
      <path
        d="M 17 13
           C 24 17, 40 17, 47 13
           C 47 18, 46 22, 49 26
           C 53 32, 53 39, 47 44
           C 45 47, 44 50, 44 53
           C 39 53, 38 43, 32 43
           C 26 43, 25 53, 20 53
           C 20 50, 19 47, 17 44
           C 11 39, 11 32, 15 26
           C 18 22, 17 18, 17 13 Z"
        stroke="url(#codrynLogoGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Perky curved tail on lower-left */}
      <path
        d="M 19 43
           C 14 44, 10 42, 8 35"
        stroke="url(#codrynLogoGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Codryn Logo component — brand icon + typography
 * Clickable to homepage by default (accessible Link)
 */
export default function Logo({
  to = '/',
  size = 'md',
  showText = true,
  className = '',
  text = 'CODRYN'
}) {
  const content = (
    <>
      <span className={styles.iconWrapper}>
        <CatIcon size={size} />
      </span>
      {showText && <span className={styles.text}>{text}</span>}
    </>
  )

  const combinedClass = `${styles.logoLink} ${styles[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={combinedClass} title="Codryn Home">
        {content}
      </Link>
    )
  }

  return <span className={combinedClass}>{content}</span>
}
