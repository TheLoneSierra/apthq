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
| `VITE_API_BASE` | Leave **empty** on Vercel. Same-origin `/api`, `/health`, and `/v2` are routed by `vercel.json`. |
| `VITE_API_PROXY_TARGET` | Analytics Lambda URL for local dev proxy (`/api`, `/health`). |
| `VITE_BRAND_API_PROXY_TARGET` | Brand config backend for local dev (`/v2`). Default: `http://localhost:3000`. |
| `VITE_BRAND_CONFIG_TOKEN` | Optional default token for Brand Config tab. |

### Two backends

| Routes | Backend |
|--------|---------|
| `/api/v1/*`, `/health` | AWS Lambda (analytics) |
| `/v2/aggregate/*`, `/v2/users/login` | Brand config API (Vercel serverless in prod, `server.js` locally) |

**Local dev:** run both processes:

```bash
npm run server   # brand config on :3000
npm run dev      # frontend on :5173
```

**Vercel:** deploy this repo as-is. Set `VITE_API_BASE` to empty (or remove it). Do **not** point `VITE_API_BASE` at the Lambda URL — that breaks Brand Config with 404.

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
