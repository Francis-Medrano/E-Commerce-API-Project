import LoginPage from './pages/LoginPage/LoginPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'
import HomePage from './pages/HomePage/HomePage'
import ProductPage from './pages/ProductPage/ProductPage'

function App() {
  const isSignUpPage = window.location.pathname === '/signup'
  const isLoginPage = window.location.pathname === '/login'
  const isProductPage = window.location.pathname.startsWith('/product/')

  if (isSignUpPage) {
    return <SignUpPage />
  }

  if (isLoginPage) {
    return <LoginPage />
  }

  if (isProductPage) {
    return <ProductPage />
  }

  return <HomePage />
}

export default App
