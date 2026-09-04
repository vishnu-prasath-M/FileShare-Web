import { WebRTCConnection } from './webrtc'
import type {
  FileMetadata,
  TransferFileItem,
  DataChannelMessage,
  TransferItemStatus
} from '../types/transfer'
import {
  DEFAULT_CHUNK_SIZE,
  calculateTotalChunks,
  encodeChunk,
  decodeChunk
} from '../utils/chunking'
import { calculateSha256 } from '../utils/crypto'
import { sanitizeFileName } from '../utils/formatting'

export type FileTransferCallback = (payload: any) => void

interface ReceivingFileState {
  metadata: FileMetadata
  chunks: (ArrayBuffer | null)[]
  receivedChunksCount: number
  receivedBytes: number
  startTime: number
  lastProgressTime: number
  lastBytes: number
  currentSpeed: number
}

export class FileTransferEngine {
  private conn: WebRTCConnection
  private listeners: Map<string, Set<FileTransferCallback>> = new Map()
  private receivingFiles: Map<string, ReceivingFileState> = new Map()
  private isSendingCancelled = false
  private activeSendingFileId: string | null = null

  constructor(conn: WebRTCConnection) {
    this.conn = conn
    this.setupListeners()
  }

  private setupListeners() {
    this.conn.on('message', (data: any) => {
      if (typeof data === 'string') {
        try {
          const msg: DataChannelMessage = JSON.parse(data)
          this.handleControlMessage(msg)
        } catch (e) {
          console.error('Failed to parse DataChannel message:', e)
        }
      } else if (data instanceof ArrayBuffer) {
        this.handleBinaryChunk(data)
      }
    })
  }

  private handleControlMessage(msg: DataChannelMessage) {
    switch (msg.type) {
      case 'FILE_METADATA': {
        const meta = msg.metadata
        const state: ReceivingFileState = {
          metadata: meta,
          chunks: new Array(meta.totalChunks).fill(null),
          receivedChunksCount: 0,
          receivedBytes: 0,
          startTime: Date.now(),
          lastProgressTime: Date.now(),
          lastBytes: 0,
          currentSpeed: 0
        }
        this.receivingFiles.set(meta.fileId, state)

        this.emit('file-received-start', {
          id: meta.fileId,
          name: sanitizeFileName(meta.fileName),
          size: meta.fileSize,
          type: meta.mimeType,
          status: 'receiving' as TransferItemStatus,
          progress: 0,
          transferredBytes: 0,
          speed: 0,
          eta: 0
        })
        break
      }

      case 'FILE_END': {
        this.finalizeReceivedFile(msg.fileId, msg.hash)
        break
      }

      case 'TRANSFER_CANCEL': {
        if (msg.fileId) {
          this.receivingFiles.delete(msg.fileId)
        } else {
          this.receivingFiles.clear()
        }
        this.emit('transfer-cancelled', { fileId: msg.fileId, reason: msg.reason })
        break
      }
    }
  }

  private async handleBinaryChunk(buffer: ArrayBuffer) {
    try {
      const { fileId, chunkIndex, totalChunks, payload } = decodeChunk(buffer)
      const state = this.receivingFiles.get(fileId)
      if (!state) return

      if (state.chunks[chunkIndex] === null) {
        state.chunks[chunkIndex] = payload
        state.receivedChunksCount++
        state.receivedBytes += payload.byteLength

        // Calculate progress & smoothed speed
        const now = Date.now()
        const elapsedSinceLast = (now - state.lastProgressTime) / 1000
        if (elapsedSinceLast >= 0.2 || state.receivedChunksCount === totalChunks) {
          const deltaBytes = state.receivedBytes - state.lastBytes
          const instantSpeed = elapsedSinceLast > 0 ? deltaBytes / elapsedSinceLast : 0
          state.currentSpeed = state.currentSpeed === 0 ? instantSpeed : state.currentSpeed * 0.7 + instantSpeed * 0.3
          state.lastBytes = state.receivedBytes
          state.lastProgressTime = now

          const remainingBytes = Math.max(0, state.metadata.fileSize - state.receivedBytes)
          const eta = state.currentSpeed > 0 ? remainingBytes / state.currentSpeed : 0
          const progress = Math.min(100, Math.round((state.receivedBytes / state.metadata.fileSize) * 100))

          this.emit('file-received-progress', {
            fileId,
            progress,
            transferredBytes: state.receivedBytes,
            totalBytes: state.metadata.fileSize,
            speed: state.currentSpeed,
            eta
          })
        }
      }
    } catch (e) {
      console.error('Failed to handle incoming chunk:', e)
    }
  }

  private async finalizeReceivedFile(fileId: string, expectedHash?: string) {
    const state = this.receivingFiles.get(fileId)
    if (!state) return

    // Check completeness
    const missingChunks = state.chunks.some((c) => c === null)
    if (missingChunks) {
      this.emit('file-received-failed', {
        fileId,
        error: 'Incomplete file transfer: some chunks were lost'
      })
      this.receivingFiles.delete(fileId)
      return
    }

    // Assemble blob
    const safeChunks = state.chunks as ArrayBuffer[]
    const blob = new Blob(safeChunks, { type: state.metadata.mimeType || 'application/octet-stream' })

    // Verify hash if provided
    if (expectedHash) {
      try {
        const actualHash = await calculateSha256(blob)
        if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
          this.emit('file-received-failed', {
            fileId,
            error: 'File verification failed: SHA-256 checksum mismatch'
          })
          this.receivingFiles.delete(fileId)
          return
        }
      } catch (err) {
        console.warn('Hash verification could not be performed:', err)
      }
    }

    const blobUrl = URL.createObjectURL(blob)
    const sanitizedName = sanitizeFileName(state.metadata.fileName)

    this.emit('file-received-complete', {
      id: fileId,
      name: sanitizedName,
      size: state.metadata.fileSize,
      type: state.metadata.mimeType,
      status: 'completed' as TransferItemStatus,
      progress: 100,
      transferredBytes: state.metadata.fileSize,
      blobUrl,
      blob
    })

    this.receivingFiles.delete(fileId)
  }

  public async sendFiles(files: File[], onProgress?: (update: Partial<TransferFileItem>) => void): Promise<boolean> {
    this.isSendingCancelled = false

    for (const file of files) {
      if (this.isSendingCancelled) break
      const success = await this.sendFile(file, onProgress)
      if (!success && this.isSendingCancelled) {
        break
      }
    }

    return !this.isSendingCancelled
  }

  public async sendFile(
    file: File,
    onProgress?: (update: Partial<TransferFileItem>) => void
  ): Promise<boolean> {
    const fileId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-8)
    this.activeSendingFileId = fileId
    const chunkSize = DEFAULT_CHUNK_SIZE
    const totalChunks = calculateTotalChunks(file.size, chunkSize)

    // Send metadata
    const metadata: FileMetadata = {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      totalChunks,
      chunkSize,
      lastModified: file.lastModified
    }

    this.conn.send(JSON.stringify({ type: 'FILE_METADATA', metadata }))

    onProgress?.({
      id: fileId,
      status: 'sending',
      progress: 0,
      transferredBytes: 0,
      speed: 0,
      eta: 0
    })

    let transferredBytes = 0
    const startTime = Date.now()
    let lastTime = startTime
    let lastBytes = 0
    let smoothedSpeed = 0

    // Read and send chunks incrementally using slice()
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (this.isSendingCancelled) {
        this.conn.send(JSON.stringify({ type: 'TRANSFER_CANCEL', fileId, reason: 'Sender cancelled' }))
        onProgress?.({
          id: fileId,
          status: 'cancelled',
          error: 'Transfer cancelled'
        })
        return false
      }

      const start = chunkIndex * chunkSize
      const end = Math.min(file.size, start + chunkSize)
      const sliceBlob = file.slice(start, end)
      const chunkBuffer = await sliceBlob.arrayBuffer()

      // Apply backpressure if buffer > 1MB
      if (this.conn.getBufferedAmount() > 1024 * 1024) {
        await this.conn.waitForBufferedAmountLow()
      }

      const packet = encodeChunk(fileId, chunkIndex, totalChunks, chunkBuffer)
      const sent = this.conn.send(packet)
      if (!sent) {
        onProgress?.({
          id: fileId,
          status: 'failed',
          error: 'DataChannel disconnected or failed to send'
        })
        return false
      }

      transferredBytes += chunkBuffer.byteLength

      const now = Date.now()
      const deltaSec = (now - lastTime) / 1000
      if (deltaSec >= 0.15 || chunkIndex === totalChunks - 1) {
        const deltaBytes = transferredBytes - lastBytes
        const currentSpeed = deltaSec > 0 ? deltaBytes / deltaSec : 0
        smoothedSpeed = smoothedSpeed === 0 ? currentSpeed : smoothedSpeed * 0.7 + currentSpeed * 0.3
        lastTime = now
        lastBytes = transferredBytes

        const remainingBytes = Math.max(0, file.size - transferredBytes)
        const eta = smoothedSpeed > 0 ? remainingBytes / smoothedSpeed : 0
        const progress = Math.min(100, Math.round((transferredBytes / file.size) * 100))

        onProgress?.({
          id: fileId,
          status: 'sending',
          progress,
          transferredBytes,
          speed: smoothedSpeed,
          eta
        })
      }
    }

    // Calculate optional SHA-256 for integrity verification
    let hash = ''
    try {
      hash = await calculateSha256(file)
    } catch {}

    // Send FILE_END
    this.conn.send(JSON.stringify({ type: 'FILE_END', fileId, hash }))

    onProgress?.({
      id: fileId,
      status: 'completed',
      progress: 100,
      transferredBytes: file.size,
      speed: 0,
      eta: 0
    })

    this.activeSendingFileId = null
    return true
  }

  public cancelTransfer() {
    this.isSendingCancelled = true
    if (this.activeSendingFileId) {
      this.conn.send(
        JSON.stringify({
          type: 'TRANSFER_CANCEL',
          fileId: this.activeSendingFileId,
          reason: 'Cancelled by user'
        })
      )
      this.activeSendingFileId = null
    } else {
      this.conn.send(
        JSON.stringify({
          type: 'TRANSFER_CANCEL',
          reason: 'Cancelled by user'
        })
      )
    }
  }

  public on(event: string, callback: FileTransferCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    return () => this.off(event, callback)
  }

  public off(event: string, callback: FileTransferCallback) {
    const list = this.listeners.get(event)
    if (list) {
      list.delete(callback)
    }
  }

  private emit(event: string, payload: any) {
    const list = this.listeners.get(event)
    if (list) {
      list.forEach((cb) => cb(payload))
    }
  }

  public destroy() {
    this.isSendingCancelled = true
    this.receivingFiles.clear()
    this.listeners.clear()
  }
}
