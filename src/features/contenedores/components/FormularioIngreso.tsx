import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import {
  esquemaContenedor,
  TIPOS_CONTENEDOR,
  TAMANOS_CONTENEDOR,
  CONDICIONES,
  ETIQUETAS_TIPO,
  ETIQUETAS_TAMANO,
  esNumeroContenedorValido,
} from '../validaciones'
import type { ContenedorFormValues } from '../validaciones'
import { useIngresarContenedor } from '../hooks/useContenedores'
import { useBloques, useBahias, useFilas } from '../hooks/useUbicaciones'
import { listarUbicaciones } from '../api/ubicacionesApi'
import { mensajeDeError } from '../../../shared/lib/axiosClient'
import type { Condicion, TamanoContenedor, TipoContenedor } from '../types'
import { axiosClient } from '../../../shared/lib/axiosClient'
import type { NivelActual } from '../types'

function ahoraLocal(): string {
  const ahora = new Date()
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset())
  return ahora.toISOString().slice(0, 16)
}

const valoresIniciales: ContenedorFormValues = {
  numeroContenedor: '',
  tipo: 'DRY',
  tamano: 'VEINTE',
  reeferConectado: null,
  condicion: 'LLENO',
  bloque: '',
  bahia: '',
  fila: '',
  ubicacionId: '',
  fechaIngreso: ahoraLocal(),
}

export function FormularioIngreso() {
  const { data: bloques, isLoading: cargandoBloques } = useBloques()
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [nivelInfo, setNivelInfo] = useState<NivelActual | null>(null)

  const ingresar = useIngresarContenedor()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContenedorFormValues>({
    resolver: zodResolver(esquemaContenedor),
    defaultValues: valoresIniciales,
  })

  const bloqueSeleccionado = watch('bloque')
  const bahiaSeleccionada = watch('bahia')
  const filaSeleccionada = watch('fila')
  const tipo = watch('tipo')
  const numero = watch('numeroContenedor')

  const { data: bahias, isLoading: cargandoBahias } = useBahias(bloqueSeleccionado || null)
  const { data: filas, isLoading: cargandoFilas } = useFilas(bloqueSeleccionado || null, bahiaSeleccionada || null)

  // Consultar nivel actual cuando se selecciona fila
  useEffect(() => {
    if (!bloqueSeleccionado || !bahiaSeleccionada || !filaSeleccionada) {
      setNivelInfo(null)
      setValue('ubicacionId', '')
      return
    }

    const controller = new AbortController()
    async function cargarNivel() {
      try {
        const { data } = await axiosClient.get<NivelActual>('/ubicaciones/nivel-actual', {
          params: { bloque: bloqueSeleccionado, bahia: bahiaSeleccionada, fila: filaSeleccionada },
          signal: controller.signal,
        })
        setNivelInfo(data)
        // Buscar el ID de la ubicación
        const ubicaciones = await listarUbicaciones()
        const ubicacion = ubicaciones.find(
          u => u.bloque === bloqueSeleccionado && u.bahia === bahiaSeleccionada && u.fila === filaSeleccionada
        )
        if (ubicacion) setValue('ubicacionId', ubicacion.id)
      } catch {
        if (!controller.signal.aborted) setNivelInfo(null)
      }
    }
    cargarNivel()
    return () => controller.abort()
  }, [bloqueSeleccionado, bahiaSeleccionada, filaSeleccionada, setValue])

  // Resetear bahía y fila cuando cambia el bloque
  useEffect(() => {
    setValue('bahia', '')
    setValue('fila', '')
    setNivelInfo(null)
    setValue('ubicacionId', '')
  }, [bloqueSeleccionado, setValue])

  // Resetear fila cuando cambia la bahía
  useEffect(() => {
    setValue('fila', '')
    setNivelInfo(null)
    setValue('ubicacionId', '')
  }, [bahiaSeleccionada, setValue])

  useEffect(() => {
    if (!mensajeExito) return
    const temporizador = setTimeout(() => setMensajeExito(null), 4000)
    return () => clearTimeout(temporizador)
  }, [mensajeExito])

  const esReefer = tipo === 'REEFER'
  const checksumOk =
    numero.length === 11 && /^[A-Z]{4}[0-9]{7}$/.test(numero.toUpperCase())
      ? esNumeroContenedorValido(numero)
      : null

  const alEnviar = handleSubmit((valores) => {
    setMensajeExito(null)
    ingresar.mutate(
      {
        numeroContenedor: valores.numeroContenedor.trim().toUpperCase(),
        tipo: valores.tipo as TipoContenedor,
        tamano: valores.tamano as TamanoContenedor,
        reeferConectado: valores.tipo === 'REEFER' ? Boolean(valores.reeferConectado) : null,
        condicion: valores.condicion as Condicion,
        ubicacionId: valores.ubicacionId,
        fechaIngreso: new Date(valores.fechaIngreso).toISOString(),
      },
      {
        onSuccess: (contenedor) => {
          reset(valoresIniciales)
          setNivelInfo(null)
          setMensajeExito(`Contenedor ${contenedor.numeroContenedor} ingresado en nivel ${contenedor.nivel}`)
        },
      },
    )
  })

  const claseInput = (conError?: boolean) =>
    `mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 ${
      conError ? 'border-red-400' : 'border-slate-300'
    }`

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Registrar ingreso</h1>
        <Link to="/" className="text-sm font-medium text-sky-600 hover:text-sky-800">
          Volver al dashboard
        </Link>
      </div>

      <form
        onSubmit={alEnviar}
        className="mt-4 space-y-5 rounded-2xl bg-white p-6 shadow-lg"
        noValidate
      >
        <div>
          <label htmlFor="numeroContenedor" className="block text-sm font-medium text-slate-700">
            Número de contenedor (ISO 6346)
          </label>
          <input
            id="numeroContenedor"
            type="text"
            maxLength={11}
            className={claseInput(errors.numeroContenedor?.message != null)}
            placeholder="ABCU1234567"
            {...register('numeroContenedor')}
          />
          {checksumOk !== null && !errors.numeroContenedor && (
            <p className={`mt-1 text-xs font-medium ${checksumOk ? 'text-green-600' : 'text-red-600'}`}>
              {checksumOk ? 'Dígito verificador correcto' : 'Dígito verificador inválido'}
            </p>
          )}
          {errors.numeroContenedor?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.numeroContenedor.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-slate-700">Tipo</label>
            <select id="tipo" className={claseInput()} {...register('tipo')}>
              {TIPOS_CONTENEDOR.map((t) => (
                <option key={t} value={t}>{ETIQUETAS_TIPO[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tamano" className="block text-sm font-medium text-slate-700">Tamaño</label>
            <select id="tamano" className={claseInput()} {...register('tamano')}>
              {TAMANOS_CONTENEDOR.map((t) => (
                <option key={t} value={t}>{ETIQUETAS_TAMANO[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condicion" className="block text-sm font-medium text-slate-700">Condición</label>
            <select id="condicion" className={claseInput()} {...register('condicion')}>
              {CONDICIONES.map((c) => (
                <option key={c} value={c}>{c === 'LLENO' ? 'Lleno' : 'Vacío'}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fechaIngreso" className="block text-sm font-medium text-slate-700">Fecha y hora de ingreso</label>
            <input id="fechaIngreso" type="datetime-local" className={claseInput(errors.fechaIngreso?.message != null)} {...register('fechaIngreso')} />
            {errors.fechaIngreso?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaIngreso.message}</p>
            )}
          </div>
        </div>

        {/* Selectores en cascada: Bloque → Bahía → Fila → Nivel */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Ubicación en el patio</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="bloque" className="block text-sm font-medium text-slate-700">Bloque</label>
              <select id="bloque" className={claseInput(errors.bloque?.message != null)} disabled={cargandoBloques} {...register('bloque')}>
                <option value="">Selecciona…</option>
                {bloques?.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.bloque?.message && <p className="mt-1 text-sm text-red-600">{errors.bloque.message}</p>}
            </div>

            <div>
              <label htmlFor="bahia" className="block text-sm font-medium text-slate-700">Bahía</label>
              <select id="bahia" className={claseInput(errors.bahia?.message != null)} disabled={!bloqueSeleccionado || cargandoBahias} {...register('bahia')}>
                <option value="">Selecciona…</option>
                {bahias?.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.bahia?.message && <p className="mt-1 text-sm text-red-600">{errors.bahia.message}</p>}
            </div>

            <div>
              <label htmlFor="fila" className="block text-sm font-medium text-slate-700">Fila</label>
              <select id="fila" className={claseInput(errors.fila?.message != null)} disabled={!bahiaSeleccionada || cargandoFilas} {...register('fila')}>
                <option value="">Selecciona…</option>
                {filas?.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.fila?.message && <p className="mt-1 text-sm text-red-600">{errors.fila.message}</p>}
            </div>
          </div>

          {/* Nivel auto-asignado */}
          {nivelInfo && (
            <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
              nivelInfo.llena
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {nivelInfo.llena ? (
                <>Posición llena — no se pueden apilar más contenedores aquí</>
              ) : (
                <>Nivel asignado: <span className="text-lg font-bold">{nivelInfo.siguienteNivel}</span>
                {' '}(hay {nivelInfo.nivelActual} contenedor{nivelInfo.nivelActual !== 1 ? 'es' : ''} apilado{nivelInfo.nivelActual !== 1 ? 's' : ''})</>
              )}
            </div>
          )}
        </div>

        <div>
          <label className={`flex items-center gap-2 ${esReefer ? '' : 'opacity-50'}`}>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              disabled={!esReefer}
              checked={esReefer && watch('reeferConectado') === true}
              onChange={(e) => setValue('reeferConectado', e.target.checked ? true : false, { shouldValidate: true })}
            />
            <span className="text-sm font-medium text-slate-700">Reefer conectado</span>
          </label>
          {!esReefer && <p className="mt-1 text-xs text-slate-400">Solo aplica a contenedores tipo Reefer</p>}
          {errors.reeferConectado?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.reeferConectado.message as string}</p>
          )}
        </div>

        {ingresar.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {mensajeDeError(ingresar.error)}
          </div>
        )}

        {mensajeExito && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {mensajeExito}
          </div>
        )}

        <button
          type="submit"
          disabled={ingresar.isPending || nivelInfo?.llena === true}
          className="w-full rounded-lg bg-sky-600 py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ingresar.isPending ? 'Registrando…' : 'Registrar ingreso'}
        </button>
      </form>
    </div>
  )
}
