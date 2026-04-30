import { Request, Response } from 'express'
import prisma from '../prisma/client'

export async function getDashboard(req: Request, res: Response) {
  const user = (req as any).user
  const currentUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } })
  const myTasks = await prisma.task.findMany({ where: { assigneeId: user.id }, include: { project: true } })

  const overdueCount = await prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { not: 'DONE' }, assigneeId: user.id } })

  const projectCount = await prisma.project.count({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] } })

  const tasksByStatusRaw = await prisma.task.groupBy({ by: ['status'], where: { assigneeId: user.id }, _count: { status: true } })
  const tasksByStatus: any = {}
  for (const row of tasksByStatusRaw) tasksByStatus[row.status] = row._count.status

  // recent activity: latest comments and tasks
  const recentComments = await prisma.comment.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { author: true, task: true } })
  const recentTasks = await prisma.task.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { createdBy: true } })
  const recentActivity = [...recentComments.map(c => ({ type: 'comment', createdAt: c.createdAt, data: c })), ...recentTasks.map(t => ({ type: 'task', createdAt: t.createdAt, data: t }))].sort((a,b)=> b.createdAt.getTime()-a.createdAt.getTime()).slice(0,10)

  res.json({ userName: currentUser?.name, myTasks, overdueCount, projectCount, tasksByStatus, recentActivity })
}
