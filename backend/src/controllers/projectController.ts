import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma/client'

const createProjectSchema = z.object({ name: z.string().min(1), description: z.string().optional() })
const updateProjectSchema = z.object({ name: z.string().min(1).optional(), description: z.string().optional() })
const addMemberSchema = z.object({ userId: z.string().uuid(), role: z.enum(['ADMIN', 'MEMBER']) })

export async function listProjects(req: Request, res: Response) {
  const user = (req as any).user
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }]
    },
    include: { members: { include: { user: true } }, tasks: true }
  })
  res.json(projects)
}

export async function createProject(req: Request, res: Response) {
  const user = (req as any).user
  const body = createProjectSchema.parse(req.body)
  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      ownerId: user.id,
      members: { create: { userId: user.id, role: 'ADMIN' } }
    }
  })
  res.status(201).json(project)
}

export async function getProject(req: Request, res: Response) {
  const id = req.params.id
  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: { include: { user: true } }, tasks: { include: { assignee: true, createdBy: true } } }
  })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json(project)
}

export async function updateProject(req: Request, res: Response) {
  const id = req.params.id
  const body = updateProjectSchema.parse(req.body)
  const updated = await prisma.project.update({ where: { id }, data: body })
  res.json(updated)
}

export async function deleteProject(req: Request, res: Response) {
  const id = req.params.id
  await prisma.project.delete({ where: { id } })
  res.json({ success: true })
}

export async function addMember(req: Request, res: Response) {
  const projectId = req.params.id
  const body = addMemberSchema.parse(req.body)
  const exists = await prisma.projectMember.findFirst({ where: { projectId, userId: body.userId } })
  if (exists) return res.status(400).json({ error: 'Member already exists' })
  const member = await prisma.projectMember.create({ data: { projectId, userId: body.userId, role: body.role } })
  res.status(201).json(member)
}

export async function removeMember(req: Request, res: Response) {
  const projectId = req.params.id
  const userId = req.params.userId
  await prisma.projectMember.deleteMany({ where: { projectId, userId } })
  res.json({ success: true })
}
