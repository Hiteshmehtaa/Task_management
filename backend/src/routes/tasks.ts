import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { ensureProjectMember } from '../middleware/projectAccess'
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/taskController'

const router = Router()

router.use(authenticateToken)

// project tasks
router.get('/projects/:id/tasks', ensureProjectMember, listTasks)
router.post('/projects/:id/tasks', ensureProjectMember, createTask)

// task operations
router.put('/tasks/:id', updateTask)
router.delete('/tasks/:id', deleteTask)

export default router
