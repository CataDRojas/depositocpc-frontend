import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

/**
 * Protege las rutas privadas: si no hay token redirige a /login,
 * conservando la ubicación original para volver después del login.
 */
export function RutaProtegida() {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ desde: location }} />
  }

  return <Outlet />
}
