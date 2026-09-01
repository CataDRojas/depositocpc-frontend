import { Link } from 'react-router-dom'
import { TablaContenedores } from '../contenedores/components/TablaContenedores'
import { useAlertas } from '../contenedores/hooks/useContenedores'

export function DashboardPage() {
  const alertas = useAlertas()
  const cantidadAlertas = alertas.data?.length ?? 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Panel de depósito</h1>
        <Link
          to="/ingreso"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          + Registrar ingreso
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">En alerta (5+ días)</p>
          <p className={`mt-1 text-3xl font-bold ${cantidadAlertas > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {alertas.isLoading ? '…' : cantidadAlertas}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow sm:col-span-2">
          <p className="text-sm text-slate-500">Estado del depósito</p>
          <p className="mt-1 text-sm text-slate-600">
            La tabla marca en rojo los contenedores que llevan 5 o más días sin despacho.
            Revisa la columna de días y coordina su salida.
          </p>
        </div>
      </div>

      <TablaContenedores />
    </div>
  )
}
