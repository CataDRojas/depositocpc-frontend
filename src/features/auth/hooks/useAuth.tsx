import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { iniciarSesion as iniciarSesionApi, obtenerPerfil as obtenerPerfilApi } from '../api/authApi'
import type { CredencialesLogin, Usuario } from '../types'
import { CLAVE_TOKEN, CLAVE_USUARIO } from '../../../shared/lib/axiosClient'

interface ContextoAuth {
  usuario: Usuario | null
  token: string | null
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>
  cerrarSesion: () => void
}

const AuthContext = createContext<ContextoAuth | null>(null)

function leerUsuarioGuardado(): Usuario | null {
  const guardado = localStorage.getItem(CLAVE_USUARIO)
  if (!guardado) return null
  try {
    return JSON.parse(guardado) as Usuario
  } catch {
    return null
  }
}

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(CLAVE_TOKEN))
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado)

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const respuesta = await iniciarSesionApi(credenciales)
    localStorage.setItem(CLAVE_TOKEN, respuesta.accessToken)
    setToken(respuesta.accessToken)

    // El login devuelve email y rol; el perfil completo (con id) viene de /auth/me
    const perfil = await obtenerPerfilApi()
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(perfil))
    setUsuario(perfil)
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setToken(null)
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({ token, usuario, iniciarSesion, cerrarSesion }),
    [token, usuario, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un <ProveedorAuth>')
  }
  return contexto
}
