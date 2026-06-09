# Food Engineering — "A Class Bistro"

A restaurant management platform built as a TypeScript monorepo: a NestJS API,
a Next.js web app (customer + admin), and three supporting services (gateway,
notifications, realtime) backed by shared TypeScript contracts.

> For the full system design, data flow, and known caveats, see
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Services at a glance

| Service          | Path                  | Port  | Purpose                                            |
|------------------|-----------------------|-------|----------------------------------------------------|
| API              | `apps/api`            | 4000  | All business logic, Prisma ORM, auth, WebSockets   |
| Web              | `apps/web`            | 3000  | Next.js App Router — customer + admin UI           |
| Gateway          | `apps/gateway`        | 4010  | Reverse proxy: routes `/api/*` and `/ws/*`         |
| Notifications    | `apps/notifications`  | 4020  | Email/WhatsApp delivery queue                      |
| Realtime         | `apps/realtime`       | 4030  | Chat + order-tracking WebSocket service            |
| Contracts        | `packages/contracts`  | —     | Shared TypeScript types                            |

Each service is an independent npm project (no root workspace yet). The shared
`packages/contracts` package is linked via a `file:` dependency, so run
`npm install` inside each service you intend to run.

## Setup Guide (Local)

### 1) Prerequisites
- Node.js (LTS)
- PostgreSQL (or the Prisma dev server)
- Docker (for the notifications + realtime databases)

### 2) Install dependencies
```bash
cd apps/api && npm install
cd ../web && npm install
```

### 3) Database (Prisma dev server)
```bash
cd apps
npx prisma dev --detach
```
Copy the `prisma+postgres://...` URL from the output and set it in
`apps/api/.env` as `DATABASE_URL`.

### 4) Migrate + Seed
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### 5) Run the backend
```bash
cd apps/api
npm run start:dev
```
API will be on `http://localhost:4000`.

### 6) Authentication (Admin)
Seeded admin login (local dev only — change before any shared deployment):
- Email: `islammdfaisalal@gmail.com`
- Password: `Admin@123`

Get a token:
```bash
POST http://localhost:4000/auth/login
```
Body:
```json
{
  "email": "islammdfaisalal@gmail.com",
  "password": "Admin@123"
}
```
Store the `accessToken` in the browser:
```js
localStorage.setItem("auth_token", "<accessToken>");
```

### 7) Run the frontend
```bash
cd apps/web
npm run dev
```
Web will be on `http://localhost:3000`.

### 8) Env templates
- Backend base: `apps/api/.env.example`
- Backend local: `apps/api/.env.local.example`
- Backend production: `apps/api/.env.production.example`
- Frontend base: `apps/web/.env.example`
- Frontend local: `apps/web/.env.local.example`
- Frontend production: `apps/web/.env.production.example`
- Gateway base: `apps/gateway/.env.example`
- Notifications: `apps/notifications/.env.local.example`, `.env.production.example`
- Realtime: `apps/realtime/.env.local.example`, `.env.production.example`

Copy the local template to `.env` or `.env.local` before running.

> **Shared JWT secret.** The API signs tokens; the realtime and notifications
> services verify them. All three MUST use the **same** `JWT_SECRET`, or
> WebSocket auth and protected microservice endpoints will reject valid tokens.
> Services now **fail fast at boot** if `JWT_SECRET` is unset, and reject the
> default/short secrets in production.

## Gateway

The gateway sits in front of the API and proxies `/api/*` to the upstream API,
`/api/notifications/*` to the notifications service, and `/ws/*` to the realtime
service. It is the single entry point the web app talks to.

### Run Gateway (Local)
```bash
cd apps/gateway
npm install
cp .env.example .env
npm run start:dev
```

Gateway URL: `http://localhost:4010`
API proxied via: `http://localhost:4010/api/*`

## Notifications Service

Owns email/WhatsApp delivery and notification-queue processing (polling queue
with exponential-backoff retry).

### Run Notifications Service (Local)
```bash
cd apps/notifications
npm install
cp .env.local.example .env
npm run prisma:generate
npm run start:dev
```

Notifications URL: `http://localhost:4020`
Health: `GET /health`
Gateway routing: `http://localhost:4010/api/notifications/*`

> **Service-to-service auth.** The `/notifications/queue` endpoint is protected
> by the `x-service-key` header compared against `NOTIFICATIONS_SHARED_SECRET`.
> In production this secret is **required** — the endpoint fails closed (503) if
> it is unset. In non-production it is allowed unauthenticated (with a warning)
> for local convenience.

## Realtime Service (WebSockets)

Hosts the chat + tracking WebSocket gateways. JWT auth is required on connect
(token via `Authorization` header, `Sec-WebSocket-Protocol`, or `?token=`).

### Run Realtime Service (Local)
```bash
cd apps/realtime
npm install
cp .env.local.example .env
npm run prisma:generate
npm run start:dev
```

Realtime WS URL: `ws://localhost:4030/ws`
Gateway WS URL: `ws://localhost:4010/ws`

## Data + Infra (Hybrid DB)

The API, notifications, and realtime services each own a **separate** database.

### Local (Docker PostgreSQL)
```bash
docker compose -f docker-compose.db.yml up -d
```

- Notifications DB: `localhost:5433` (DB: `notifications_db`)
- Realtime DB: `localhost:5434` (DB: `realtime_db`)

### Local envs
Copy these to `.env` (or `.env.local`):
- `apps/notifications/.env.local.example`
- `apps/realtime/.env.local.example`

### Production (AWS RDS or managed Postgres)
Create two databases — `notifications_db` and `realtime_db` — and use their
endpoints in:
- `apps/notifications/.env.production.example`
- `apps/realtime/.env.production.example`

### Migrations
Run once per service:
```bash
cd apps/notifications && npx prisma migrate dev
cd apps/realtime && npx prisma migrate dev
```

## Production Blockers (Must-do)

### 1) Web env → Gateway
Set on Vercel:
- `NEXT_PUBLIC_API_URL=https://<gateway-domain>/api`
- `NEXT_PUBLIC_WS_URL=wss://<gateway-domain>/ws`

### 2) Gateway env
Set on Render/Railway (gateway):
- `UPSTREAM_API_URL=https://<api-domain>`
- `NOTIFICATIONS_URL=https://<notifications-domain>`
- `REALTIME_URL=https://<realtime-domain>`
- `CORS_ORIGIN=https://<web-domain>`

### 3) API / shared secrets
- `DATABASE_URL=postgresql://user:pass@host:5432/db` (stable DB; not a Prisma dev URL)
- `JWT_SECRET=<strong-secret>` — **identical across api, notifications, realtime**
- `NOTIFICATIONS_SHARED_SECRET=<strong-secret>` — required in production
- `CORS_ORIGIN=https://<web-domain>`

## Shared Contracts

Shared API contracts live in `packages/contracts`: stable types for health
responses, pagination, and error payloads.

## Deployment (Enterprise Baseline)

### Web (Vercel)
1. Set Vercel root directory to `apps/web` (Project Settings → Root Directory).
2. Add env vars from `apps/web/.env.production.example`.
3. Build command is set in `vercel.json`.

### API (Render)
1. Use `render.yaml` at repo root.
2. Set env vars from `apps/api/.env.production.example`.
3. `healthCheckPath` is `/health`.

### API (Railway)
1. Use `railway.json` at repo root.
2. Set env vars from `apps/api/.env.production.example`.
3. Start command uses `npm run start:prod`.

> **Note:** the gateway, notifications, and realtime services do not yet have
> their own deploy configs (no `render.yaml`/`railway.json`/Dockerfile). See
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the current gaps.
