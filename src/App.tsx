import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { FormularioLogin } from './features/auth/components/FormularioLogin'
import { useAuth } from './features/auth/hooks/useAuth'
import { RutaProtegida } from './shared/components/RutaProtegida'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { FormularioIngreso } from './features/contenedores/components/FormularioIngreso'
import { PaginaUbicaciones } from './features/ubicaciones/PaginaUbicaciones'
import { PaginaUsuarios } from './features/usuarios/PaginaUsuarios'

function BarraNavegacion() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const alCerrarSesion = () => {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold tracking-tight">
          Depósito CPC
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {/* <Link to="/" className="text-slate-300 transition hover:text-white">
            Dashboard
          </Link>
          <Link to="/ingreso" className="text-slate-300 transition hover:text-white">
            Ingreso
          </Link> */}
          {usuario && (
            <Link to="/ubicaciones" className="text-slate-300 transition hover:text-white">
              Ubicaciones
            </Link>
          )}
          {usuario?.rol === 'ADMIN' && (
            <Link to="/usuarios" className="text-slate-300 transition hover:text-white">
              Usuarios
            </Link>
          )}
          {usuario && (
            <>
              <span className="hidden text-slate-400 sm:inline">{usuario.nombre} {usuario.apellido}</span>
              <button
                type="button"
                onClick={alCerrarSesion}
                className="rounded-lg bg-slate-700 px-3 py-1.5 font-medium transition hover:bg-slate-600"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <BarraNavegacion />
      <main className="px-4 py-8">
        <Routes>
          <Route path="/login" element={<FormularioLogin />} />
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ingreso" element={<FormularioIngreso />} />
            <Route path="/ubicaciones" element={<PaginaUbicaciones />} />
          </Route>
          <Route element={<RutaProtegida rolRequerido="ADMIN" />}>
            <Route path="/usuarios" element={<PaginaUsuarios />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
