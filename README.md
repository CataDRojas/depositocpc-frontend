# Contenedores Frontend

Frontend del sistema de gestión de contenedores marítimos en depósito.
React 19 + TypeScript + Vite + Tailwind CSS v4 + React Query + React Hook Form + Zod.

## Requisitos

- Node.js 20+
- Backend corriendo en `http://localhost:8080` (ver repo `contenedores-backend`)

## Cómo correr

```bash
npm install
npm run dev
```

Abrir http://localhost:5173. La variable `VITE_API_URL` se configura en `.env.local`
(ver `.env.example`). Para desarrollo local apunta a `http://localhost:8080/api`.

## Usuario de desarrollo

- Email: `admin@empresa.cl`
- Contraseña: `Admin123!` (solo para desarrollo local; viene de la migración seed V2 del backend)

## Estructura

```
src/
├── features/
│   ├── auth/            # login, contexto de autenticación, cliente de API auth
│   ├── contenedores/    # formulario de ingreso, tabla, validaciones ISO 6346 (Zod)
│   └── dashboard/       # vista principal con badge de alerta (+5 días)
├── shared/
│   ├── components/      # RutaProtegida
│   └── lib/             # axiosClient (interceptores JWT y errores)
└── styles/              # Tailwind CSS
```

## Notas

- El token JWT se guarda en `localStorage`; un 401 del backend cierra sesión automáticamente.
- La validación ISO 6346 está duplicada: feedback inmediato aquí, autoridad final en el backend.
