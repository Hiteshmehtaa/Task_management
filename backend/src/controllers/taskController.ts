import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma/client'

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().uuid()
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().nullable().optional()
})

export async function listTasks(req: Request, res: Response) {
  const projectId = req.params.id
  const { status, assignee, priority } = req.query as any
  const where: any = { projectId }
  if (status) where.status = status
  if (assignee) where.assigneeId = assignee
  if (priority) where.priority = priority

  const tasks = await prisma.task.findMany({ where, include: { assignee: true, createdBy: true } })
  res.json(tasks)
}

export async function createTask(req: Request, res: Response) {
  const user = (req as any).user
  const body = createTaskSchema.parse(req.body)
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority || 'MEDIUM',
      projectId: body.projectId,
      assigneeId: body.assigneeId || null,
      createdById: user.id,
      dueDate: body.dueDate ? new Date(body.dueDate) : null
    }
  })
  res.status(201).json(task)
}

export async function updateTask(req: Request, res: Response) {
  const user = (req as any).user
  const id = req.params.id
  const body = updateTaskSchema.parse(req.body)
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Task not found' })

  // permission: ADMINs or creator or assignee can update
  if (user.role !== 'ADMIN' && task.createdById !== user.id && task.assigneeId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const data: any = { ...body }
  if (body.dueDate === null) data.dueDate = null
  if (body.dueDate) data.dueDate = new Date(body.dueDate as string)

  const updated = await prisma.task.update({ where: { id }, data })
  res.json(updated)
}

export async function deleteTask(req: Request, res: Response) {
  const user = (req as any).user
  const id = req.params.id
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  if (user.role !== 'ADMIN' && task.createdById !== user.id) return res.status(403).json({ error: 'Forbidden' })
  await prisma.task.delete({ where: { id } })
  res.json({ success: true })
}
