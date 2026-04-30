import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import prisma from '../prisma/client'

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] as string | undefined
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
  const token = auth.split(' ')[1]
  try {
    const payload: any = verifyAccessToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return res.status(401).json({ error: 'Invalid token user' })
    ;(req as any).user = { id: user.id, role: user.role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(role: 'ADMIN' | 'MEMBER') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })
    if (user.role !== role && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
