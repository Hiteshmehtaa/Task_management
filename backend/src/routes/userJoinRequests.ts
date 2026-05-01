import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import prisma from '../prisma/client'
import { ApiError } from '../utils/apiError'

const router = Router()

router.use(authenticateToken)

router.get('/me/join-requests', async (req, res, next) => {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    const requests = await prisma.joinRequest.findMany({
      where: { userId: user.id },
      include: { project: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json(requests)
  } catch (error) {
    next(error)
  }
})

export default router