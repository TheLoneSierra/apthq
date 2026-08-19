# Apt HQ — React Dashboard

Analytics dashboard for Apt HQ, built with React, TypeScript, Tailwind CSS, and TanStack Query.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Client API base URL. Leave empty in dev to use the Vite proxy. |
| `VITE_API_PROXY_TARGET` | Backend URL for the dev proxy (server-side only). |

In development, `/api` and `/health` are proxied to avoid CORS issues.

For production, deploy behind a reverse proxy that forwards `/api` and `/health` to the Lambda backend, and keep `VITE_API_BASE` empty (same-origin).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest unit tests |
| `npm run lint` | ESLint |

## Architecture

- **`src/hooks/useDashboardQueries.ts`** — TanStack Query per dashboard section
- **`src/context/DashboardContext.tsx`** — Filters, tabs, CSV export, broker sync
- **`src/components/analytics/*`** — Split analytics sections with skeleton/error states
- **`src/lib/*`** — API client, formatting, dates, health parsing

## Features

- Per-section loading skeletons and retry on error
- Lazy-loaded tab panels with error boundaries
- Theme persisted to `localStorage` with system preference fallback
- Accessible tab navigation (ARrows, ARIA roles) and chart labels
