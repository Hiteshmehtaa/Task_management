import { PrismaClient, Role, TaskStatus, Priority } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const salt = await bcrypt.genSalt(10)
  const adminHash = await bcrypt.hash('adminpass', salt)
  const memberHash = await bcrypt.hash('memberpass', salt)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: Role.ADMIN
    }
  })

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      name: 'Member User',
      email: 'member@example.com',
      passwordHash: memberHash,
      role: Role.MEMBER
    }
  })

  const projectA = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign the marketing website',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: member.id, role: Role.MEMBER }
        ]
      }
    }
  })

  const projectB = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'Build mobile app MVP',
      ownerId: member.id,
      members: {
        create: [
          { userId: member.id, role: Role.ADMIN },
          { userId: admin.id, role: Role.MEMBER }
        ]
      }
    }
  })

  const tasks = [
    {
      title: 'Hero section copy',
      description: 'Write new hero copy and CTA',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      projectId: projectA.id,
      createdById: admin.id,
      assigneeId: member.id,
    },
    {
      title: 'Design new icons',
      description: 'Create a set of icons for features section',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      projectId: projectA.id,
      createdById: admin.id,
      assigneeId: admin.id,
    },
    {
      title: 'Setup analytics',
      description: 'Integrate analytics and goals',
      status: TaskStatus.REVIEW,
      priority: Priority.MEDIUM,
      projectId: projectB.id,
      createdById: member.id,
      assigneeId: member.id,
    },
    {
      title: 'Login flow',
      description: 'Implement login + jwt auth',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      projectId: projectB.id,
      createdById: member.id,
      assigneeId: admin.id,
    },
    {
      title: 'Release notes draft',
      description: 'Draft release notes for v0.1',
      status: TaskStatus.DONE,
      priority: Priority.LOW,
      projectId: projectA.id,
      createdById: admin.id,
      assigneeId: member.id,
    }
  ]

  for (const t of tasks) {
    await prisma.task.create({ data: t })
  }

  console.log('Seed finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
