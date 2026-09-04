export type TransferItemStatus =
  | 'waiting'
  | 'preparing'
  | 'sending'
  | 'receiving'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface FileMetadata {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  totalChunks: number
  chunkSize: number
  lastModified?: number
  hash?: string
}

export interface TransferFileItem {
  id: string
  file?: File
  name: string
  size: number
  type: string
  status: TransferItemStatus
  progress: number // 0 to 100
  transferredBytes: number
  speed: number // bytes per sec
  eta: number // remaining seconds
  error?: string
  blobUrl?: string
  previewUrl?: string
  isFolder?: boolean
  relativePath?: string
}

export type DataChannelMessage =
  | {
      type: 'FILE_METADATA'
      metadata: FileMetadata
    }
  | {
      type: 'FILE_ACK'
      fileId: string
      receivedChunks: number
    }
  | {
      type: 'FILE_END'
      fileId: string
      hash?: string
    }
  | {
      type: 'TRANSFER_CANCEL'
      fileId?: string
      reason?: string
    }
  | {
      type: 'DEVICE_INFO'
      deviceName: string
      deviceType: string
    }
