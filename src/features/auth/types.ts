import type { RolUsuario } from '../contenedores/types'

export interface CredencialesLogin {
  email: string
  password: string
}

export interface RespuestaLogin {
  accessToken: string
  tokenType: string
  email: string
  rol: RolUsuario
}

export interface Usuario {
  id: string
  email: string
  rol: RolUsuario
}
