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
- Email: `admin@foodengineering.com`
- Password: `Admin@123`

Get a token:
```bash
POST http://localhost:4000/auth/login
```
Body:
```json
{
  "email": "admin@foodengineering.com",
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
- Backend: `apps/api/.env.example`
- Frontend: `apps/web/.env.example`
