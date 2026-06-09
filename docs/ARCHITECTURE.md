# Architecture

Food Engineering is a TypeScript monorepo split into five runnable services plus
a shared contracts package. This document describes how they fit together, how
data and auth flow between them, and the known architectural caveats.

## 1. Topology

```
                         ┌──────────────────────┐
                         │   Web (Next.js :3000)│
                         │  customer + admin UI │
                         └───────────┬──────────┘
                                     │ HTTPS / WSS
                                     ▼
                         ┌──────────────────────┐
                         │   Gateway (:4010)    │  reverse proxy
                         │  /api/*  /ws/*       │
                         └───┬───────────┬──────┘
            /api/*           │           │  /ws/*        /api/notifications/*
            ┌────────────────┘           └──────────────┐        │
            ▼                                            ▼        ▼
  ┌───────────────────┐                      ┌────────────────┐ ┌────────────────────┐
  │  API (:4000)      │   x-service-key      │ Realtime(:4030)│ │ Notifications(:4020)│
  │  NestJS + Prisma  │ ───────────────────► │ chat+tracking  │ │ email/WhatsApp queue│
  └─────────┬─────────┘   (enqueue notif.)   └───────┬────────┘ └─────────┬──────────┘
            │                                         │                    │
            ▼                                         ▼                    ▼
     ┌────────────┐                            ┌────────────┐       ┌────────────┐
     │  API DB    │                            │ Realtime DB│       │ Notif. DB  │
     │ (Postgres) │                            │ :5434      │       │ :5433      │
     └────────────┘                            └────────────┘       └────────────┘
```

The web app talks **only** to the gateway. The gateway fans out to the API,
realtime, and notifications services. Each backend service owns its own
PostgreSQL database.

## 2. Services

### API (`apps/api`, :4000)
NestJS 10 + Prisma. Houses all business logic across ~20 modules: `auth`,
`menu`, `orders`, `reservations`, `riders`, `customers`, `chat`, `tracking`,
`promotions`, `coupons`, `loyalty`, `segments`, `automation`, `analytics`,
`pricing`, `growth`, `settings`, `roles`, `uploads`. Owns the canonical
business database (22 Prisma models). Provides JWT auth, role-based access,
file uploads (S3/Cloudinary), and a pricing/discount engine.

### Web (`apps/web`, :3000)
Next.js App Router. Two route groups: `(customer)` (home, menu, reservations,
account, order tracking) and `/admin` (19 management pages). Customer pages use
unauthenticated `publicFetch` with mock fallbacks; admin pages use
`apiFetch` with a `Bearer` token. Real-time features use WebSocket hooks
(`useWebSocket`, `useTrackingChannel`).

### Gateway (`apps/gateway`, :4010)
Stateless reverse proxy (`http-proxy-middleware` + Helmet). Routes:
- `/api/notifications/*` → notifications service (path-rewritten to `/notifications`)
- `/ws/*` → realtime service (WebSocket upgrade enabled)
- `/api/*` → upstream API (fallback)

Configurable via `UPSTREAM_API_URL`, `NOTIFICATIONS_URL`, `REALTIME_URL`,
`CORS_ORIGIN`, `REQUEST_TIMEOUT_MS`.

### Notifications (`apps/notifications`, :4020)
Owns email (SendGrid or SMTP) + WhatsApp (Twilio) delivery. A polling queue
picks the oldest `queued` `NotificationJob` (~10s cadence) and sends it, with
exponential backoff retry (5 min base, 12 h cap, 5 attempts). The API enqueues
jobs over HTTP using the `x-service-key` header.

### Realtime (`apps/realtime`, :4030)
WebSocket service for chat and order tracking. JWT auth on connect. Maintains
per-order subscription sets **in memory** and broadcasts updates to subscribers.
Persists chat messages and tracking updates to its own database.

### Contracts (`packages/contracts`)
Shared types: `HealthResponse`, `ApiErrorResponse`, `PaginationMeta`,
`PagedResponse<T>`. Currently only `HealthResponse` is widely consumed.

## 3. Auth

- **User auth:** JWT Bearer via `POST /auth/login`. `JwtAuthGuard` + `@Public()`
  protect endpoints; `@Roles()` + `RolesGuard` enforce roles
  (`owner`/`admin`/`manager`/`support`/`rider`/`customer`).
- **WebSocket auth:** JWT passed via `Authorization` header,
  `Sec-WebSocket-Protocol`, or `?token=` query param; verified on connect.
- **Service-to-service:** API → notifications uses the `x-service-key` header
  compared (constant-time) against `NOTIFICATIONS_SHARED_SECRET`.
- **Shared secret requirement:** the API signs tokens and the realtime +
  notifications services verify them, so **all three must share the same
  `JWT_SECRET`**. Every service now fails fast at boot if `JWT_SECRET` is unset,
  and rejects weak/default secrets in production (see
  `*/src/auth/require-jwt-secret.ts`).
- **Admin frontend:** `AdminAuthGate` checks `localStorage` for a token
  (client-side only).

## 4. Data ownership

| Entity domain                       | Owner DB        |
|-------------------------------------|-----------------|
| Users, orders, menu, promotions,    | API DB          |
| coupons, loyalty, automation, etc.  |                 |
| Notification jobs                   | Notifications DB|
| Chat threads/messages, tracking     | Realtime DB     |

There are **no cross-service transactions**. Inter-service communication is
fire-and-forget HTTP (API → notifications enqueue) and WebSocket broadcast.

## 5. Pricing / discount engine

`pricing.service.ts` selects active promotions and coupons within their
start/end window, evaluates segment/condition eligibility, applies stacking
rules and global discount caps, and records `Redemption` rows. The active-window
filter is expressed as `AND: [ { OR: [start...] }, { OR: [end...] } ]` — a
promotion/coupon is eligible when it has started (or has no start) **and** has
not ended (or has no end).

## 6. Known caveats & gaps

These are tracked design limitations, not bugs:

1. **Chat/tracking data is split across two databases.** The API still exposes a
   REST `ChatController`/`ChatService` writing to the API DB, while the realtime
   service writes WebSocket chat + tracking to its own DB. There is no sync
   between them and no single source of truth. A future step should pick one
   store and remove the other path. (The API's `chat.gateway.ts` is currently
   unregistered dead code.)
2. **Realtime cannot horizontally scale as-is.** Subscriptions live in instance
   memory; running 2+ replicas would drop cross-instance broadcasts. A shared
   backplane (Redis pub/sub) is required before scaling out.
3. **Notification enqueue is fire-and-forget.** If the notifications service is
   down when the API calls it, the message is lost (no outbox / dead-letter).
4. **Observability is uneven.** Sentry is wired in the API only; there are no
   cross-service correlation IDs.
5. **No root workspace.** Each service installs/builds independently; the shared
   contracts package is linked via `file:`.
6. **Deploy configs are incomplete.** Only the API (Render/Railway) and web
   (Vercel) have deploy configs. The gateway, notifications, and realtime
   services have no `render.yaml`/`railway.json`/Dockerfile yet.
7. **Test coverage is minimal** (pagination unit test + web smoke tests only).

## 7. Automation engine

Rules (`AutomationRule`) pair a trigger (`schedule` | `event` | `condition`)
with an action. The scheduler enqueues active `schedule` rules; `runNow`
enqueues manually. The queue runs each job through `AutomationExecutorService`,
which performs the real effect and records the outcome on `AutomationExecution`
(`success` with an `outputJson`, or `failed` with an `errorMessage`).

Action config contracts (`actionConfigJson`):

| Action                  | Config                                                            |
|-------------------------|-------------------------------------------------------------------|
| `activate_promotion`    | `{ promotionId }` → sets promotion status `active`                |
| `deactivate_promotion`  | `{ promotionId }` → sets promotion status `paused`                |
| `send_notification`     | `{ channel: "email"\|"whatsapp", payload? , to?, subject?, message? }` |
| `send_coupon`           | `{ couponId\|code, recipients: string[], channel?, subject?, message? }` |
| `award_loyalty`         | `{ userId, points }` (non-zero) → increments `CustomerProfile.points` |
| `update_segment`        | not supported yet (no segment-evaluation engine) — fails loudly   |

**Scheduling:** `schedule` rules carry `triggerConfigJson.intervalMinutes`
(default 1440 = daily). The 5-minute cron only enqueues a rule when its most
recent execution is older than that interval, so non-idempotent actions
(e.g. `award_loyalty`) don't fire every tick. `event`/`condition` triggers are
not yet wired to an event source.

## 8. Recent changes

- **Pricing window fix:** the promotion/coupon active-window query previously
  used an impossible `AND: [{endAt: null}, {endAt: {gte: now}}]`, so it always
  returned zero rows — no promotion or coupon ever applied. Restructured to the
  correct `AND[ OR, OR ]` form.
- **Auth hardening:** removed the `"change-me"` JWT fallback from all five read
  sites; added `requireJwtSecret()` (fail fast on unset; reject weak/default in
  production). The notifications `/queue` endpoint now fails closed in
  production and uses a constant-time service-key comparison.
- **Automation execution:** replaced the no-op queue with a real executor
  (5 working action handlers + interval-gated scheduling). Previously rules were
  marked `success` without doing anything.
