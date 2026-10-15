import LoginPage from './pages/LoginPage/LoginPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'
import HomePage from './pages/HomePage/HomePage'
import ProductPage from './pages/ProductPage/ProductPage'
import CartPage from './pages/CartPage/CartPage'
import AccountPage from './pages/AccountPage/AccountPage'
import PurchasesPage from './pages/PurchasesPage/PurchasesPage'

function App() {
  const isSignUpPage = window.location.pathname === '/signup'
  const isLoginPage = window.location.pathname === '/login'
  const isProductPage = window.location.pathname.startsWith('/product/')
  const isCartPage = window.location.pathname === '/cart'
  const isAccountPage = window.location.pathname.startsWith('/account')
  const isPurchasesPage = window.location.pathname === '/purchases'

  if (isSignUpPage) {
    return <SignUpPage />
  }

  if (isLoginPage) {
    return <LoginPage />
  }

  if (isProductPage) {
    return <ProductPage />
  }

  if (isCartPage) {
    return <CartPage />
  }

  if (isAccountPage) {
    return <AccountPage />
  }

  if (isPurchasesPage) {
    return <PurchasesPage />
  }

  return <HomePage />
}

export default App
