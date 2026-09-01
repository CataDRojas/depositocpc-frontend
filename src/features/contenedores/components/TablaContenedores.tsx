import { useEffect, useState } from 'react'
import { useContenedores, useDespacharContenedor, useActualizarContenedor } from '../hooks/useContenedores'
import { useBloques, useBahias, useFilas, useUbicaciones } from '../hooks/useUbicaciones'
import { ETIQUETAS_TIPO, ETIQUETAS_TAMANO } from '../validaciones'
import axios from 'axios'
import { mensajeDeError, axiosClient } from '../../../shared/lib/axiosClient'
import type { Contenedor, EstadoContenedor, TipoContenedor, SugerenciaReubicacion } from '../types'

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

export function TablaContenedores() {
  const [estado, setEstado] = useState<EstadoContenedor | ''>('EN_DEPOSITO')
  const [tipo, setTipo] = useState<TipoContenedor | ''>('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [bloqueFiltro, setBloqueFiltro] = useState('')
  const [bahiaFiltro, setBahiaFiltro] = useState('')
  const [filaFiltro, setFilaFiltro] = useState('')
  const [paginaActual, setPaginaActual] = useState(0)

  const { data: bloques } = useBloques()
  const { data: bahias } = useBahias(bloqueFiltro || null)
  const { data: filas } = useFilas(bloqueFiltro || null, bahiaFiltro || null)

  // Modal detalle
  const [contenedorDetalle, setContenedorDetalle] = useState<Contenedor | null>(null)

  // Modal despacho bloqueado
  const [despachoBloqueado, setDespachoBloqueado] = useState<{ contenedor: Contenedor; mensaje: string; sugerencias: SugerenciaReubicacion[] } | null>(null)

  const consulta = useContenedores({
    estado: estado || undefined,
    tipo: tipo || undefined,
    bloque: bloqueFiltro || undefined,
    bahia: bahiaFiltro || undefined,
    fila: filaFiltro || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    page: paginaActual,
    size: 10,
  })
  const despachar = useDespacharContenedor()
  const actualizar = useActualizarContenedor()

  useEffect(() => { setBahiaFiltro(''); setFilaFiltro('') }, [bloqueFiltro])
  useEffect(() => { setFilaFiltro('') }, [bahiaFiltro])

  const cambiarFiltro = (cambio: () => void) => {
    cambio()
    setPaginaActual(0)
  }

  const alDespachar = (id: string, numero: string) => {
    if (!window.confirm(`¿Confirmas el despacho del contenedor ${numero}?`)) return
    despachar.mutate(id, {
      onError: async (error) => {
        const msg = mensajeDeError(error)
        if (axios.isAxiosError(error) && error.response?.data?.codigo === 'DESPACHO_BLOQUEADO') {
          const contenedor = (consulta.data?.contenido ?? []).find(c => c.id === id)
          if (contenedor) {
            try {
              const { data: sugerencias } = await axiosClient.get('/ubicaciones/sugerencias-reubicacion', {
                params: { bloque: contenedor.ubicacion.bloque, bahia: contenedor.ubicacion.bahia, fila: contenedor.ubicacion.fila },
              })
              setDespachoBloqueado({ contenedor, mensaje: msg, sugerencias })
            } catch {
              setDespachoBloqueado({ contenedor, mensaje: msg, sugerencias: [] })
            }
          }
        }
      },
    })
  }

  const contenedores = consulta.data?.contenido ?? []

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Contenedores en depósito</h2>
        <div className="flex gap-3">
          <select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) => cambiarFiltro(() => setEstado(e.target.value as EstadoContenedor | ''))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="EN_DEPOSITO">En depósito</option>
            <option value="">Todos</option>
            <option value="DESPACHADO">Despachados</option>
          </select>
          <select
            aria-label="Filtrar por tipo"
            value={tipo}
            onChange={(e) => cambiarFiltro(() => setTipo(e.target.value as TipoContenedor | ''))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos los tipos</option>
            {(Object.keys(ETIQUETAS_TIPO) as TipoContenedor[]).map((t) => (
              <option key={t} value={t}>
                {ETIQUETAS_TIPO[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Ubicación</span>
            <div>
              <label className="block text-xs text-slate-400">Bloque</label>
              <select value={bloqueFiltro} onChange={(e) => cambiarFiltro(() => setBloqueFiltro(e.target.value))} className="mt-0.5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                <option value="">Todos</option>
                {bloques?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400">Bahía</label>
              <select value={bahiaFiltro} onChange={(e) => cambiarFiltro(() => setBahiaFiltro(e.target.value))} disabled={!bloqueFiltro} className="mt-0.5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:opacity-50">
                <option value="">Todas</option>
                {bahias?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400">Fila</label>
              <select value={filaFiltro} onChange={(e) => cambiarFiltro(() => setFilaFiltro(e.target.value))} disabled={!bahiaFiltro} className="mt-0.5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:opacity-50">
                <option value="">Todas</option>
                {filas?.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-300" />

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Fecha ingreso</span>
            <div>
              <label className="block text-xs text-slate-400">Desde</label>
              <input type="date" value={fechaDesde} onChange={(e) => cambiarFiltro(() => setFechaDesde(e.target.value))} className="mt-0.5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400">Hasta</label>
              <input type="date" value={fechaHasta} onChange={(e) => cambiarFiltro(() => setFechaHasta(e.target.value))} className="mt-0.5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Número</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Tamaño</th>
              <th className="px-3 py-2">Condición</th>
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2">Nivel</th>
              <th className="px-3 py-2">Ingreso</th>
              <th className="px-3 py-2">Días</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {consulta.isLoading && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                  Cargando contenedores…
                </td>
              </tr>
            )}
            {!consulta.isLoading && contenedores.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                  No hay contenedores para mostrar
                </td>
              </tr>
            )}
            {contenedores.map((c) => (
              <tr
                key={c.id}
                className="cursor-pointer border-b border-slate-100 transition hover:bg-sky-50"
                onClick={() => setContenedorDetalle(c)}
              >
                <td className="px-3 py-2 font-mono font-semibold text-slate-800">
                  {c.numeroContenedor}
                </td>
                <td className="px-3 py-2">{ETIQUETAS_TIPO[c.tipo]}</td>
                <td className="px-3 py-2">{ETIQUETAS_TAMANO[c.tamano]}</td>
                <td className="px-3 py-2">{c.condicion === 'LLENO' ? 'Lleno' : 'Vacío'}</td>
                <td className="px-3 py-2 font-mono">
                  {c.ubicacion.bloque}-{c.ubicacion.bahia}-{c.ubicacion.fila}
                </td>
                <td className="px-3 py-2 font-bold text-center">{c.nivel}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatearFecha(c.fechaIngreso)}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    {c.diasEnDeposito}
                    {c.enAlerta && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        ALERTA +5 DÍAS
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.estado === 'EN_DEPOSITO'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c.estado === 'EN_DEPOSITO' ? 'En depósito' : 'Despachado'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                  {c.estado === 'EN_DEPOSITO' && (
                    <button
                      type="button"
                      onClick={() => alDespachar(c.id, c.numeroContenedor)}
                      disabled={despachar.isPending}
                      className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                    >
                      Despachar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {consulta.data && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            {consulta.data.totalElementos} contenedor(es) — página{' '}
            {consulta.data.pagina + 1} de {consulta.data.totalPaginas}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaginaActual((p) => Math.max(p - 1, 0))}
              disabled={consulta.data.pagina === 0}
              className="rounded-lg border border-slate-300 px-3 py-1 font-medium disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPaginaActual((p) => p + 1)}
              disabled={consulta.data.ultima}
              className="rounded-lg border border-slate-300 px-3 py-1 font-medium disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal detalle contenedor */}
      {contenedorDetalle && (
        <ModalDetalleContenedor
          contenedor={contenedorDetalle}
          onCerrar={() => setContenedorDetalle(null)}
          onGuardar={(payload) => {
            actualizar.mutate(
              { id: contenedorDetalle.id, payload },
              {
                onSuccess: (actualizado) => {
                  setContenedorDetalle(actualizado)
                },
              },
            )
          }}
          guardando={actualizar.isPending}
        />
      )}

      {/* Modal despacho bloqueado */}
      {despachoBloqueado && (
        <ModalDespachoBloqueado
          contenedor={despachoBloqueado.contenedor}
          mensaje={despachoBloqueado.mensaje}
          sugerencias={despachoBloqueado.sugerencias}
          onCerrar={() => setDespachoBloqueado(null)}
        />
      )}
    </section>
  )
}

/* ─── Modal Detalle Contenedor ─── */

function ModalDetalleContenedor({
  contenedor,
  onCerrar,
  onGuardar,
  guardando,
}: {
  contenedor: Contenedor
  onCerrar: () => void
  onGuardar: (payload: { ubicacionId?: string }) => void
  guardando: boolean
}) {
  const [exito, setExito] = useState(false)
  const [bloque, setBloque] = useState(contenedor.ubicacion.bloque)
  const [bahia, setBahia] = useState(contenedor.ubicacion.bahia)
  const [fila, setFila] = useState(contenedor.ubicacion.fila)
  const [ubicacionId, setUbicacionId] = useState(contenedor.ubicacion.id)

  const { data: bloques } = useBloques()
  const { data: bahias } = useBahias(bloque || null)
  const { data: filas } = useFilas(bloque || null, bahia || null)
  const { data: ubicaciones } = useUbicaciones()

  const ubicacionCompleta = !!bloque && !!bahia && !!fila
  const esMismaUbicacion =
    bloque === contenedor.ubicacion.bloque &&
    bahia === contenedor.ubicacion.bahia &&
    fila === contenedor.ubicacion.fila

  const [nivelInfo, setNivelInfo] = useState<{ nivelActual: number; siguienteNivel: number; llena: boolean } | null>(null)

  useEffect(() => {
    if (!ubicacionCompleta || esMismaUbicacion) {
      setNivelInfo(null)
      return
    }
    const controller = new AbortController()
    axiosClient
      .get('/ubicaciones/nivel-actual', {
        params: { bloque, bahia, fila },
        signal: controller.signal,
      })
      .then(({ data }) => setNivelInfo(data))
      .catch(() => { if (!controller.signal.aborted) setNivelInfo(null) })
    return () => controller.abort()
  }, [bloque, bahia, fila, ubicacionCompleta, esMismaUbicacion])

  useEffect(() => {
    if (!ubicaciones) return
    const u = ubicaciones.find(
      u => u.bloque === bloque && u.bahia === bahia && u.fila === fila
    )
    if (u) setUbicacionId(u.id)
  }, [bloque, bahia, fila, ubicaciones])

  useEffect(() => { setBahia('') }, [bloque])
  useEffect(() => { setFila('') }, [bahia])

  useEffect(() => {
    if (!exito) return
    const timer = setTimeout(() => onCerrar(), 2000)
    return () => clearTimeout(timer)
  }, [exito, onCerrar])

  const huboCambios = ubicacionId !== contenedor.ubicacion.id

  const alGuardar = () => {
    if (huboCambios) {
      setExito(true)
      onGuardar({ ubicacionId })
    }
  }

  const claseSelect = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCerrar}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Detalle del contenedor</h2>
          <button type="button" onClick={onCerrar} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-700">
          {contenedor.numeroContenedor}
          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold">{contenedor.estado === 'EN_DEPOSITO' ? 'En depósito' : 'Despachado'}</span>
        </div>

        {exito && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Contenedor actualizado correctamente
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo</label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{ETIQUETAS_TIPO[contenedor.tipo]}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tamaño</label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{ETIQUETAS_TAMANO[contenedor.tamano]}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Condición</label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{contenedor.condicion === 'LLENO' ? 'Lleno' : 'Vacío'}</div>
          </div>
          {contenedor.reeferConectado != null && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Reefer</label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{contenedor.reeferConectado ? 'Conectado' : 'Desconectado'}</div>
            </div>
          )}
        </div>

        {/* Ubicación en cascada */}
        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-700 mb-2">Ubicación</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500">Bloque</label>
              <select className={claseSelect} value={bloque} onChange={(e) => setBloque(e.target.value)}>
                <option value="">—</option>
                {bloques?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Bahía</label>
              <select className={claseSelect} value={bahia} onChange={(e) => setBahia(e.target.value)} disabled={!bloque}>
                <option value="">—</option>
                {bahias?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Fila</label>
              <select className={claseSelect} value={fila} onChange={(e) => setFila(e.target.value)} disabled={!bahia}>
                <option value="">—</option>
                {filas?.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {esMismaUbicacion ? (
            <p className="mt-2 text-xs text-slate-500">
              Ubicación actual · Nivel {contenedor.nivel}
            </p>
          ) : nivelInfo ? (
            <div className={`mt-2 rounded-md px-2 py-1 text-xs font-medium ${
              nivelInfo.llena
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {nivelInfo.llena
                ? 'Posición llena — no se puede apilar más'
                : <>Nivel asignado: <span className="font-bold">{nivelInfo.siguienteNivel}</span> (hay {nivelInfo.nivelActual} apilado{nivelInfo.nivelActual !== 1 ? 's' : ''})</>
              }
            </div>
          ) : ubicacionCompleta ? (
            <p className="mt-2 text-xs text-slate-400">Consultando nivel…</p>
          ) : (
            <p className="mt-2 text-xs text-slate-400">Selecciona bloque, bahía y fila para ver el nivel</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div><span className="text-slate-400">Ingreso:</span> {formatearFecha(contenedor.fechaIngreso)}</div>
          <div><span className="text-slate-400">Días en depósito:</span> {contenedor.diasEnDeposito}</div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCerrar} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50">
            Cerrar
          </button>
          <button
            type="button"
            onClick={alGuardar}
            disabled={guardando || !huboCambios || !ubicacionId || (nivelInfo?.llena === true)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal Despacho Bloqueado (LIFO) ─── */

function ModalDespachoBloqueado({
  contenedor,
  mensaje,
  sugerencias,
  onCerrar,
}: {
  contenedor: Contenedor
  mensaje: string
  sugerencias: SugerenciaReubicacion[]
  onCerrar: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCerrar}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl">!</span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Despacho bloqueado</h2>
            <p className="text-sm text-slate-500">LIFO — Last In, First Out</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {mensaje}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-700">Contenedor bloqueado</p>
          <p className="mt-1 font-mono text-sm text-slate-800">{contenedor.numeroContenedor}</p>
          <p className="text-xs text-slate-500">
            Posición {contenedor.ubicacion.bloque}-{contenedor.ubicacion.bahia}-{contenedor.ubicacion.fila} · Nivel {contenedor.nivel}
          </p>
        </div>

        {sugerencias.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Posiciones disponibles para reubicar</p>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
              {sugerencias.map((s) => (
                <div key={s.ubicacionId} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                  <span className="font-mono font-medium text-slate-800">{s.bloque}-{s.bahia}-{s.fila}</span>
                  <span className="text-xs text-slate-500">{s.capacidadRestante} libre{s.capacidadRestante !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
