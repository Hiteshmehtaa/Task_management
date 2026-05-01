import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma/client'
import { ApiError } from '../utils/apiError'
import { generateProjectKey, generateSecretKey, hashSecretKey } from '../utils/keyGenerator'

const createProjectSchema = z.object({ name: z.string().min(1), description: z.string().optional() })
const updateProjectSchema = z.object({ name: z.string().min(1).optional(), description: z.string().optional() })
const addMemberSchema = z.object({ userId: z.string().uuid(), role: z.enum(['ADMIN', 'MEMBER']) })

async function createUniqueProjectKey(projectName: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const projectKey = generateProjectKey(projectName)
    const existing = await prisma.project.findUnique({ where: { projectKey } })
    if (!existing) {
      return projectKey
    }
  }

  throw new ApiError(500, 'Unable to generate project key')
}

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }]
      },
      include: { members: { include: { user: true } }, tasks: true }
    })
    res.json(projects)
  } catch (error) {
    next(error)
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')
    const body = createProjectSchema.parse(req.body)
    const projectKey = await createUniqueProjectKey(body.name)
    const rawSecretKey = generateSecretKey()
    const hashedSecretKey = await hashSecretKey(rawSecretKey)

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        ownerId: user.id,
        projectKey,
        secretKey: hashedSecretKey,
        members: { create: { userId: user.id, role: 'ADMIN' } }
      }
    })

    res.status(201).json({
      ...project,
      secretKey: rawSecretKey,
      message: 'Save your secret key. It will not be shown again.'
    })
  } catch (error) {
    next(error)
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: { include: { user: true } }, tasks: { include: { assignee: true, createdBy: true } } }
    })
    if (!project) throw new ApiError(404, 'Project not found')
    res.json(project)
  } catch (error) {
    next(error)
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id
    const body = updateProjectSchema.parse(req.body)
    const updated = await prisma.project.update({ where: { id }, data: body })
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id
    await prisma.project.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id
    const body = addMemberSchema.parse(req.body)
    const exists = await prisma.projectMember.findFirst({ where: { projectId, userId: body.userId } })
    if (exists) throw new ApiError(400, 'Member already exists')
    const member = await prisma.projectMember.create({ data: { projectId, userId: body.userId, role: body.role } })
    res.status(201).json(member)
  } catch (error) {
    next(error)
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id
    const userId = req.params.userId
    await prisma.projectMember.deleteMany({ where: { projectId, userId } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function getProjectMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true }
    })

    res.json(members)
  } catch (error) {
    next(error)
  }
}

export async function regenerateProjectKey(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id
    const user = req.user
    if (!user) throw new ApiError(401, 'Unauthenticated')

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw new ApiError(404, 'Project not found')

    if (project.ownerId !== user.id) {
      const membership = await prisma.projectMember.findFirst({ where: { projectId, userId: user.id } })
      if (!membership || membership.role !== 'ADMIN') {
        throw new ApiError(403, 'Admin access required')
      }
    }

    const projectKey = await createUniqueProjectKey(project.name)
    const rawSecretKey = generateSecretKey()
    const hashedSecretKey = await hashSecretKey(rawSecretKey)

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        projectKey,
        secretKey: hashedSecretKey
      }
    })

    res.json({
      ...updatedProject,
      secretKey: rawSecretKey,
      message: 'Save your new secret key. The old one is no longer valid.'
    })
  } catch (error) {
    next(error)
  }
}
