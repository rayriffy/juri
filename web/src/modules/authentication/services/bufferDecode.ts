export const bufferDecode = (input: string) =>
  Uint8Array.from(input, c => c.charCodeAt(0))
