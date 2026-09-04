/**
 * Cloudflare Worker for DropLink Ephemeral Signaling
 * Relays WebRTC SDP/ICE metadata. Never inspects or stores file payloads.
 */

export interface Env {
  SIGNALING_ROOMS: DurableObjectNamespace
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Health check endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          service: 'DropLink Signaling Server',
          status: 'online',
          version: '1.0.0',
          encryption: 'P2P WebRTC / Ephemeral Signaling'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    if (url.pathname === '/signaling' || url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade')
      if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
        return new Response('Expected WebSocket Upgrade', { status: 426 })
      }

      // Route to Durable Object based on room ID from query parameter or default pool
      const roomId = url.searchParams.get('room') || 'global'
      const id = env.SIGNALING_ROOMS.idFromName(roomId)
      const obj = env.SIGNALING_ROOMS.get(id)
      return obj.fetch(request)
    }

    return new Response('Not Found', { status: 404 })
  }
}

export class SignalingRoom {
  private state: DurableObjectState
  private sessions: Map<WebSocket, { peerId: string; roomId: string; deviceName: string; deviceType: string }> = new Map()

  constructor(state: DurableObjectState) {
    this.state = state
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)

    server.accept()

    server.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data as string)
        this.handleMessage(server, msg)
      } catch (err) {
        console.error('Worker message parse error', err)
      }
    })

    server.addEventListener('close', () => {
      this.handleDisconnect(server)
    })

    server.addEventListener('error', () => {
      this.handleDisconnect(server)
    })

    return new Response(null, {
      status: 101,
      webSocket: client
    })
  }

  private handleMessage(ws: WebSocket, msg: any) {
    switch (msg.type) {
      case 'join-room': {
        const { roomId, peerId, deviceName, deviceType } = msg
        if (!roomId || !peerId) return

        this.sessions.set(ws, { roomId, peerId, deviceName: deviceName || 'Unknown Device', deviceType: deviceType || 'laptop' })

        // Inform other peers in this room
        for (const [otherWs, peer] of this.sessions.entries()) {
          if (otherWs !== ws && peer.roomId === roomId) {
            try {
              otherWs.send(JSON.stringify({
                type: 'peer-joined',
                peerId,
                deviceName,
                deviceType
              }))
            } catch {}
          }
        }

        // Return current peers in room to newly joined peer
        const currentPeers = Array.from(this.sessions.values())
          .filter((p) => p.roomId === roomId && p.peerId !== peerId)
          .map((p) => ({
            peerId: p.peerId,
            deviceName: p.deviceName,
            deviceType: p.deviceType
          }))

        ws.send(JSON.stringify({
          type: 'room-joined',
          roomId,
          peerId,
          peers: currentPeers
        }))
        break
      }

      case 'signal': {
        const { targetPeerId, data } = msg
        const sender = this.sessions.get(ws)
        if (!sender || !targetPeerId) return

        for (const [otherWs, peer] of this.sessions.entries()) {
          if (peer.peerId === targetPeerId && peer.roomId === sender.roomId) {
            try {
              otherWs.send(JSON.stringify({
                type: 'signal',
                senderPeerId: sender.peerId,
                data
              }))
            } catch {}
            break
          }
        }
        break
      }

      case 'ping': {
        try {
          ws.send(JSON.stringify({ type: 'pong' }))
        } catch {}
        break
      }
    }
  }

  private handleDisconnect(ws: WebSocket) {
    const peer = this.sessions.get(ws)
    if (!peer) return

    this.sessions.delete(ws)

    // Notify other peers in room
    for (const [otherWs, otherPeer] of this.sessions.entries()) {
      if (otherPeer.roomId === peer.roomId) {
        try {
          otherWs.send(JSON.stringify({
            type: 'peer-left',
            peerId: peer.peerId
          }))
        } catch {}
      }
    }
  }
}
