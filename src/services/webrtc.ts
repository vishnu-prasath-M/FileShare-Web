import { SignalingService } from './signaling'

export interface RTCConfigOptions {
  iceServers?: RTCIceServer[]
}

export type WebRTCEventCallback = (payload: any) => void

export class WebRTCConnection {
  public peerConnection: RTCPeerConnection | null = null
  public dataChannel: RTCDataChannel | null = null
  private signaling: SignalingService
  private remotePeerId: string
  private isInitiator: boolean
  private listeners: Map<string, Set<WebRTCEventCallback>> = new Map()
  private iceCandidateQueue: RTCIceCandidateInit[] = []
  private iceServers: RTCIceServer[]

  constructor(signaling: SignalingService, remotePeerId: string, isInitiator: boolean, options?: RTCConfigOptions) {
    this.signaling = signaling
    this.remotePeerId = remotePeerId
    this.isInitiator = isInitiator

    const defaultIceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]

    // Read environment STUN/TURN if present
    if (import.meta.env.VITE_STUN_SERVERS) {
      try {
        const parsed = JSON.parse(import.meta.env.VITE_STUN_SERVERS)
        if (Array.isArray(parsed)) defaultIceServers.push(...parsed)
      } catch {}
    }

    this.iceServers = options?.iceServers || defaultIceServers
    this.init()
  }

  private init() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    })

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendSignal(this.remotePeerId, {
          type: 'candidate',
          candidate: event.candidate.toJSON()
        })
      }
    }

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      this.emit('connectionstatechange', state)
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        this.emit('disconnected', state)
      } else if (state === 'connected') {
        this.emit('connected', null)
      }
    }

    if (this.isInitiator) {
      // Create DataChannel
      this.dataChannel = this.peerConnection.createDataChannel('droplink-transfer', {
        ordered: true
      })
      this.setupDataChannel(this.dataChannel)
    } else {
      // Wait for DataChannel
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel
        this.setupDataChannel(this.dataChannel)
      }
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.binaryType = 'arraybuffer'
    // Set 256KB low threshold for backpressure
    channel.bufferedAmountLowThreshold = 256 * 1024

    channel.onopen = () => {
      this.emit('channel-open', null)
    }

    channel.onclose = () => {
      this.emit('channel-close', null)
    }

    channel.onerror = (err) => {
      this.emit('channel-error', err)
    }

    channel.onmessage = (event) => {
      this.emit('message', event.data)
    }
  }

  public async startConnection() {
    if (!this.peerConnection) return
    if (this.isInitiator) {
      try {
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        this.signaling.sendSignal(this.remotePeerId, {
          type: 'offer',
          sdp: offer
        })
      } catch (err) {
        console.error('Failed to create offer:', err)
        this.emit('error', err)
      }
    }
  }

  public async handleSignal(signalData: any) {
    if (!this.peerConnection) return

    try {
      if (signalData.type === 'offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp))
        // Process queued ICE candidates
        while (this.iceCandidateQueue.length > 0) {
          const candidate = this.iceCandidateQueue.shift()
          if (candidate) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
        }
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        this.signaling.sendSignal(this.remotePeerId, {
          type: 'answer',
          sdp: answer
        })
      } else if (signalData.type === 'answer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp))
        while (this.iceCandidateQueue.length > 0) {
          const candidate = this.iceCandidateQueue.shift()
          if (candidate) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
        }
      } else if (signalData.type === 'candidate' && signalData.candidate) {
        if (this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(signalData.candidate))
        } else {
          this.iceCandidateQueue.push(signalData.candidate)
        }
      }
    } catch (err) {
      console.error('Error handling WebRTC signal:', err)
    }
  }

  public send(data: string | ArrayBuffer) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(data as any)
      return true
    }
    return false
  }

  public getBufferedAmount(): number {
    return this.dataChannel ? this.dataChannel.bufferedAmount : 0
  }

  public waitForBufferedAmountLow(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.dataChannel || this.dataChannel.bufferedAmount <= this.dataChannel.bufferedAmountLowThreshold) {
        resolve()
        return
      }

      const onLow = () => {
        if (this.dataChannel) {
          this.dataChannel.removeEventListener('bufferedamountlow', onLow)
        }
        resolve()
      }

      this.dataChannel.addEventListener('bufferedamountlow', onLow)
    })
  }

  public on(event: string, callback: WebRTCEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    return () => this.off(event, callback)
  }

  public off(event: string, callback: WebRTCEventCallback) {
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

  public close() {
    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    this.iceCandidateQueue = []
    this.listeners.clear()
  }
}
