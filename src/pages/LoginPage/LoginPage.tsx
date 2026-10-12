import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext/useAuth'
import '../../css/LoginPage/LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      login(email, password)
      window.location.assign('/')
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to log in.')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-header">
          <a className="brand" href="/login" aria-label="Shoply home">
            Shoply
          </a>
          <span className="auth-eyebrow">Welcome back</span>
          <h1 id="login-title">Log in to your account</h1>
          <p>Access your orders, saved items, and more.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <div className="label-row">
            <label htmlFor="login-password">Password</label>
            <a href="#forgot-password">Forgot password?</a>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          <label className="checkbox-label">
            <input name="remember" type="checkbox" />
            Remember me
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit">Log in</button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <a href="/signup">Create one</a>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
