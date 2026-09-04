import type { SignalingMessage } from '../types/signaling'
import type { DeviceInfo } from '../types/device'

export type SignalingEventCallback = (payload: any) => void

export class SignalingService {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, Set<SignalingEventCallback>> = new Map()
  private pingInterval: number | null = null
  private reconnectTimer: number | null = null
  private isIntentionalClose = false
  private currentRoomId: string | null = null
  private currentDevice: DeviceInfo | null = null

  constructor(customUrl?: string) {
    if (customUrl) {
      this.url = customUrl
    } else if (import.meta.env.VITE_SIGNALING_URL) {
      this.url = import.meta.env.VITE_SIGNALING_URL
    } else if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      this.url = `${protocol}//${window.location.host}/signaling`
    } else {
      this.url = 'ws://localhost:5173/signaling'
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isIntentionalClose = false
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.emit('connected', null)
          this.startHeartbeat()
          // If we had a room and device, rejoin after reconnection
          if (this.currentRoomId && this.currentDevice) {
            this.joinRoom(this.currentRoomId, this.currentDevice)
          }
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const msg: SignalingMessage = JSON.parse(event.data)
            this.handleMessage(msg)
          } catch (err) {
            console.error('[Signaling] Malformed message', err)
          }
        }

        this.ws.onclose = () => {
          this.stopHeartbeat()
          this.emit('disconnected', null)
          if (!this.isIntentionalClose) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (err) => {
          this.emit('error', 'Connection error')
          reject(err)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  private handleMessage(msg: SignalingMessage) {
    switch (msg.type) {
      case 'room-joined':
        this.emit('room-joined', { roomId: msg.roomId, peerId: msg.peerId, peers: msg.peers })
        break
      case 'peer-joined':
        this.emit('peer-joined', {
          peerId: msg.peerId,
          deviceName: msg.deviceName,
          deviceType: msg.deviceType
        })
        break
      case 'peer-left':
        this.emit('peer-left', { peerId: msg.peerId })
        break
      case 'signal':
        this.emit('signal', { senderPeerId: msg.senderPeerId, data: msg.data })
        break
      case 'error':
        this.emit('error', msg.message)
        break
      case 'pong':
        break
    }
  }

  public joinRoom(roomId: string, deviceInfo: DeviceInfo) {
    this.currentRoomId = roomId
    this.currentDevice = deviceInfo
    this.send({
      type: 'join-room',
      roomId,
      peerId: deviceInfo.peerId,
      deviceName: deviceInfo.name,
      deviceType: deviceInfo.type
    })
  }

  public sendSignal(targetPeerId: string, data: any) {
    this.send({
      type: 'signal',
      targetPeerId,
      data
    })
  }

  private send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.pingInterval = window.setInterval(() => {
      this.send({ type: 'ping' })
    }, 20000)
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(() => {})
    }, 3000)
  }

  public on(event: string, callback: SignalingEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    return () => this.off(event, callback)
  }

  public off(event: string, callback: SignalingEventCallback) {
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

  public disconnect() {
    this.isIntentionalClose = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.currentRoomId = null
    this.currentDevice = null
    this.listeners.clear()
  }
}
