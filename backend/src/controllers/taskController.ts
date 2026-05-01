import { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import prisma from '../prisma/client'
import { ApiError } from '../utils/apiError'

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

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id
    const { status, assignee, priority } = req.query
    const where: {
      projectId: string
      status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
      assigneeId?: string
      priority?: 'LOW' | 'MEDIUM' | 'HIGH'
    } = { projectId }

    if (typeof status === 'string') where.status = status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
    if (typeof assignee === 'string') where.assigneeId = assignee
    if (typeof priority === 'string') where.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH'

    const tasks = await prisma.task.findMany({ where, include: { assignee: true, createdBy: true } })
    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

async function assertAssigneeIsProjectMember(projectId: string, assigneeId: string | null | undefined) {
  if (!assigneeId) return

  const isMember = await prisma.projectMember.findFirst({
    where: { projectId, userId: assigneeId }
  })

  if (!isMember) {
    throw new ApiError(400, 'Assignee must be a project member')
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')
    const body = createTaskSchema.parse(req.body)
    const projectId = req.params.id || body.projectId
    await assertAssigneeIsProjectMember(projectId, body.assigneeId)

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority || 'MEDIUM',
        projectId,
        assigneeId: body.assigneeId || null,
        createdById: user.id,
        dueDate: body.dueDate ? new Date(body.dueDate) : null
      }
    })
    // create a notification for the assignee if assigned
    if (body.assigneeId) {
      try {
        await prisma.notification.create({
          data: {
            userId: body.assigneeId,
            type: 'TASK_ASSIGNED',
            title: `You were assigned a task: ${body.title}`,
            body: `A new task "${body.title}" was assigned to you in project ${projectId}`,
            metadata: { taskId: task.id, projectId }
          }
        })
      } catch (err) {
        // non-fatal - log and continue
        // eslint-disable-next-line no-console
        console.error('Failed to create notification for assignee', err)
      }
    }
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')
    const id = req.params.id
    const body = updateTaskSchema.parse(req.body)
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) throw new ApiError(404, 'Task not found')

    // permission: ADMINs or creator or assignee can update
    if (user.role !== 'ADMIN' && task.createdById !== user.id && task.assigneeId !== user.id) {
      throw new ApiError(403, 'Forbidden')
    }

    if (body.assigneeId !== undefined) {
      await assertAssigneeIsProjectMember(task.projectId, body.assigneeId)
    }

    const data: Prisma.TaskUncheckedUpdateInput = {}

    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.status !== undefined) data.status = body.status
    if (body.priority !== undefined) data.priority = body.priority
    if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId
    if (body.dueDate === null) data.dueDate = null
    if (body.dueDate) data.dueDate = new Date(body.dueDate)

    const updated = await prisma.task.update({ where: { id }, data })
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')
    const id = req.params.id
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) throw new ApiError(404, 'Task not found')
    if (user.role !== 'ADMIN' && task.createdById !== user.id) throw new ApiError(403, 'Forbidden')
    await prisma.task.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
