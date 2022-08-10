import base64js from 'base64-js'

export const bufferEncode = (input: Uint8Array) =>
  base64js
    .fromByteArray(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
