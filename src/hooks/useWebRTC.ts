import { useState, useEffect, useRef, useCallback } from 'react'
import { SignalingService } from '../services/signaling'
import { WebRTCConnection } from '../services/webrtc'
import { FileTransferEngine } from '../services/fileTransfer'
import type { DeviceInfo, PeerDevice } from '../types/device'
import type { ConnectionStatus } from '../types/signaling'
import { generatePairingCode, normalizePairingCode } from '../utils/session'

export function useWebRTC(device: DeviceInfo) {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [connectedPeer, setConnectedPeer] = useState<PeerDevice | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDataChannelReady, setIsDataChannelReady] = useState(false)

  const signalingRef = useRef<SignalingService | null>(null)
  const connectionRef = useRef<WebRTCConnection | null>(null)
  const engineRef = useRef<FileTransferEngine | null>(null)

  // Initialize signaling service
  useEffect(() => {
    const signaling = new SignalingService()
    signalingRef.current = signaling

    signaling.on('connected', () => {
      // Signaling WS connected
    })

    signaling.on('disconnected', () => {
      // Signaling WS disconnected
    })

    signaling.on('room-joined', ({ roomId: joinedRoomId, peers }: { roomId: string; peers: PeerDevice[] }) => {
      setRoomId(joinedRoomId)
      setStatus('waiting')
      setErrorMessage(null)

      // If peer already in room, initiate WebRTC connection deterministically
      if (peers.length > 0) {
        const peer = peers[0]
        const isInitiator = device.peerId < peer.peerId
        initiateWebRTCConnection(peer.peerId, isInitiator)
        setConnectedPeer(peer)
      }
    })

    signaling.on('peer-joined', (peer: PeerDevice) => {
      setConnectedPeer(peer)
      // Lexical tie-breaker to decide initiator
      const isInitiator = device.peerId < peer.peerId
      initiateWebRTCConnection(peer.peerId, isInitiator)
    })

    signaling.on('peer-left', () => {
      setConnectedPeer(null)
      setIsDataChannelReady(false)
      cleanupWebRTC()
      setStatus('waiting')
    })

    signaling.on('signal', async ({ data }: { senderPeerId?: string; data: any }) => {
      if (connectionRef.current) {
        await connectionRef.current.handleSignal(data)
      }
    })

    signaling.on('error', (msg: string) => {
      setErrorMessage(msg)
      setStatus('failed')
    })

    signaling.connect().catch((err) => {
      console.warn('Initial signaling connection attempt failed, will auto-reconnect:', err)
    })

    return () => {
      cleanupWebRTC()
      signaling.disconnect()
    }
  }, [device.peerId])

  const initiateWebRTCConnection = useCallback((remotePeerId: string, isInitiator: boolean) => {
    cleanupWebRTC()

    if (!signalingRef.current) return

    setStatus('connecting')
    const conn = new WebRTCConnection(signalingRef.current, remotePeerId, isInitiator)
    connectionRef.current = conn

    conn.on('channel-open', () => {
      setStatus('connected')
      setIsDataChannelReady(true)
      const engine = new FileTransferEngine(conn)
      engineRef.current = engine
    })

    conn.on('channel-close', () => {
      setIsDataChannelReady(false)
      setStatus('disconnected')
    })

    conn.on('channel-error', () => {
      setStatus('failed')
      setErrorMessage('Direct data connection error')
    })

    conn.on('connectionstatechange', (state) => {
      if (state === 'failed') {
        setStatus('failed')
        setErrorMessage('Failed to establish direct peer connection (NAT traversal limitation)')
      } else if (state === 'disconnected') {
        setStatus('disconnected')
      }
    })

    if (isInitiator) {
      setTimeout(() => {
        conn.startConnection()
      }, 100)
    }
  }, [])

  const cleanupWebRTC = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy()
      engineRef.current = null
    }
    if (connectionRef.current) {
      connectionRef.current.close()
      connectionRef.current = null
    }
    setIsDataChannelReady(false)
  }, [])

  const createSession = useCallback(() => {
    cleanupWebRTC()
    const code = generatePairingCode()
    setRoomId(code)
    setStatus('waiting')
    setErrorMessage(null)
    setConnectedPeer(null)

    if (signalingRef.current) {
      signalingRef.current.joinRoom(code, device)
    }
    return code
  }, [device, cleanupWebRTC])

  const joinSession = useCallback((code: string) => {
    cleanupWebRTC()
    const cleanCode = normalizePairingCode(code)
    if (!cleanCode) return

    setRoomId(cleanCode)
    setStatus('connecting')
    setErrorMessage(null)
    setConnectedPeer(null)

    if (signalingRef.current) {
      signalingRef.current.joinRoom(cleanCode, device)
    }
  }, [device, cleanupWebRTC])

  const leaveSession = useCallback(() => {
    cleanupWebRTC()
    setRoomId(null)
    setConnectedPeer(null)
    setStatus('idle')
    setErrorMessage(null)
  }, [cleanupWebRTC])

  return {
    status,
    roomId,
    connectedPeer,
    errorMessage,
    isDataChannelReady,
    transferEngine: engineRef.current,
    createSession,
    joinSession,
    leaveSession
  }
}
