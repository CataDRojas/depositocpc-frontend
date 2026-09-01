import { axiosClient } from '../../../shared/lib/axiosClient'
import type {
  Contenedor,
  ContenedorActualizacionPayload,
  ContenedorIngresoPayload,
  Pagina,
} from '../types'

export interface FiltrosContenedores {
  estado?: string
  tipo?: string
  ubicacionId?: string
  bloque?: string
  bahia?: string
  fila?: string
  fechaDesde?: string
  fechaHasta?: string
  page?: number
  size?: number
}

export async function listarContenedores(filtros: FiltrosContenedores): Promise<Pagina<Contenedor>> {
  const { data } = await axiosClient.get<Pagina<Contenedor>>('/contenedores', { params: filtros })
  return data
}

export async function listarAlertas(): Promise<Contenedor[]> {
  const { data } = await axiosClient.get<Contenedor[]>('/contenedores/alertas')
  return data
}

export async function ingresarContenedor(payload: ContenedorIngresoPayload): Promise<Contenedor> {
  const { data } = await axiosClient.post<Contenedor>('/contenedores', payload)
  return data
}

export async function actualizarContenedor(
  id: string,
  payload: ContenedorActualizacionPayload,
): Promise<Contenedor> {
  const { data } = await axiosClient.patch<Contenedor>(`/contenedores/${id}`, payload)
  return data
}

export async function despacharContenedor(id: string): Promise<Contenedor> {
  const { data } = await axiosClient.post<Contenedor>(`/contenedores/${id}/despacho`)
  return data
}
