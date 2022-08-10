import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

import type { RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async event => {
  const request: {
    username: string
  } = await event.request.json()

  // locate all authenticators for this user
  const prisma = new PrismaClient()
  const authenticators = await prisma.authenticator.findMany({
    where: {
      user: {
        username: request.username.toLowerCase(),
        registered: true,
      },
    },
    include: {
      user: {
        select: {
          uid: true,
        },
      },
    },
  })

  // if array is 0, means there's no user registered yet
  if (authenticators.length === 0) {
    return {
      status: 400,
      body: {
        message: 'this username has not been registered yet',
      },
    }
  }

  // generate random challenge
  const generatedChallenge = Buffer.from(crypto.randomBytes(32)).toString(
    'base64'
  )

  // push chalenge to temporary bin
  await prisma.challenge.upsert({
    where: {
      uid: authenticators[0].user.uid,
    },
    update: {
      challenge: generatedChallenge,
      createdAt: new Date(),
    },
    create: {
      uid: authenticators[0].user.uid,
      challenge: generatedChallenge,
    },
  })

  // build payload
  const payload = {
    challenge: generatedChallenge,
    allowCredentials: authenticators.map(authenticator => ({
      type: 'public-key',
      id: authenticator.credentialId,
      transports: ['usb', 'nfc', 'ble'],
    })),
  }

  await prisma.$disconnect()
  return {
    status: 200,
    body: {
      message: 'ok',
      data: payload,
    },
  }
}
