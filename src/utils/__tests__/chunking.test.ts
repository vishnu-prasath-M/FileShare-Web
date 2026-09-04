import { describe, it, expect } from 'vitest'
import {
  calculateTotalChunks,
  encodeChunk,
  decodeChunk,
  DEFAULT_CHUNK_SIZE
} from '../chunking'

describe('chunking utils', () => {
  it('calculates total chunks correctly', () => {
    expect(calculateTotalChunks(0, DEFAULT_CHUNK_SIZE)).toBe(1)
    expect(calculateTotalChunks(1000, DEFAULT_CHUNK_SIZE)).toBe(1)
    expect(calculateTotalChunks(DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_SIZE)).toBe(1)
    expect(calculateTotalChunks(DEFAULT_CHUNK_SIZE + 1, DEFAULT_CHUNK_SIZE)).toBe(2)
    expect(calculateTotalChunks(DEFAULT_CHUNK_SIZE * 5, DEFAULT_CHUNK_SIZE)).toBe(5)
  })

  it('encodes and decodes binary chunks with lossless fidelity', () => {
    const fileId = 'abc123def456'
    const chunkIndex = 42
    const totalChunks = 100
    const rawData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    const encoded = encodeChunk(fileId, chunkIndex, totalChunks, rawData.buffer)
    const decoded = decodeChunk(encoded)

    expect(decoded.fileId).toBe(fileId)
    expect(decoded.chunkIndex).toBe(chunkIndex)
    expect(decoded.totalChunks).toBe(totalChunks)

    const decodedPayload = new Uint8Array(decoded.payload)
    expect(decodedPayload.length).toBe(rawData.length)
    for (let i = 0; i < rawData.length; i++) {
      expect(decodedPayload[i]).toBe(rawData[i])
    }
  })

  it('throws error when decoding truncated chunk', () => {
    const invalidBuffer = new ArrayBuffer(10) // Less than 24 bytes header
    expect(() => decodeChunk(invalidBuffer)).toThrow()
  })
})
