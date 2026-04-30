# Team Task Manager

A production-quality task management web app with React, Vite, TypeScript, Tailwind CSS, Node.js Express, and Neon-hosted PostgreSQL.

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v3, Zustand, React Query, Framer Motion, Recharts, @dnd-kit
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Neon PostgreSQL, JWT auth (httpOnly cookies)
- **Styling:** Dark theme, minimal and sophisticated design with smooth animations

## Setup

### Backend

```bash
cd backend
npm install
```

Create a Neon project and put its connection string into `.env`:

```bash
cp .env.example .env
# Edit .env with your Neon connection string and JWT secrets
npm run generate
npm run migrate
npm run seed
npm run dev
```

Server will run on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env should point to your backend: VITE_API_URL=http://localhost:4000/api
npm run dev
```

Frontend will run on `http://localhost:5173`.

## Features

- **Auth:** Sign up/login with JWT tokens (access + refresh stored in httpOnly cookies)
- **Projects:** Create, view, manage projects with members and roles (ADMIN/MEMBER)
- **Tasks:** Drag-and-drop Kanban board with TODO, IN_PROGRESS, REVIEW, DONE statuses
- **Task Details:** Full editor with status, priority, assignee, due date, and comments
- **Dashboard:** Overview with stat cards, task charts, and recent activity
- **Comments:** Real-time comment threads on tasks with author info
- **Responsive:** Mobile and desktop support with smooth animations
- **Polished UI:** Skeleton loaders, toast notifications, badges, avatars, modals, drawers

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout

### Projects
- `GET /api/projects` — List user's projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project details
- `PUT /api/projects/:id` — Update project (admin)
- `DELETE /api/projects/:id` — Delete project (admin)
- `POST /api/projects/:id/members` — Add member (admin)
- `DELETE /api/projects/:id/members/:userId` — Remove member (admin)

### Tasks
- `GET /api/projects/:id/tasks` — List tasks (with filters: status, assignee, priority)
- `POST /api/projects/:id/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

### Comments
- `GET /api/tasks/:taskId/comments` — List comments
- `POST /api/tasks/:taskId/comments` — Add comment

### Dashboard
- `GET /api/dashboard` — Get dashboard stats, tasks, activity

## Database Schema

- **User:** id, name, email, passwordHash, role, createdAt
- **Project:** id, name, description, ownerId, createdAt
- **ProjectMember:** id, projectId, userId, role
- **Task:** id, title, description, status, priority, projectId, assigneeId, createdById, dueDate, createdAt, updatedAt
- **Comment:** id, content, taskId, authorId, createdAt

## Color Theme (CSS Variables)

Dark, minimal, sophisticated:
- Background: #0F0F13
- Surface: #16161D
- Border: #2A2A35
- Primary: #7C3AED (Violet)
- Success: #10B981 (Emerald)
- Warning: #F59E0B (Amber)
- Danger: #F43F5E (Rose)
- Text Primary: #F1F0F4
- Text Secondary: #8B8A99

## Project Structure

```
backend/
  src/
    controllers/     — Business logic
    routes/         — Express routers
    middleware/     — Auth, errors, validation
    utils/          — JWT, hashing
    prisma/         — Schema, migrations, seed
  package.json
  tsconfig.json

frontend/
  src/
    api/            — Axios client + API calls
    pages/          — Route components
    components/     — Reusable UI components
    store/          — Zustand stores (auth)
    styles/         — Tailwind CSS
  package.json
  tsconfig.json
  index.html
```

## Running Tests

Seed data creates:
- Admin user (admin@example.com / adminpass)
- Member user (member@example.com / memberpass)
- 2 projects with 5 sample tasks

Use these credentials to test the app locally.

## Deployment

Recommended production setup:
- Database: Neon PostgreSQL
- Backend: Railway or Render
- Frontend: Vercel

Deployment flow:
1. Deploy the backend from the `backend` folder.
2. Set `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, and `FRONTEND_URL` in the backend host.
3. Deploy the frontend from the `frontend` folder.
4. Set `VITE_API_URL` in the frontend host to the deployed backend API URL ending in `/api`.
5. Use the frontend URL as the public deployment link you share.

Build commands:
```bash
cd backend
npm run build

cd ../frontend
npm run build
```

## License

MIT
