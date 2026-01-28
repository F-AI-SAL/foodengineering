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

## Shared Contracts

Shared API contracts live in `packages/contracts`.
They provide stable types for health responses, pagination, and error payloads.

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
