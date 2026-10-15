import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext/useAuth'
import '../../css/SignUpPage/SignUpPage.css'

function SignUpPage() {
  const { signUp } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setConfirmationMessage('')
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '')
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const { needsEmailConfirmation } = await signUp(name, email, password)

      if (needsEmailConfirmation) {
        setConfirmationMessage('Check your email to confirm your account before logging in.')
      } else {
        window.location.assign('/')
      }
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : 'Unable to create your account.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <div className="auth-header">
          <a className="brand" href="/login" aria-label="Shoply home">
            Shoply
          </a>
          <span className="auth-eyebrow">Get started</span>
          <h1 id="signup-title">Create your account</h1>
          <p>Join Shoply and make your next purchase your easiest one.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your Name"
            required
          />

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={8}
            required
          />

          <label htmlFor="signup-confirm-password">Confirm password</label>
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            minLength={8}
            required
          />

          <label className="checkbox-label">
            <input name="terms" type="checkbox" required />
            I agree to the <a href="#terms">terms and conditions</a>
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {confirmationMessage && (
            <p className="auth-success" role="status">
              {confirmationMessage}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </section>
    </main>
  )
}

export default SignUpPage
