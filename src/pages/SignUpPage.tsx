import '../css/SignUpPage.css'

function SignUpPage() {
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

        <form className="auth-form">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
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

          <button type="submit">Create account</button>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </section>
    </main>
  )
}

export default SignUpPage
