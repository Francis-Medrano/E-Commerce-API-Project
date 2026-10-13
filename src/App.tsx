import LoginPage from './pages/LoginPage/LoginPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'
import HomePage from './pages/HomePage/HomePage'

function App() {
  const isSignUpPage = window.location.pathname === '/signup'
  const isLoginPage = window.location.pathname === '/login'

  if (isSignUpPage) {
    return <SignUpPage />
  }

  if (isLoginPage) {
    return <LoginPage />
  }

  return <HomePage />
}

export default App
