import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Code2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  function update(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login'
      const body = mode === 'signup'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')

      // Store token
      localStorage.setItem('codryn_token', data.token)
      navigate('/repositories')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Code2 size={22} className={styles.logoIcon} />
          <span>Codryn</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'signin'
            ? 'Sign in to your Codryn workspace'
            : 'Start understanding codebases with AI'}
        </p>

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label htmlFor="login-name" className={styles.label}>Name</label>
              <input
                id="login-name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="login-email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
                autoComplete="email"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className={styles.submitBtn}
            id="login-submit-btn"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
            <ArrowRight size={15} />
          </Button>
        </form>

        <p className={styles.switchMode}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            type="button"
            className={styles.switchBtn}
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
            id="login-switch-btn"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
