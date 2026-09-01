import { axiosClient } from '../../../shared/lib/axiosClient'
import type { CredencialesLogin, RespuestaLogin, Usuario } from '../types'

export async function iniciarSesion(credenciales: CredencialesLogin): Promise<RespuestaLogin> {
  const { data } = await axiosClient.post<RespuestaLogin>('/auth/login', credenciales)
  return data
}

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await axiosClient.get<Usuario>('/auth/me')
  return data
}
