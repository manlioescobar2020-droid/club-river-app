import axios from "axios"
import * as SecureStore from "expo-secure-store"

export const BASE_URL = "https://sistema-club-deportivo.vercel.app/api"

export const TOKEN_KEY = "club_river_token"
export const SESSION_KEY = "club_river_session"

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
})

// Inyectar token en cada request si existe
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
    config.headers["Cookie"] = `next-auth.session-token=${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message =
      error?.response?.data?.error ??
      error?.response?.data?.message ??
      error?.message ??
      "Error de red"
    return Promise.reject({ status, message, raw: error })
  }
)
