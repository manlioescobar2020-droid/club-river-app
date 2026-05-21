import React, { createContext, useContext, useEffect, useState } from "react"
import { getStoredSession, login as doLogin, logout as doLogout } from "../services/authService"
import type { AuthSession } from "../types"

type AuthContextValue = {
  session: AuthSession | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]   = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaurar sesión persistida al arrancar
  useEffect(() => {
    getStoredSession()
      .then((s) => setSession(s))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const result = await doLogin(email, password)
    if (result.ok) {
      setSession(result.session)
      return { ok: true }
    }
    return { ok: false, error: result.error }
  }

  async function logout() {
    await doLogout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
