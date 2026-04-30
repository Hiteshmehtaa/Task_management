import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma/client'

const createCommentSchema = z.object({ content: z.string().min(1) })

export async function listComments(req: Request, res: Response) {
  const taskId = req.params.taskId
  const comments = await prisma.comment.findMany({ where: { taskId }, include: { author: true }, orderBy: { createdAt: 'asc' } })
  res.json(comments)
}

export async function createComment(req: Request, res: Response) {
  const user = (req as any).user
  const taskId = req.params.taskId
  const body = createCommentSchema.parse(req.body)
  const comment = await prisma.comment.create({
    data: { content: body.content, taskId, authorId: user.id },
    include: { author: true }
  })
  res.status(201).json(comment)
}
