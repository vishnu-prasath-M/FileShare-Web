export const DEFAULT_CHUNK_SIZE = 64 * 1024 // 64 KB
export const HEADER_SIZE = 24 // 16 bytes fileId + 4 bytes chunkIndex + 4 bytes totalChunks
export const FILE_ID_LENGTH = 16

/**
 * Calculates total number of chunks for a file
 */
export function calculateTotalChunks(fileSize: number, chunkSize: number = DEFAULT_CHUNK_SIZE): number {
  if (fileSize <= 0) return 1
  return Math.ceil(fileSize / chunkSize)
}

/**
 * Prepares a 24-byte binary header with payload for DataChannel
 */
export function encodeChunk(
  fileId: string,
  chunkIndex: number,
  totalChunks: number,
  payload: ArrayBuffer
): ArrayBuffer {
  const packet = new Uint8Array(HEADER_SIZE + payload.byteLength)
  const view = new DataView(packet.buffer)

  // 16-byte File ID
  const encoder = new TextEncoder()
  const idBytes = encoder.encode(fileId.slice(0, FILE_ID_LENGTH))
  packet.set(idBytes, 0)

  // 4-byte chunk index (offset 16)
  view.setUint32(16, chunkIndex, false)

  // 4-byte total chunks (offset 20)
  view.setUint32(20, totalChunks, false)

  // Payload (offset 24)
  packet.set(new Uint8Array(payload), HEADER_SIZE)

  return packet.buffer
}

/**
 * Decodes the 24-byte header and extracts payload
 */
export function decodeChunk(buffer: ArrayBuffer): {
  fileId: string
  chunkIndex: number
  totalChunks: number
  payload: ArrayBuffer
} {
  if (buffer.byteLength < HEADER_SIZE) {
    throw new Error('Chunk buffer is smaller than required header size')
  }

  const view = new DataView(buffer)
  const idBytes = new Uint8Array(buffer, 0, FILE_ID_LENGTH)
  const decoder = new TextDecoder()
  // Trim null bytes
  let nullIdx = idBytes.indexOf(0)
  if (nullIdx === -1) nullIdx = FILE_ID_LENGTH
  const fileId = decoder.decode(idBytes.subarray(0, nullIdx))

  const chunkIndex = view.getUint32(16, false)
  const totalChunks = view.getUint32(20, false)
  const payload = buffer.slice(HEADER_SIZE)

  return {
    fileId,
    chunkIndex,
    totalChunks,
    payload
  }
}
