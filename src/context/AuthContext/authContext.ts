import { createContext } from 'react'

export type AuthUser = {
  name: string
  email: string
}

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  signUp: (name: string, email: string, password: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
