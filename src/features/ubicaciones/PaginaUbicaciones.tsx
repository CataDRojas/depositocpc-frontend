import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUbicaciones, useCrearUbicacion, useActualizarUbicacion, useEliminarUbicacion } from '../contenedores/hooks/useUbicaciones'
import type { Ubicacion } from '../contenedores/types'

export function PaginaUbicaciones() {
  const { data: ubicaciones, isLoading } = useUbicaciones()
  const crear = useCrearUbicacion()
  const actualizar = useActualizarUbicacion()
  const eliminar = useEliminarUbicacion()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Ubicacion | null>(null)
  const [bloque, setBloque] = useState('')
  const [bahia, setBahia] = useState('')
  const [fila, setFila] = useState('')
  const [error, setError] = useState<string | null>(null)

  const abrirCrear = () => {
    setEditando(null)
    setBloque('')
    setBahia('')
    setFila('')
    setError(null)
    setModalAbierto(true)
  }

  const abrirEditar = (u: Ubicacion) => {
    setEditando(u)
    setBloque(u.bloque)
    setBahia(u.bahia)
    setFila(u.fila)
    setError(null)
    setModalAbierto(true)
  }

  const alGuardar = () => {
    setError(null)
    const payload = { bloque: bloque.trim().toUpperCase(), bahia: bahia.trim(), fila: fila.trim() }

    if (editando) {
      actualizar.mutate(
        { id: editando.id, payload },
        {
          onSuccess: () => setModalAbierto(false),
          onError: (err: Error) => setError((err as any).response?.data?.mensaje || 'Error al actualizar'),
        },
      )
    } else {
      crear.mutate(payload, {
        onSuccess: () => setModalAbierto(false),
        onError: (err: Error) => setError((err as any).response?.data?.mensaje || 'Error al crear'),
      })
    }
  }

  const alEliminar = (u: Ubicacion) => {
    if (window.confirm(`¿Eliminar posición ${u.bloque}-${u.bahia}-${u.fila}?`)) {
      eliminar.mutate(u.id, {
        onError: (err: Error) => setError((err as any).response?.data?.mensaje || 'No se puede eliminar: tiene contenedores apilados'),
      })
    }
  }

  const guardando = crear.isPending || actualizar.isPending

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            ← Volver al dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Ubicaciones del patio</h1>
        </div>
        <button
          type="button"
          onClick={abrirCrear}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          + Nueva ubicación
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-lg">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Bloque</th>
              <th className="px-4 py-3">Bahía</th>
              <th className="px-4 py-3">Fila</th>
              <th className="px-4 py-3">Posición</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Cargando ubicaciones…
                </td>
              </tr>
            )}
            {!isLoading && (ubicaciones ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay ubicaciones registradas
                </td>
              </tr>
            )}
            {(ubicaciones ?? []).map((u: Ubicacion) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-semibold">{u.bloque}</td>
                <td className="px-4 py-2">{u.bahia}</td>
                <td className="px-4 py-2">{u.fila}</td>
                <td className="px-4 py-2 font-mono text-slate-700">{u.bloque}-{u.bahia}-{u.fila}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEditar(u)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium transition hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => alEliminar(u)}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              {editando ? 'Editar ubicación' : 'Nueva ubicación'}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="bloque-input" className="block text-sm font-medium text-slate-700">Bloque</label>
                <input
                  id="bloque-input"
                  type="text"
                  maxLength={3}
                  value={bloque}
                  onChange={(e) => setBloque(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="A"
                />
              </div>
              <div>
                <label htmlFor="bahia-input" className="block text-sm font-medium text-slate-700">Bahía</label>
                <input
                  id="bahia-input"
                  type="text"
                  maxLength={10}
                  value={bahia}
                  onChange={(e) => setBahia(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="01"
                />
              </div>
              <div>
                <label htmlFor="fila-input" className="block text-sm font-medium text-slate-700">Fila</label>
                <input
                  id="fila-input"
                  type="number"
                  min={1}
                  value={fila}
                  onChange={(e) => setFila(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="1"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={alGuardar}
                disabled={guardando || !bloque.trim() || !bahia.trim() || !fila.trim()}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
