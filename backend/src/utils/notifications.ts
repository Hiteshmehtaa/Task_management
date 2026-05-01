import { NotificationType } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import prisma from '../prisma/client'

export type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  body: string
  metadata?: Prisma.InputJsonValue
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata
    }
  })
}