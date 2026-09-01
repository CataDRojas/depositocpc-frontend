export type TipoContenedor = 'DRY' | 'REEFER' | 'OPEN_TOP' | 'TANKTAINER' | 'FLAT_RACK'
export type TamanoContenedor = 'VEINTE' | 'CUARENTA' | 'CUARENTA_CINCO'
export type Condicion = 'LLENO' | 'VACIO'
export type EstadoContenedor = 'EN_DEPOSITO' | 'DESPACHADO'
export type RolUsuario = 'OPERADOR' | 'ADMIN'

export interface Ubicacion {
  id: string
  bloque: string
  bahia: string
  fila: string
}

export interface Contenedor {
  id: string
  numeroContenedor: string
  tipo: TipoContenedor
  tamano: TamanoContenedor
  reeferConectado: boolean | null
  condicion: Condicion
  estado: EstadoContenedor
  nivel: number
  fechaIngreso: string
  ubicacion: Ubicacion
  diasEnDeposito: number
  enAlerta: boolean
}

export interface ContenedorIngresoPayload {
  numeroContenedor: string
  tipo: TipoContenedor
  tamano: TamanoContenedor
  reeferConectado?: boolean | null
  condicion: Condicion
  ubicacionId: string
  fechaIngreso?: string
}

export interface ContenedorActualizacionPayload {
  tipo?: TipoContenedor
  tamano?: TamanoContenedor
  reeferConectado?: boolean | null
  condicion?: Condicion
  ubicacionId?: string
}

export interface Pagina<T> {
  contenido: T[]
  pagina: number
  tamano: number
  totalElementos: number
  totalPaginas: number
  ultima: boolean
}

export interface NivelActual {
  bloque: string
  bahia: string
  fila: string
  nivelActual: number
  siguienteNivel: number
  llena: boolean
}

export interface SugerenciaReubicacion {
  ubicacionId: string
  bloque: string
  bahia: string
  fila: string
  capacidadRestante: number
}
