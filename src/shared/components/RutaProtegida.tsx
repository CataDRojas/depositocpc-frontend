import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import type { RolUsuario } from '../../features/contenedores/types'

interface PropsRutaProtegida {
  rolRequerido?: RolUsuario
}

/**
 * Protege las rutas privadas: si no hay token redirige a /login
 * conservando la ubicación original. Si la ruta exige un rol,
 * redirige al dashboard cuando el usuario no tiene permisos.
 */
export function RutaProtegida({ rolRequerido }: PropsRutaProtegida) {
  const { token, usuario } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ desde: location }} />
  }

  if (rolRequerido && usuario?.rol !== rolRequerido) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}