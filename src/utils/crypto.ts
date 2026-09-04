/**
 * Calculates SHA-256 checksum of an ArrayBuffer or Blob using Web Crypto API
 */
export async function calculateSha256(data: ArrayBuffer | Blob): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return ''
  }

  let buffer: ArrayBuffer
  if (data instanceof Blob) {
    buffer = await data.arrayBuffer()
  } else {
    buffer = data
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
