import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { AuthContext, type AuthUser } from './authContext'

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: String(user.user_metadata.full_name ?? user.email?.split('@')[0] ?? 'Shoply user'),
    email: user.email ?? '',
    phone: String(user.user_metadata.phone ?? ''),
    gender: String(user.user_metadata.gender ?? ''),
    birthDate: String(user.user_metadata.birth_date ?? ''),
    avatarUrl: String(user.user_metadata.avatar_url ?? ''),
  }
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw new Error(getAuthErrorMessage(error, 'Unable to load your session.'))
      }

      if (isMounted) {
        setUser(data.session?.user ? toAuthUser(data.session.user) : null)
        setIsLoading(false)
      }
    }

    void loadSession().catch((error: unknown) => {
      if (isMounted) {
        setIsLoading(false)
        console.error(error)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ? toAuthUser(session.user) : null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to log in.'))
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })

    if (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to create your account.'))
    }

    return { needsEmailConfirmation: data.session === null }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to log out.'))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
