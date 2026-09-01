import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarUbicacion,
  crearUbicacion,
  eliminarUbicacion,
  listarBahias,
  listarBloques,
  listarFilas,
  listarUbicaciones,
  type UbicacionRequest,
} from '../api/ubicacionesApi'

export function useUbicaciones() {
  return useQuery({
    queryKey: ['ubicaciones'],
    queryFn: listarUbicaciones,
    staleTime: 5 * 60_000,
  })
}

export function useBloques() {
  return useQuery({
    queryKey: ['ubicaciones', 'bloques'],
    queryFn: listarBloques,
    staleTime: 10 * 60_000,
  })
}

export function useBahias(bloque: string | null) {
  return useQuery({
    queryKey: ['ubicaciones', 'bahias', bloque],
    queryFn: () => listarBahias(bloque!),
    enabled: !!bloque,
    staleTime: 10 * 60_000,
  })
}

export function useFilas(bloque: string | null, bahia: string | null) {
  return useQuery({
    queryKey: ['ubicaciones', 'filas', bloque, bahia],
    queryFn: () => listarFilas(bloque!, bahia!),
    enabled: !!bloque && !!bahia,
    staleTime: 10 * 60_000,
  })
}

export function useCrearUbicacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UbicacionRequest) => crearUbicacion(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] })
    },
  })
}

export function useActualizarUbicacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UbicacionRequest }) =>
      actualizarUbicacion(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] })
    },
  })
}

export function useEliminarUbicacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eliminarUbicacion(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ubicaciones'] })
    },
  })
}
