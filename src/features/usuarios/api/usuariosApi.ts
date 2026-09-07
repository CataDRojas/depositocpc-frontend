import { axiosClient } from '../../../shared/lib/axiosClient'
import type { CrearUsuarioRequest, CrearUsuarioResponse, Usuario } from '../types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await axiosClient.get<Usuario[]>('/usuarios')
  return data
}

export async function crearUsuario(payload: CrearUsuarioRequest): Promise<CrearUsuarioResponse> {
  const { data } = await axiosClient.post<CrearUsuarioResponse>('/usuarios', payload)
  return data
}

export async function cambiarEstadoUsuario(id: string, activo: boolean): Promise<Usuario> {
  const { data } = await axiosClient.patch<Usuario>(`/usuarios/${id}/estado`, null, {
    params: { activo },
  })
  return data
}