import { Request, Response, NextFunction } from 'express'
import prisma from '../prisma/client'

export async function ensureProjectMember(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user
  const projectId = req.params.id || req.body.projectId
  if (!projectId) return res.status(400).json({ error: 'Missing project id' })

  const membership = await prisma.projectMember.findFirst({ where: { projectId, userId: user.id } })
  if (!membership && projectId) {
    // allow owner
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden: not a member' })
    return next()
  }

  ;(req as any).projectMember = membership
  next()
}

export async function ensureProjectAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user
  const projectId = req.params.id || req.body.projectId
  if (!projectId) return res.status(400).json({ error: 'Missing project id' })

  // owner is admin
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (project?.ownerId === user.id) return next()

  const membership = await prisma.projectMember.findFirst({ where: { projectId, userId: user.id } })
  if (!membership || membership.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' })
  next()
}
