import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoUsuario, crearUsuario, listarUsuarios } from '../api/usuariosApi'
import type { CrearUsuarioRequest } from '../types'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
    staleTime: 30_000,
  })
}

export function useCrearUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearUsuarioRequest) => crearUsuario(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      cambiarEstadoUsuario(id, activo),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}