import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Codryn — 404 Page Not Found'
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <Logo to="/" size="md" />
        </div>

        <div className={styles.codeBadge}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.desc}>
          The page or route you are looking for doesn't exist or has moved.
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={15} />}>
            Go back
          </Button>
          <Button onClick={() => navigate('/')} icon={<Home size={15} />}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
