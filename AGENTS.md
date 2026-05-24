# UniService — Agent Guide

## Architecture

Full-stack app: **React 18 + Vite** frontend → **.NET 8 API** (ASP.NET Core) → **SQL Server 2025** (Docker) or **Supabase PostgreSQL** (production).

```
Proyecto/
├── frontend/              # React + Vite SPA (port 5173)
├── UniserviceAPI/         # .NET 8 API (port 5165)
├── database/              # SQL migration files (numbered 01, 02, ...)
├── docker-compose.yml     # SQL Server container + auto-imports ./database/*.sql
└── package.json           # Root scripts: npm run dev
```

## Commands

| Task | Command | Notes |
|------|---------|-------|
| Start everything | `npm run dev` (root) | Starts Docker DB (40s wait) + frontend. **Does NOT start the API** |
| Start frontend only | `cd frontend && npm run dev` | Proxies `/api`, `/imagenes-servicios`, `/chathub` → `localhost:5165` |
| Start API | Open `UniserviceAPI/UniserviceAPI.sln` in Visual Studio, press F5 | Or `dotnet run` in `UniserviceAPI/UniserviceAPI/` |
| Stop DB | `npm run stop` (root) | |
| Remove DB containers | `npm run clean` (root) | |
| Build frontend | `cd frontend && npm run build` | |

**API runs on port 5165.** Vite dev server proxies all `/api/*` requests there. No CORS issues in dev.

## Frontend Structure

- Entry: `frontend/src/main.jsx` → `App.jsx` (React Router)
- Routes: `/login`, `/home-guest`, `/home`, `/servicio`, `/perfil`, `/perfil/:id`, `/admin-dashboard`
- Pages: `frontend/src/Pages/` — organized by role: `Principal/`, `Guest/`, `Admin/`, `shared/`
- Shared constants: `frontend/src/Pages/shared/constantes.js` — pagination (8/page), categories, API endpoints, dynamic form configs
- Auth: JWT stored in `localStorage` as `token` + `usuarioId`
- Theme: dark/light via `data-theme` attribute on `<html>`, CSS in `styles/` + `styles/light_theme/`
- **No lint, no typecheck, no test framework configured.** Skip those steps.

## Backend Structure

- Framework: ASP.NET Core 8, controllers under `UniserviceAPI/UniserviceAPI/Controllers/`
- DB: Npgsql (PostgreSQL for Supabase) + EF Core 8
- Auth: JWT Bearer tokens, BCrypt for passwords, Google OAuth
- Email: MailKit via Gmail SMTP
- Storage: Supabase Storage bucket `imagenes-servicios`
- DTOs: `UniserviceAPI/UniserviceAPI/DTOs/`
- SignalR hub at `/chathub` for real-time chat

## Database

- Dev: SQL Server 2025 via Docker (`docker-compose up`). Auto-imports `database/*.sql` on first run.
- Production: Supabase PostgreSQL (connection string in `.env`).
- Migration files are numbered: `01_...`, `02_...`, etc. Run in order.
- Key tables: `usuarios`, `servicios`, `solicitudes`, `reportes`, `chat_mensajes`, `seguidores`
- `reportes` table has `id_usuario_reportado` column (added by `10_Migracion_Reportes_Usuarios.sql`). If running on existing DB, execute that migration file.

## Environment

- API needs `.env` in `UniserviceAPI/` (copy from `.env.example`). Key vars: `ConnectionStrings__DefaultConnection`, `Supabase__Url`, `Supabase__ServiceKey`, `Jwt__Key`, `Google__ClientId`, `EmailSettings__*`
- Frontend has hardcoded Google Client ID in `main.jsx` — not using env vars.
- Docker DB password: `Uniservicio58414555` (in `docker-compose.yml`)

## Conventions

- No TypeScript, no ESLint, no Prettier config — plain JS/JSX
- CSS: custom CSS files per page/component, no CSS-in-JS, no Tailwind
- Icons: Bootstrap Icons (`bi-*` classes)
- API calls: raw `fetch()`, no axios for app code (axios is a dep but unused)
- Date format: Spanish locale (`es-ES`, `es-CO`)
- Currency: COP (Colombian Pesos)
