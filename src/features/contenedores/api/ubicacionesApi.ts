import { axiosClient } from '../../../shared/lib/axiosClient'
import type { NivelActual, SugerenciaReubicacion, Ubicacion } from '../types'

export interface UbicacionRequest {
  bloque: string
  bahia: string
  fila: string
}

export async function listarUbicaciones(): Promise<Ubicacion[]> {
  const { data } = await axiosClient.get<Ubicacion[]>('/ubicaciones')
  return data
}

export async function crearUbicacion(payload: UbicacionRequest): Promise<Ubicacion> {
  const { data } = await axiosClient.post<Ubicacion>('/ubicaciones', payload)
  return data
}

export async function actualizarUbicacion(id: string, payload: UbicacionRequest): Promise<Ubicacion> {
  const { data } = await axiosClient.put<Ubicacion>(`/ubicaciones/${id}`, payload)
  return data
}

export async function eliminarUbicacion(id: string): Promise<void> {
  await axiosClient.delete(`/ubicaciones/${id}`)
}

export async function listarBloques(): Promise<string[]> {
  const { data } = await axiosClient.get<string[]>('/ubicaciones/bloques')
  return data
}

export async function listarBahias(bloque: string): Promise<string[]> {
  const { data } = await axiosClient.get<string[]>(`/ubicaciones/bloques/${bloque}/bahias`)
  return data
}

export async function listarFilas(bloque: string, bahia: string): Promise<string[]> {
  const { data } = await axiosClient.get<string[]>(`/ubicaciones/bloques/${bloque}/bahias/${bahia}/filas`)
  return data
}

export async function obtenerNivelActual(bloque: string, bahia: string, fila: string): Promise<NivelActual> {
  const { data } = await axiosClient.get<NivelActual>('/ubicaciones/nivel-actual', {
    params: { bloque, bahia, fila },
  })
  return data
}

export async function sugerirReubicacion(bloque: string, bahia: string, fila: string): Promise<SugerenciaReubicacion[]> {
  const { data } = await axiosClient.get<SugerenciaReubicacion[]>('/ubicaciones/sugerencias-reubicacion', {
    params: { bloque, bahia, fila },
  })
  return data
}
