import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '../../.env' })

let prismaInstance: PrismaClient | null = null

function getPrismaClient() {
  if (prismaInstance) {
    return prismaInstance
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  prismaInstance = new PrismaClient({ adapter })

  return prismaInstance
}

// Global singleton pattern for development
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export * from '@prisma/client'
