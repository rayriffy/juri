import { PrismaClient } from "@prisma/client";

import { authenticateUserSession } from "../../../core/services/authenticateUserSession";
import { decodeBase64 } from "../../../core/services/decodeBase64";

import type { RequestHandler } from "@sveltejs/kit";
import type { Authenticator } from "../../../modules/app/@types/Authenticator";

export const GET: RequestHandler = async event => {
  try {
    const session = await authenticateUserSession(event)

    const prisma = new PrismaClient()
    const authenticators = await prisma.authenticator.findMany({
      where: {
        uid: session.id
      },
      select: {
        credentialId: true
      }
    })
    
    const payload: Authenticator[] = authenticators.map(authenticator => ({
      id: authenticator.credentialId
    }))

    return {
      status: 200,
      body: {
        message: 'ok',
        data: payload as any
      }
    }
  } catch (e) {
    return {
      status: 401,
      body: {
        message: 'unauthorized'
      }
    }
  }
}