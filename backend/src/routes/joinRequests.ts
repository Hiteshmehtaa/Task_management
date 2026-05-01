import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth'
import { ensureProjectAdmin } from '../middleware/projectAccess'
import prisma from '../prisma/client'
import { ApiError } from '../utils/apiError'
import { createNotification } from '../utils/notifications'
import { verifySecretKey } from '../utils/keyGenerator'

const joinProjectSchema = z.object({
  projectKey: z.string().min(4).max(20).transform((value) => value.toUpperCase()),
  secretKey: z.string().min(8).max(64)
})

const handleRequestSchema = z.object({
  action: z.enum(['approve', 'reject'])
})

const router = Router()

router.post('/join', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    const body = joinProjectSchema.parse(req.body)
    const project = await prisma.project.findUnique({ where: { projectKey: body.projectKey } })
    if (!project) throw new ApiError(404, 'Project not found')
    if (project.ownerId === user.id) throw new ApiError(400, 'You own this project')

    const validKey = await verifySecretKey(body.secretKey, project.secretKey)
    if (!validKey) throw new ApiError(401, 'Invalid project key')

    const isMember = await prisma.projectMember.findFirst({ where: { projectId: project.id, userId: user.id } })
    if (isMember) throw new ApiError(400, 'Already a member')

    const existingRequest = await prisma.joinRequest.findUnique({ where: { projectId_userId: { projectId: project.id, userId: user.id } } })
    if (existingRequest?.status === 'PENDING') throw new ApiError(400, 'Request already sent')
    if (existingRequest?.status === 'APPROVED') throw new ApiError(400, 'Already a member')

    const requester = await prisma.user.findUnique({ where: { id: user.id } })
    if (!requester) throw new ApiError(401, 'Invalid token user')

    const joinRequest = await prisma.joinRequest.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      update: { status: 'PENDING' },
      create: { projectId: project.id, userId: user.id, status: 'PENDING' }
    })

    await createNotification({
      userId: project.ownerId,
      type: 'JOIN_REQUEST_RECEIVED',
      title: 'New join request',
      body: `${requester.name} wants to join ${project.name}`,
      metadata: { projectId: project.id, requestId: joinRequest.id }
    })

    res.status(201).json({ message: 'Join request sent. Waiting for approval.' })
  } catch (error) {
    next(error)
  }
})

router.get('/:id/join-requests', ensureProjectAdmin, async (req, res, next) => {
  try {
    const projectId = req.params.id
    const requests = await prisma.joinRequest.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(
      requests.map((request) => ({
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
        user: {
          id: request.user.id,
          name: request.user.name,
          email: request.user.email,
          avatarInitials: request.user.name
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('')
            .slice(0, 2)
        }
      }))
    )
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/join-requests/:requestId', ensureProjectAdmin, async (req, res, next) => {
  try {
    const projectId = req.params.id
    const requestId = req.params.requestId
    const body = handleRequestSchema.parse(req.body)

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { user: true, project: true }
    })

    if (!joinRequest || joinRequest.projectId !== projectId) throw new ApiError(404, 'Join request not found')
    if (joinRequest.status !== 'PENDING') {
      if (joinRequest.status === 'APPROVED') throw new ApiError(400, 'User is already a member')
      throw new ApiError(400, 'Request already handled')
    }

    const nextStatus = body.action === 'approve' ? 'APPROVED' : 'REJECTED'

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.joinRequest.update({
        where: { id: joinRequest.id },
        data: { status: nextStatus }
      })

      if (body.action === 'approve') {
        await tx.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId: joinRequest.projectId,
              userId: joinRequest.userId
            }
          },
          update: { role: 'MEMBER' },
          create: { projectId: joinRequest.projectId, userId: joinRequest.userId, role: 'MEMBER' }
        })
      }

      return updated
    })

    if (body.action === 'approve') {
      await createNotification({
        userId: joinRequest.userId,
        type: 'JOIN_REQUEST_APPROVED',
        title: 'Join request approved',
        body: `You are now a member of ${joinRequest.project.name}`,
        metadata: { projectId: joinRequest.projectId }
      })
    } else {
      await createNotification({
        userId: joinRequest.userId,
        type: 'JOIN_REQUEST_REJECTED',
        title: 'Join request rejected',
        body: `Your request to join ${joinRequest.project.name} was rejected`,
        metadata: { projectId: joinRequest.projectId }
      })
    }

    res.json(updatedRequest)
  } catch (error) {
    next(error)
  }
})

export default router