# Team Task Manager — Backend

This folder contains the Node.js + Express + TypeScript backend using Prisma and PostgreSQL.

Setup

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.

2. Install dependencies:

```bash
cd backend
npm install
```

3. Generate Prisma client and run migrations (you need a running Postgres instance):

```bash
npm run generate
npm run migrate
```

4. Seed the database:

```bash
npm run seed
```

5. Start dev server:

```bash
npm run dev
```

Files created in this step:

- `prisma/schema.prisma` — Prisma schema with models
- `prisma/seed.ts` — seed script creating sample users, projects, tasks
- `src/prisma/client.ts` — Prisma client singleton
- `.env.example` — example environment
