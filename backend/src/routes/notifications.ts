import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import prisma from '../prisma/client'
import { ApiError } from '../utils/apiError'

const router = Router()

router.use(authenticateToken)

router.get('/', async (req, res, next) => {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id, read: false },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    res.json(notifications)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/read', async (req, res, next) => {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: user.id } })
    if (!notification) throw new ApiError(404, 'Notification not found')

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true }
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

router.patch('/read-all', async (req, res, next) => {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true }
    })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

router.get('/count', async (req, res, next) => {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    const unread = await prisma.notification.count({ where: { userId: user.id, read: false } })
    res.json({ unread })
  } catch (error) {
    next(error)
  }
})

export default router