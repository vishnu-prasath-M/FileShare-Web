import type { PeerDevice } from './device'

export type SignalingMessage =
  | {
      type: 'join-room'
      roomId: string
      peerId: string
      deviceName: string
      deviceType: string
    }
  | {
      type: 'room-joined'
      roomId: string
      peerId: string
      peers: PeerDevice[]
    }
  | {
      type: 'peer-joined'
      peerId: string
      deviceName: string
      deviceType: string
    }
  | {
      type: 'peer-left'
      peerId: string
    }
  | {
      type: 'signal'
      targetPeerId: string
      senderPeerId?: string
      data: any
    }
  | {
      type: 'ping'
    }
  | {
      type: 'pong'
    }
  | {
      type: 'error'
      message: string
    }

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'connected'
  | 'disconnected'
  | 'failed'
