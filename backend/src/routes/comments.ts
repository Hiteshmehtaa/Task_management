import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { listComments, createComment } from '../controllers/commentController'

const router = Router()

router.use(authenticateToken)

router.get('/tasks/:taskId/comments', listComments)
router.post('/tasks/:taskId/comments', createComment)

export default router
