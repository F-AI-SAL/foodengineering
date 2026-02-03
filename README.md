# foodengineering

## Setup Guide (Local)

### 1) Prerequisites
- Node.js (LTS)
- PostgreSQL (or Prisma dev server)

### 2) Install dependencies
```bash
cd d:\food_engineering\apps\api
npm install

cd d:\food_engineering\apps\web
npm install
```

### 3) Database (Prisma dev server)
```bash
cd d:\food_engineering\apps
npx prisma dev --detach
```
Copy the `prisma+postgres://...` URL from the output and set it in `apps/api/.env` as `DATABASE_URL`.

### 4) Migrate + Seed
```bash
cd d:\food_engineering\apps\api
npx prisma migrate dev
npx prisma db seed
```

### 5) Run the backend
```bash
cd d:\food_engineering\apps\api
npm run start:dev
```
API will be on `http://localhost:4000`.

### 6) Authentication (Admin)
Seeded admin login (for local dev):
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
cd d:\food_engineering\apps\web
npm run dev
```
Web will be on `http://localhost:3000`.

### 7) Env templates
- Backend base: `apps/api/.env.example`
- Backend local: `apps/api/.env.local.example`
- Backend production: `apps/api/.env.production.example`
- Frontend base: `apps/web/.env.example`
- Frontend local: `apps/web/.env.local.example`
- Frontend production: `apps/web/.env.production.example`
- Gateway base: `apps/gateway/.env.example`

Copy the local template to `.env` or `.env.local` before running.

## Gateway (Option C - Safe Microservice Start)

The gateway sits in front of the API and proxies `/api/*` requests to the upstream API.
This is the first step to microservice isolation without breaking the current app.

### Run Gateway (Local)
```bash
cd d:\food_engineering\apps\gateway
npm install
copy .env.example .env
npm run start:dev
```

Gateway URL: `http://localhost:4010`  
API proxied via: `http://localhost:4010/api/*`

## P0 Production Blockers (Must-do)

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

### 3) API env
Use a stable DB in production (do NOT use Prisma dev URLs):
- `DATABASE_URL=postgresql://user:pass@host:5432/db`
- `JWT_SECRET=strong-secret`
- `CORS_ORIGIN=https://<web-domain>`

## Shared Contracts

Shared API contracts live in `packages/contracts`.
They provide stable types for health responses, pagination, and error payloads.

## Notifications Service (First Extraction)

This service owns email/WhatsApp delivery and notification queue processing.

### Run Notifications Service (Local)
```bash
cd d:\food_engineering\apps\notifications
npm install
copy .env.example .env
npm run prisma:generate
npm run start:dev
```

Notifications URL: `http://localhost:4020`  
Health: `GET /health`  
Gateway routing: `http://localhost:4010/api/notifications/*`

## Realtime Service (WebSockets)

This service hosts chat + tracking WebSocket gateways.

### Run Realtime Service (Local)
```bash
cd d:\food_engineering\apps\realtime
npm install
copy .env.example .env
npm run prisma:generate
npm run start:dev
```

Realtime WS URL: `ws://localhost:4030/ws`  
Gateway WS URL: `ws://localhost:4010/ws`

## Deployment (Enterprise Baseline)

### Web (Vercel)
1) Set Vercel root directory to `apps/web` (Project Settings → Root Directory).
2) Add env vars from `apps/web/.env.production.example`.
3) Build command is already set in `vercel.json`.

### API (Render)
1) Use `render.yaml` at repo root.
2) Set env vars from `apps/api/.env.production.example`.
3) `healthCheckPath` is `/health`.

### API (Railway)
1) Use `railway.json` at repo root.
2) Set env vars from `apps/api/.env.production.example`.
3) Start command uses `npm run start:prod`.
