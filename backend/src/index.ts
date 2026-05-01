import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import projectsRouter from './routes/projects'
import userJoinRequestsRouter from './routes/userJoinRequests'
import tasksRouter from './routes/tasks'
import notificationsRouter from './routes/notifications'
import dashboardRouter from './routes/dashboard'
import commentsRouter from './routes/comments'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cookieParser())
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://task-management-silk-eight.vercel.app',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean), 
  credentials: true 
}))

app.use('/api/auth', authRouter)
app.use('/api/users', userJoinRequestsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api', tasksRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api', commentsRouter)
app.use('/api/dashboard', dashboardRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
