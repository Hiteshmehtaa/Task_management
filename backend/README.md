# Team Task Manager — Backend

This folder contains the Node.js + Express + TypeScript backend using Prisma and PostgreSQL.

Setup

1. Create a Neon project and copy your PostgreSQL connection string into `DATABASE_URL`.

2. Copy `.env.example` to `.env` and fill in `JWT_SECRET` and `JWT_REFRESH_SECRET`.

3. Install dependencies:

```bash
cd backend
npm install
```

4. Generate Prisma client and run migrations against Neon:

```bash
npm run generate
npm run migrate
```

5. Seed the database:

```bash
npm run seed
```

6. Start dev server:

```bash
npm run dev
```

Files created in this step:

- `prisma/schema.prisma` — Prisma schema with models
- `prisma/seed.ts` — seed script creating sample users, projects, tasks
- `src/prisma/client.ts` — Prisma client singleton
- `.env.example` — example environment
