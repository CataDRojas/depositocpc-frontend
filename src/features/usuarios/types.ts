import type { RolUsuario } from '../contenedores/types'

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: RolUsuario
  activo: boolean
}

export interface CrearUsuarioRequest {
  email: string
  nombre: string
  apellido: string
  rol: RolUsuario
}

export interface CrearUsuarioResponse {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: RolUsuario
  passwordGenerada: string
}