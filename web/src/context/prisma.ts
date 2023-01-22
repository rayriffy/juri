import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')

import type { PrismaClient as TypedClient } from '@prisma/client'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: TypedClient | undefined
}

export const prisma: TypedClient =
  global.prisma ||
  new PrismaClient({
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
