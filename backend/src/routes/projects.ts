import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { ensureProjectAdmin, ensureProjectMember } from '../middleware/projectAccess'
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/projectController'

const router = Router()

router.use(authenticateToken)

router.get('/', listProjects)
router.post('/', createProject)

router.get('/:id', ensureProjectMember, getProject)
router.put('/:id', ensureProjectAdmin, updateProject)
router.delete('/:id', ensureProjectAdmin, deleteProject)

router.post('/:id/members', ensureProjectAdmin, addMember)
router.delete('/:id/members/:userId', ensureProjectAdmin, removeMember)

export default router
