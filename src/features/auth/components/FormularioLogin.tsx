import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { mensajeDeError } from '../../../shared/lib/axiosClient'

const esquemaLogin = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Formato de email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type CredencialesFormValues = z.infer<typeof esquemaLogin>

export function FormularioLogin() {
  const { token, iniciarSesion } = useAuth()
  const location = useLocation() as { state?: { desde?: { pathname: string } } }
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredencialesFormValues>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: '', password: '' },
  })

  if (token) {
    return <Navigate to={location.state?.desde?.pathname ?? '/'} replace />
  }

  const alEnviar = handleSubmit(async (valores) => {
    setErrorServidor(null)
    try {
      await iniciarSesion(valores)
    } catch (error) {
      setErrorServidor(mensajeDeError(error))
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">Depósito de Contenedores</h1>
        <p className="mt-1 text-sm text-slate-500">Inicia sesión para continuar</p>

        <form onSubmit={alEnviar} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.email ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="admin@cpc.cl"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.password ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {errorServidor && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {errorServidor}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-600 py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
