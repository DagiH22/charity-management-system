# charity-management-system
final year project

## Backend quick start (Auth API)

1. Go to backend folder and install dependencies.
2. Copy environment template and set real values.
3. Run Prisma migration and generate client.
4. Start development server.

Suggested flow:

- `cd backend`
- `cp .env.example .env`
- update `DATABASE_URL` and `JWT_SECRET` in `.env`
- `npm install`
- `npx prisma migrate dev --name init_auth`
- `npm run dev`

Auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token required)

Charity profile endpoints:

- `POST /charity-profile` (Bearer token, CHARITY only)
- `GET /charity-profile/me` (Bearer token, CHARITY only)

`POST /charity-profile` expects `multipart/form-data` with:

- `document` (file: pdf/jpg/jpeg/png)
- `organizationName` (text)
- `description` (text)
- `phone` (optional text)
- `address` (optional text)
- `website` (optional text)

Two-step charity registration flow:

1. Register with role `CHARITY` using `/auth/register`
2. Complete profile via `/charity-profile`

After schema updates, run migration + regenerate Prisma client:

- `npx prisma migrate dev --name add_charity_profile`
- `npx prisma generate`
