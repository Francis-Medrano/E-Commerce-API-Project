import LoginPage from './pages/LoginPage/LoginPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'
import HomePage from './pages/HomePage/HomePage'
import ProductPage from './pages/ProductPage/ProductPage'
import CartPage from './pages/CartPage/CartPage'

function App() {
  const isSignUpPage = window.location.pathname === '/signup'
  const isLoginPage = window.location.pathname === '/login'
  const isProductPage = window.location.pathname.startsWith('/product/')
  const isCartPage = window.location.pathname === '/cart'

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

  return <HomePage />
}

export default App
