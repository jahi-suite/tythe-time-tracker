import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AuthUser } from '../api'

const AuthContext = createContext<{
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string, venueSlug?: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { auth } = await import('../api')
      const pathMatch = typeof window !== 'undefined' ? window.location.pathname.match(/^\/([^/]+)\/login\/?$/) : null
      const venueSlug = pathMatch?.[1] ?? undefined
      const u = await auth.me(venueSlug)
      // Reject incomplete users client-side: force logout if both identifiers empty
      if (u && !(u.display_name?.trim() || u.username?.trim())) {
        await auth.logout()
        setUser(null)
        return
      }
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (username: string, password: string, venueSlug?: string) => {
    const { auth } = await import('../api')
    const u = await auth.login(username, password, venueSlug)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    const { auth } = await import('../api')
    await auth.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
