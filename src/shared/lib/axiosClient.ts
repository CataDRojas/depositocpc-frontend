import axios from 'axios'

export const CLAVE_TOKEN = 'contenedores_token'
export const CLAVE_USUARIO = 'contenedores_usuario'

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // Token inválido o expirado: cerrar sesión y volver al login
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem(CLAVE_TOKEN)
      localStorage.removeItem(CLAVE_USUARIO)
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

/**
 * Extrae un mensaje legible del formato de error del backend { codigo, mensaje, campo }.
 */
export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const datos = error.response?.data as { mensaje?: string } | undefined
    return datos?.mensaje ?? error.message
  }
  return 'Ocurrió un error inesperado'
}
