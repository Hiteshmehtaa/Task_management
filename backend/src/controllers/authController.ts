import { Request, Response } from 'express'
import prisma from '../prisma/client'
import { z } from 'zod'
import { hashPassword, comparePassword } from '../utils/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function signup(req: Request, res: Response) {
  const body = signupSchema.parse(req.body)
  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) return res.status(400).json({ error: 'Email already in use' })

  const passwordHash = await hashPassword(body.password)
  const user = await prisma.user.create({ data: { name: body.name, email: body.email, passwordHash } })

  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await comparePassword(body.password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'Missing refresh token' })
  try {
    const payload: any = verifyRefreshToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' })

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    res.json({ accessToken })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.json({ success: true })
}
