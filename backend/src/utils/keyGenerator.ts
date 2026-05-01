import bcrypt from 'bcrypt'
import { customAlphabet } from 'nanoid'

export function generateProjectKey(projectName: string): string {
  const prefix = projectName
    .split(' ')
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)
    .padEnd(2, 'X')

  const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 4)
  return `${prefix}-${nanoid()}`
}

export function generateSecretKey(): string {
  const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$', 12)
  return nanoid()
}

export async function hashSecretKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10)
}

export async function verifySecretKey(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}