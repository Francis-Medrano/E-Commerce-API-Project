import { useState, type ReactNode } from 'react'
import { AuthContext, type AuthUser } from './authContext'

type StoredAccount = AuthUser & {
  password: string
}

const accountsStorageKey = 'shoply-accounts'
const userStorageKey = 'shoply-user'

function readStoredAccounts(): StoredAccount[] {
  const accounts = localStorage.getItem(accountsStorageKey)
  return accounts ? (JSON.parse(accounts) as StoredAccount[]) : []
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(userStorageKey)
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null
  })

  const saveUser = (nextUser: AuthUser) => {
    setUser(nextUser)
    localStorage.setItem(userStorageKey, JSON.stringify(nextUser))
  }

  const login = (email: string, password: string) => {
    const account = readStoredAccounts().find(
      (storedAccount) => storedAccount.email === email.trim().toLowerCase(),
    )

    if (!account || account.password !== password) {
      throw new Error('Invalid email or password.')
    }

    saveUser({ name: account.name, email: account.email })
  }

  const signUp = (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const accounts = readStoredAccounts()

    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.')
    }

    const newAccount = { name: name.trim(), email: normalizedEmail, password }
    localStorage.setItem(accountsStorageKey, JSON.stringify([...accounts, newAccount]))
    saveUser({ name: newAccount.name, email: newAccount.email })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(userStorageKey)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, signUp, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
