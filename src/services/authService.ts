import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { BASE_URL, SESSION_KEY, TOKEN_KEY } from "./api"
import type { AuthSession, Usuario } from "../types"

type LoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; error: string }

/**
 * Login via NextAuth credentials flow.
 * 1. Obtiene el CSRF token
 * 2. POST a /api/auth/callback/credentials
 * 3. Extrae el session-token de la cookie Set-Cookie
 * 4. GET /api/auth/session para obtener los datos del usuario
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    // 1. Obtener CSRF token
    const csrfRes = await axios.get(`${BASE_URL}/auth/csrf`)
    const csrfToken: string = csrfRes.data?.csrfToken
    if (!csrfToken) throw new Error("No se pudo obtener el token CSRF")

    // 2. Login con credentials
    const loginRes = await axios.post(
      `${BASE_URL}/auth/callback/credentials`,
      new URLSearchParams({ email, password, csrfToken, redirect: "false" }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        maxRedirects: 0,
        validateStatus: (s) => s < 400,
        withCredentials: false,
      }
    )

    // 3. Extraer session token de Set-Cookie
    const setCookieHeader = loginRes.headers["set-cookie"]
    let sessionToken: string | null = null

    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
      for (const cookie of cookies) {
        const match = cookie.match(/next-auth\.session-token=([^;]+)/)
        if (match) { sessionToken = match[1]; break }
        const secureMatch = cookie.match(/__Secure-next-auth\.session-token=([^;]+)/)
        if (secureMatch) { sessionToken = secureMatch[1]; break }
      }
    }

    if (!sessionToken) {
      return { ok: false, error: "Credenciales incorrectas" }
    }

    // 4. Obtener datos del usuario con el session token
    const sessionRes = await axios.get(`${BASE_URL}/auth/session`, {
      headers: { Cookie: `next-auth.session-token=${sessionToken}` },
    })

    const user = sessionRes.data?.user as Usuario | undefined
    if (!user?.id) {
      return { ok: false, error: "No se pudo obtener la sesión" }
    }

    const session: AuthSession = { token: sessionToken, usuario: user }

    // 5. Persistir en SecureStore
    await SecureStore.setItemAsync(TOKEN_KEY, sessionToken)
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))

    return { ok: true, session }
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error("[AUTH] Error login:", e)
    return { ok: false, error: e?.message ?? "Error al iniciar sesión" }
  }
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(SESSION_KEY)
}

export async function getStoredSession(): Promise<AuthSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}
