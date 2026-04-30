import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', details: err.errors })
  }

  if (err && err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const status = err.status || 500
  const message = err.message || 'Internal server error'
  res.status(status).json({ error: message })
}
