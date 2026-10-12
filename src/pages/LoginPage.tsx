import '../css/LoginPage.css'

function LoginPage() {
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

        <form className="auth-form">
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
