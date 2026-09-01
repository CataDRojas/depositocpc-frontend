import { z } from 'zod'
import type { Condicion, TamanoContenedor, TipoContenedor } from './types'

const VALORES_LETRAS: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17,
  H: 18, I: 19, J: 20, K: 21, L: 23, M: 24, N: 25,
  O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31, U: 32,
  V: 34, W: 35, X: 36, Y: 37, Z: 38,
}

const PATRON_ISO_6346 = /^[A-Z]{4}[0-9]{7}$/

export function esNumeroContenedorValido(numeroContenedor: string): boolean {
  const numero = numeroContenedor.trim().toUpperCase()
  if (!PATRON_ISO_6346.test(numero)) return false

  let suma = 0
  for (let posicion = 0; posicion < 10; posicion++) {
    const caracter = numero[posicion]
    const valor = posicion < 4 ? VALORES_LETRAS[caracter] : Number(caracter)
    suma += valor * 2 ** posicion
  }

  const resto = suma % 11
  const digitoEsperado = resto === 10 ? 0 : resto
  return digitoEsperado === Number(numero[10])
}

export const esquemaContenedor = z
  .object({
    numeroContenedor: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, 'El número de contenedor es obligatorio')
      .regex(/^[A-Z]{4}[0-9]{7}$/, 'Formato inválido: 4 letras mayúsculas + 7 dígitos')
      .refine(esNumeroContenedorValido, {
        message: 'El dígito verificador ISO 6346 no es válido',
      }),
    tipo: z.enum(['DRY', 'REEFER', 'OPEN_TOP', 'TANKTAINER', 'FLAT_RACK']),
    tamano: z.enum(['VEINTE', 'CUARENTA', 'CUARENTA_CINCO']),
    reeferConectado: z.boolean().nullish(),
    condicion: z.enum(['LLENO', 'VACIO']),
    bloque: z.string().min(1, 'Selecciona un bloque'),
    bahia: z.string().min(1, 'Selecciona una bahía'),
    fila: z.string().min(1, 'Selecciona una fila'),
    ubicacionId: z.string().min(1, 'Selecciona una ubicación'),
    fechaIngreso: z.string().min(1, 'La fecha de ingreso es obligatoria'),
  })
  .superRefine((valores, ctx) => {
    if (valores.tipo === 'REEFER' && valores.reeferConectado == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['reeferConectado'],
        message: 'Indica si el reefer está conectado',
      })
    }
  })

export type ContenedorFormValues = z.infer<typeof esquemaContenedor>

export const TIPOS_CONTENEDOR: readonly TipoContenedor[] = [
  'DRY',
  'REEFER',
  'OPEN_TOP',
  'TANKTAINER',
  'FLAT_RACK',
] as const

export const TAMANOS_CONTENEDOR: readonly TamanoContenedor[] = [
  'VEINTE',
  'CUARENTA',
  'CUARENTA_CINCO',
] as const

export const CONDICIONES: readonly Condicion[] = ['LLENO', 'VACIO'] as const

export const ETIQUETAS_TIPO: Record<TipoContenedor, string> = {
  DRY: 'Dry',
  REEFER: 'Reefer',
  OPEN_TOP: 'Open Top',
  TANKTAINER: 'Tanktainer',
  'FLAT_RACK': 'Flat Rack',
}

export const ETIQUETAS_TAMANO: Record<TamanoContenedor, string> = {
  VEINTE: '20 pies',
  CUARENTA: '40 pies',
  CUARENTA_CINCO: '45 pies',
}
