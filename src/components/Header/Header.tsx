import { useState } from 'react'
import { useAuth } from '../../context/AuthContext/useAuth'
import '../../css/Header/Header.css'

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19c.7-3.2 3-5 6.5-5s5.8 1.8 6.5 5" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 4h2l1.5 10.5h10.8L20 7H6.1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  )
}

function ShopHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    setLogoutError('')

    try {
      await logout()
      window.location.assign('/')
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to log out.')
    }
  }

  return (
    <header className="home-header">
      <a className="home-brand" href="/" aria-label="Shoply home">
        Shoply
      </a>

      <nav className="shop-header-nav" aria-label="Main navigation">
        {!isLoading && isAuthenticated ? (
          <>
            <div className="profile-menu">
              <button className="profile-trigger" type="button" aria-label="Open profile menu">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="profile-avatar" />
                ) : (
                  <ProfileIcon />
                )}
              </button>
              <span className="profile-name">{user?.name}</span>
              <div className="profile-dropdown">
                <a href="/account/profile">My Account</a>
                <a href="/purchases">My Purchases</a>
                <button type="button" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </div>
            <a className="cart-link" href="/cart" aria-label="Cart">
              <CartIcon />
              <span>Cart</span>
            </a>
            {logoutError && (
              <span className="header-error" role="alert">
                {logoutError}
              </span>
            )}
          </>
        ) : (
          <>
            <a href="/login">Log in</a>
            <a className="home-signup" href="/signup">
              Sign up
            </a>
          </>
        )}
      </nav>
    </header>
  )
}

export default ShopHeader
