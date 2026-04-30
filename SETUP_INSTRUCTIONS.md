# Complete Setup & Run Instructions

## System Requirements
- **Node.js** v18+ (download from https://nodejs.org)
- **Neon** hosted PostgreSQL (free tier available): https://neon.tech
- **Git** (optional, for version control)

## Database Setup (PostgreSQL)

### 1. Create a Neon database

Use Neon so you do not need any local database software installed.

1. Sign in at https://neon.tech
2. Create a new project
3. Create a database named `team_task_manager`
4. Copy the connection string from the Neon dashboard

### 2. Get your connection string

The URL will look like this:
```bash
postgresql://USER:PASSWORD@HOST:PORT/team_task_manager?schema=public
```

Example Neon connection string:
```bash
postgresql://USER:PASSWORD@ep-xxxxx.us-east-1.aws.neon.tech/team_task_manager?sslmode=require
```

---

## Backend Setup & Run

### Step 1: Navigate to Backend Directory
```bash
cd d:\Ethara Assignment\backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
copy .env.example .env
```

**Edit `.env` file with:**
```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxxx.us-east-1.aws.neon.tech/team_task_manager?sslmode=require"
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Step 4: Generate Prisma Client
```bash
npm run generate
```

### Step 5: Run Database Migrations
```bash
npm run migrate
```

### Step 6: Seed Sample Data
```bash
npm run seed
```

Sample users created:
- **Admin:** admin@example.com / adminpass
- **Member:** member@example.com / memberpass

### Step 7: Start Backend Server
```bash
npm run dev
```

✅ Backend running on: **http://localhost:4000**

---

## Frontend Setup & Run

### Step 1: Open New Terminal / Command Prompt
```bash
cd d:\Ethara Assignment\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
copy .env.example .env
```

**Edit `.env` file with:**
```
VITE_API_URL=http://localhost:4000/api
```

### Step 4: Start Development Server
```bash
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

---

## 🎯 Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. You'll be redirected to login page
3. Sign in with one of the test accounts:
   - Email: `admin@example.com`
   - Password: `adminpass`
   
   OR
   
   - Email: `member@example.com`
   - Password: `memberpass`

---

## 📱 Responsive Design Features

The app is fully responsive across all devices:

### **Mobile (< 768px)**
- Hamburger sidebar (click to toggle)
- Single column layouts
- Optimized touch targets
- Compact spacing and font sizes
- Bottom sheet modals

### **Tablet (768px - 1024px)**
- 2 column grids for projects
- 2 column Kanban board
- Sidebar visible on side
- Adjusted spacing

### **Desktop (> 1024px)**
- Full 4 column Kanban board
- 3 column project grid
- Full sidebar navigation always visible
- Optimized for large screens

**Try these screen sizes in DevTools:**
- Open DevTools (F12)
- Toggle Device Toolbar (Ctrl+Shift+M)
- Test on: iPhone 12, iPad Pro, Laptop, Desktop

---

## 🛠️ Build for Production

### Backend
```bash
cd backend
npm run build
```
Output in `dist/` folder - deploy to Heroku, Railway, or any Node.js host

### Frontend
```bash
cd frontend
npm run build
```
Output in `dist/` folder - deploy to Vercel, Netlify, or any static host

---

## 🚀 Deployment Guide

The simplest production setup for this app is:
- Database: Neon PostgreSQL
- Backend API: Railway or Render
- Frontend: Vercel

### 1. Deploy the backend

1. Push the repository to GitHub.
2. Create a new Railway or Render service from the `backend` folder.
3. Set the backend environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
4. Use these build/start commands:
   ```
   npm install
   npm run generate
   npm run migrate
   npm run build
   npm run dev
   ```
   If your host only allows one start command, use `npm run build` for build and `node dist/index.js` or the host's equivalent start command.
5. After deployment, copy the backend URL, for example `https://your-api.onrender.com`.

### 2. Deploy the frontend

1. Create a new Vercel project from the `frontend` folder.
2. Set the frontend environment variable:
   ```
   VITE_API_URL=https://your-api.onrender.com/api
   ```
3. Use the default Vercel build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy and copy the Vercel URL, for example `https://your-app.vercel.app`.

### 3. Update the backend origin

After the frontend is live, make sure `FRONTEND_URL` in the backend points to the final Vercel domain exactly. If you redeploy the frontend to a different domain, update the backend env var and redeploy the API.

### 4. Share the deployment link

The link you usually share is the frontend URL from Vercel. That is the public app URL users open in their browser.

### 5. Production checklist

- Run `npm run migrate` against the Neon database before first launch.
- Run `npm run seed` only if you want demo data in production.
- Confirm the backend health endpoint responds at `/api/health`.
- Confirm login works with the deployed frontend URL.

---

## 🧪 Testing the App

### Quick Test Workflow

1. **Create Project**
   - Navigate to "Projects" → Click "New" → Fill form → Create
   - See new project in grid

2. **Add Tasks**
   - Open a project
   - Click "+" button in any column
   - Type task title → Add
   - New task appears in TODO column

3. **Drag Tasks**
   - Click and drag task card
   - Drop into another column
   - Status updates instantly

4. **Add Comments**
   - Click any task card
   - Drawer opens on right
   - Type comment → Post
   - Comments appear in thread

5. **Edit Task**
   - In drawer: change status, priority, assignee
   - Updates instantly

6. **Dashboard**
   - Click "Dashboard" in sidebar
   - View stat cards and task charts

7. **Sign Out**
   - Click "Sign out" in top right
   - Redirected to login

---

## ⚠️ Troubleshooting

### Backend won't start
**Error: "Cannot connect to database"**
```bash
# Check DATABASE_URL points to your Neon PostgreSQL instance
# Make sure the Neon project is active and the connection string is correct
npm run migrate  # Re-run migrations
npm run dev      # Try again
```

### Frontend shows blank page
**Error: "Failed to fetch" in console**
```bash
# Make sure backend is running on port 4000
# Check VITE_API_URL in frontend/.env
# Clear browser cache: Ctrl+Shift+Delete
# Hard refresh page: Ctrl+Shift+R
```

### Port already in use
**Error: "Port 4000/5173 already in use"**
```bash
# On Windows: Find and kill process
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change PORT in backend .env
PORT=4001
```

### Database migration errors
```bash
# Regenerate Prisma client
npm run generate

# Re-run migrations
npm run migrate -- --skip-generate
```

---

## Using hosted PostgreSQL only

You do **not** need PostgreSQL installed on your machine. The app works fine with a remote managed PostgreSQL database, and Prisma will connect to it through `DATABASE_URL`.

If you want the easiest path, I recommend **Neon** or **Supabase** because they give you a free hosted Postgres URL in a couple of minutes.

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

---

## 📦 Project Structure

```
backend/
  src/
    controllers/        → Auth, Projects, Tasks, Comments, Dashboard logic
    routes/            → API endpoint definitions
    middleware/        → Authentication, RBAC, error handling
    utils/             → JWT, password hashing
    prisma/
      schema.prisma    → Database schema
      seed.ts          → Sample data
  .env                 → Environment variables (create from .env.example)
  package.json
  tsconfig.json

frontend/
  src/
    pages/             → Dashboard, Projects, ProjectDetail, Settings, Auth
    components/        → Button, Input, Card, Modal, Sidebar, etc.
    api/               → Axios client + auth/projects/tasks/comments
    store/             → Zustand auth store
    styles/            → Tailwind CSS + variables
    main.tsx           → React entry point
  .env                 → Environment variables (create from .env.example)
  package.json
  index.html
  tailwind.config.cjs
  vite.config.ts
```

---

## 🚀 Complete Command Checklist

### First Time Setup (Run Once)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
copy .env.example .env
# Edit .env with your database URL and secret keys
npm run generate
npm run migrate
npm run seed
npm run dev
```

**Terminal 2 - Frontend (open new terminal):**
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

**Browser:**
- Open http://localhost:5173
- Login with admin@example.com / adminpass

### Regular Development (Each Time)

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

---

## 🎨 UI Design Principles

The app follows a **minimal, sophisticated dark theme**:

✅ **Minimal Aesthetics**
- Dark background (#0F0F13) reduces eye strain
- Only essential UI elements visible
- No unnecessary colors or decorations
- Clean typography with proper hierarchy

✅ **Smooth Interactions**
- 150ms transitions on all hover/click
- Subtle scale effects on cards
- Fade-in animations on page load
- No distracting motion

✅ **Responsive by Default**
- Mobile-first approach
- Tailwind CSS breakpoints (md:, lg:)
- Hamburger sidebar on mobile
- Grid layouts adapt to screen size
- Touch-friendly button sizes

✅ **Dark Color Theme**
- Background: #0F0F13
- Surface: #16161D (cards, panels)
- Border: #2A2A35 (dividers)
- Primary: #7C3AED (Violet - actions)
- Text Primary: #F1F0F4
- Text Secondary: #8B8A99

---

## 📊 What You Get

✅ **Fully Functional Task Manager**
- Create projects and tasks
- Drag-and-drop Kanban board
- Real-time task updates
- Comments on tasks
- Dashboard with charts

✅ **Production-Quality Code**
- TypeScript throughout
- Responsive design
- Error handling
- Input validation
- Clean architecture

✅ **Secure Authentication**
- JWT tokens (15min access, 7day refresh)
- httpOnly cookies
- Role-based access control
- Password hashing with bcrypt

---

## ✅ Ready to Launch!

Follow the setup steps above and you'll have a fully functional, responsive, minimal task management application running locally.

**Need help?**
1. Check terminal logs for detailed error messages
2. Verify .env files have correct credentials
3. Make sure PostgreSQL is running
4. Ensure ports 4000 and 5173 are available

**Enjoy!** 🎉
