# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Food Engineering** ("A Class Bistro") — a restaurant management platform built as a TypeScript monorepo. NestJS API backend + Next.js web frontend + gateway + notifications + realtime services, with shared TypeScript contracts.

## Monorepo Structure

```
apps/
  api/              NestJS 10 backend (port 4000) — all business logic, Prisma ORM
  web/              Next.js 16 App Router frontend (port 3000) — customer + admin UI
  gateway/          NestJS reverse-proxy (port 4010) — routes /api/* and /ws/*
  notifications/    NestJS microservice (port 4020) — email/WhatsApp delivery queue
  realtime/         NestJS WebSocket service (port 4030) — chat + order tracking
packages/
  contracts/        Shared TypeScript types (HealthResponse, PagedResponse, etc.)
```

## Commands

### API Backend
```bash
cd apps/api
npm install
npx prisma migrate dev        # Run migrations
npx prisma db seed             # Seed database
npm run start:dev              # Dev server on :4000
npm run test                   # Unit tests
npm run test:e2e               # E2E tests
npm run lint
```

### Web Frontend
```bash
cd apps/web
npm install
npm run dev                    # Dev server on :3000
npm run build
npm run lint
npx playwright test            # Smoke tests
```

### Gateway / Notifications / Realtime
```bash
cd apps/<service>
npm install
cp .env.example .env
npm run start:dev
```

### Database (Docker)
```bash
docker compose -f docker-compose.db.yml up -d   # Notifications DB :5433, Realtime DB :5434
```

## Required Environment Variables

**API** (`apps/api/.env`): `DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `CORS_ORIGIN`, optional: `SENTRY_DSN`

**Web** (`apps/web/.env.local`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

**Gateway**: `UPSTREAM_API_URL`, `CORS_ORIGIN`, optional: `NOTIFICATIONS_URL`, `REALTIME_URL`

## Architecture

### Backend Modules (apps/api/src/)

| Module | Purpose |
|--------|---------|
| auth | JWT login, forgot/reset password |
| menu | Menu CRUD, WebSocket live updates, image upload (AWS S3/Cloudinary) |
| orders | Order lifecycle, rider assignment, status advancement |
| reservations | Table reservations, approve/decline |
| riders | Rider profiles, status management |
| customers | Customer directory |
| chat | Chat threads + messages, WebSocket gateway |
| tracking | Real-time order tracking, WebSocket gateway |
| promotions | Rule-based promotions engine (draft/scheduled/active/paused/expired) |
| coupons | Coupon CRUD with segment targeting (percent/fixed/free_delivery) |
| loyalty | Loyalty tiers, points, automated rewards |
| segments | Dynamic customer segmentation |
| automation | Event/schedule/condition-triggered rules with execution logging |
| analytics | Offer performance + ROI metrics |
| pricing | Rules engine for discount stacking, caps, safety checks |
| growth | Upsell rules, personalization, A/B experiments |
| settings | Key-value config store |
| roles | Role/permission matrix |
| uploads | File upload service (S3/Cloudinary) |

### Frontend Routes (apps/web/)

**Customer** (`(customer)` route group): `/` (home), `/menu`, `/reservations`, `/account`, `/tracking/[orderId]`

**Admin** (`/admin` route group): 19 pages — dashboard, login, analytics, audit, automation, chat, control-center, coupons, customers, growth, loyalty, menu, notifications, orders, promotions, reservations, riders, roles, safety, segments

### Auth Flow

- JWT Bearer tokens via `/auth/login`
- `JwtAuthGuard` + `@Public()` decorator for endpoint protection
- `@Roles()` decorator + `RolesGuard` for role-based access (owner/admin/manager/support/rider/customer)
- Admin frontend uses `AdminAuthGate` checking `localStorage` for auth token
- WebSocket auth: JWT via query param `?token=`, `Authorization` header, or `Sec-WebSocket-Protocol`

### Database Schema (Prisma/PostgreSQL)

22 models total. Key entities: User, MenuItem, Order, OrderItem, Reservation, RiderProfile, TrackingUpdate, ChatThread, ChatMessage, CustomerProfile, Promotion, Coupon, Redemption, Segment, AutomationRule, AutomationExecution, AuditLog, UpsellRule, Experiment, Setting, RoleConfig, NotificationJob

### Data Flow

- Web frontend → `apiFetch()` / `publicFetch()` (from `lib/api.ts`) → API or Gateway
- Admin pages: authenticated via `Authorization: Bearer` header
- Customer pages: unauthenticated `publicFetch` with fallback mock data (`lib/data.ts`)
- Real-time: WebSocket hooks (`useWebSocket`, `useTrackingChannel`) connect to gateway

### Notifications Queue

- Polling-based: picks oldest `queued` job every ~10s
- Channels: email (SendGrid or SMTP) + WhatsApp (Twilio)
- Retry with exponential backoff (5min base, 12hr max, 5 retries)
- Service-to-service auth via `x-service-key` header

## Conventions

- NestJS modules follow standard structure: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`
- Prisma schema is the single source of truth for database models
- Frontend types defined in `apps/web/lib/types.ts`; shared types in `packages/contracts/`
- Frontend design system components in `apps/web/components/design-system/` (Button, Card, Badge, Form, Pagination, States)
- CSS custom properties for theming (amber/emerald color scheme); Tailwind config maps CSS vars to utilities
- Admin nav items defined in `apps/web/lib/config.ts` (`ADMIN_NAV` constant)
