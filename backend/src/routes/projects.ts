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
  removeMember,
  getProjectMembers,
  regenerateProjectKey
} from '../controllers/projectController'
import joinRequestRouter from './joinRequests'

const router = Router()

router.use(authenticateToken)

router.get('/', listProjects)
router.post('/', createProject)

router.get('/:id', ensureProjectMember, getProject)
router.get('/:id/members', ensureProjectMember, getProjectMembers)
router.put('/:id', ensureProjectAdmin, updateProject)
router.delete('/:id', ensureProjectAdmin, deleteProject)
router.post('/:id/regenerate-key', ensureProjectAdmin, regenerateProjectKey)

router.post('/:id/members', ensureProjectAdmin, addMember)
router.delete('/:id/members/:userId', ensureProjectAdmin, removeMember)

router.use('/', joinRequestRouter)

export default router
