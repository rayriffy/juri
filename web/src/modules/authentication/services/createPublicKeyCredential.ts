import { bufferDecode } from './bufferDecode'
import { simplifiedFetch } from '../../../core/services/simplifiedFetch'

export const createPublicKeyCredential = async (username: string) => {
  // get random generated challenge
  let urlParams = new URLSearchParams({
    username,
  })
  const preCredential = await simplifiedFetch(
    `/api/makeCredential?${urlParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  console.log('preCredential', preCredential)

  // build option
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
    {
      challenge: bufferDecode(preCredential.data.challenge),
      rp: {
        name: 'RAYRIFFY',
        id: 'localhost',
      },
      // rp: {
      //   name: 'RAYRIFFY',
      //   id: 'rayriffy.com',
      // },
      user: {
        id: bufferDecode(preCredential.data.uid),
        name: username.toLowerCase(),
        displayName: username.toLowerCase(),
      },
      pubKeyCredParams: [
        /**
         * https://www.w3.org/TR/webauthn-2/#typedefdef-cosealgorithmidentifier
         */

        // ES256: ECDSA with SHA256
        { alg: -7, type: 'public-key' },
        // RS256: RSA Signature with SHA256
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      attestation: 'direct',
    }

  console.log(
    'publicKeyCredentialCreationOptions',
    publicKeyCredentialCreationOptions
  )
  // request credential
  return navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  }) as Promise<PublicKeyCredential | null>
}
