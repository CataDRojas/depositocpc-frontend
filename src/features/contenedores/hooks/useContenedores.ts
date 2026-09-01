import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarContenedor,
  despacharContenedor,
  ingresarContenedor,
  listarAlertas,
  listarContenedores,
  type FiltrosContenedores,
} from '../api/contenedoresApi'
import type { ContenedorActualizacionPayload, ContenedorIngresoPayload } from '../types'

export function useContenedores(filtros: FiltrosContenedores) {
  return useQuery({
    queryKey: ['contenedores', filtros],
    queryFn: () => listarContenedores(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useAlertas() {
  return useQuery({
    queryKey: ['contenedores', 'alertas'],
    queryFn: listarAlertas,
    refetchInterval: 60_000,
  })
}

export function useIngresarContenedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ContenedorIngresoPayload) => ingresarContenedor(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contenedores'] })
    },
  })
}

export function useActualizarContenedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ContenedorActualizacionPayload }) =>
      actualizarContenedor(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contenedores'] })
    },
  })
}

export function useDespacharContenedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => despacharContenedor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contenedores'] })
    },
  })
}
