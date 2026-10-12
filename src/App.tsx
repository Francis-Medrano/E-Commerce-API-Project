import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

function App() {
  const isSignUpPage = window.location.pathname === '/signup'

  return isSignUpPage ? <SignUpPage /> : <LoginPage />
}

export default App
