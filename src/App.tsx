import LoginPage from './pages/LoginPage/LoginPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'

function App() {
  const isSignUpPage = window.location.pathname === '/signup'

  return isSignUpPage ? <SignUpPage /> : <LoginPage />
}

export default App
