import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL est introuvable')
}

const globalPourPrisma = globalThis

function creerClient() {
  const adapter = new PrismaNeon({ connectionString })

  return new PrismaClient({ adapter })
}

export const prisma =
  globalPourPrisma.prisma ?? creerClient()

if (process.env.NODE_ENV !== 'production') {
  globalPourPrisma.prisma = prisma
}