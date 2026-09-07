import { useState } from 'react'
import { useCambiarEstadoUsuario, useCrearUsuario, useUsuarios } from './hooks/useUsuarios'
import type { CrearUsuarioResponse } from './types'
import { mensajeDeError } from '../../shared/lib/axiosClient'

export function PaginaUsuarios() {
  const { data: usuarios, isLoading } = useUsuarios()
  const crear = useCrearUsuario()
  const cambiarEstado = useCambiarEstadoUsuario()

  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [passwordNueva, setPasswordNueva] = useState<CrearUsuarioResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const alCrear = (payload: { email: string; nombre: string; apellido: string; rol: 'OPERADOR' | 'ADMIN' }) => {
    setError(null)
    crear.mutate(payload, {
      onSuccess: (respuesta) => {
        setFormularioAbierto(false)
        setPasswordNueva(respuesta)
      },
      onError: (err) => setError(mensajeDeError(err)),
    })
  }

  const alCambiarEstado = (id: string, activoActual: boolean) => {
    cambiarEstado.mutate(
      { id, activo: !activoActual },
      { onError: (err) => setError(mensajeDeError(err)) },
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setFormularioAbierto(true)
          }}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          + Nuevo usuario
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
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Cargando usuarios…
                </td>
              </tr>
            )}
            {!isLoading && (usuarios ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
            {(usuarios ?? []).map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-semibold">{u.nombre} {u.apellido}</td>
                <td className="px-4 py-2 text-slate-600">{u.email}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    u.rol === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${u.activo ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="ml-1.5 text-xs text-slate-500">{u.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => alCambiarEstado(u.id, u.activo)}
                    disabled={cambiarEstado.isPending}
                    className={`rounded-lg border px-2 py-1 text-xs font-medium transition disabled:opacity-50 ${
                      u.activo
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formularioAbierto && (
        <FormularioCrearUsuario
          onCancelar={() => setFormularioAbierto(false)}
          onCreate={alCrear}
          creando={crear.isPending}
        />
      )}

      {passwordNueva && (
        <ModalPasswordGenerada
          usuario={passwordNueva}
          onCerrar={() => setPasswordNueva(null)}
        />
      )}
    </div>
  )
}

interface PropsFormulario {
  onCancelar: () => void
  onCreate: (payload: { email: string; nombre: string; apellido: string; rol: 'OPERADOR' | 'ADMIN' }) => void
  creando: boolean
}

function FormularioCrearUsuario({ onCancelar, onCreate, creando }: PropsFormulario) {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [rol, setRol] = useState<'OPERADOR' | 'ADMIN'>('OPERADOR')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  const alEnviar = () => {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailValido) {
      setErrorLocal('Ingresa un email válido')
      return
    }
    if (!nombre.trim() || !apellido.trim()) {
      setErrorLocal('Nombre y apellido son obligatorios')
      return
    }
    setErrorLocal(null)
    onCreate({ email: email.trim(), nombre: nombre.trim(), apellido: apellido.trim(), rol })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">Nuevo usuario</h2>
        <p className="mt-1 text-sm text-slate-500">
          Al guardar se generará una contraseña automáticamente.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="usuario-email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="usuario-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="nuevo.usuario@empresa.cl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="usuario-nombre" className="block text-sm font-medium text-slate-700">Nombre</label>
              <input
                id="usuario-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="María"
              />
            </div>
            <div>
              <label htmlFor="usuario-apellido" className="block text-sm font-medium text-slate-700">Apellido</label>
              <input
                id="usuario-apellido"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="García"
              />
            </div>
          </div>
          <div>
            <label htmlFor="usuario-rol" className="block text-sm font-medium text-slate-700">Rol</label>
            <select
              id="usuario-rol"
              value={rol}
              onChange={(e) => setRol(e.target.value as 'OPERADOR' | 'ADMIN')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="OPERADOR">OPERADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          {errorLocal && (
            <p className="text-sm text-red-600">{errorLocal}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={alEnviar}
            disabled={creando}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {creando ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalPasswordGenerada({ usuario, onCerrar }: { usuario: CrearUsuarioResponse; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="text-green-600 text-3xl">✓</div>
        <h2 className="mt-2 text-lg font-bold text-slate-800">Usuario creado</h2>
        <p className="mt-1 text-sm text-slate-500">
          La contraseña de <span className="font-semibold text-slate-700">{usuario.nombre} {usuario.apellido}</span>
        </p>
        <p className="text-xs text-slate-400">se muestra solo una vez. Entrégala al usuario.</p>
        <div className="mt-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-3 font-mono text-lg tracking-widest text-slate-800">
          {usuario.passwordGenerada}
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}