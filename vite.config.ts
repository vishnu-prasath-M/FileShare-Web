import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { Duplex } from 'stream'

interface Peer {
  id: string
  ws: WebSocket
  roomId: string
  deviceName: string
  deviceType: string
  lastSeen: number
}

// In-memory rooms for dev server signaling
const rooms = new Map<string, Map<string, Peer>>()

function signalingPlugin() {
  return {
    name: 'droplink-signaling',
    configureServer(server: any) {
      const wss = new WebSocketServer({ noServer: true })

      wss.on('connection', (ws: WebSocket) => {
        let currentPeer: Peer | null = null

        ws.on('message', (messageRaw: string) => {
          try {
            const msg = JSON.parse(messageRaw.toString())

            switch (msg.type) {
              case 'join-room': {
                const { roomId, peerId, deviceName, deviceType } = msg
                if (!roomId || !peerId) return

                if (!rooms.has(roomId)) {
                  rooms.set(roomId, new Map())
                }

                const room = rooms.get(roomId)!
                if (room.size >= 10) {
                  ws.send(JSON.stringify({ type: 'error', message: 'Room is full (max 10 peers)' }))
                  return
                }

                currentPeer = {
                  id: peerId,
                  ws,
                  roomId,
                  deviceName: deviceName || 'Unknown Device',
                  deviceType: deviceType || 'laptop',
                  lastSeen: Date.now()
                }

                // Notify existing peers
                room.forEach((peer) => {
                  if (peer.ws.readyState === WebSocket.OPEN) {
                    peer.ws.send(JSON.stringify({
                      type: 'peer-joined',
                      peerId,
                      deviceName: currentPeer?.deviceName,
                      deviceType: currentPeer?.deviceType
                    }))
                  }
                })

                // Add to room
                room.set(peerId, currentPeer)

                // Send current peers to new peer
                const existingPeers = Array.from(room.values())
                  .filter((p) => p.id !== peerId)
                  .map((p) => ({
                    peerId: p.id,
                    deviceName: p.deviceName,
                    deviceType: p.deviceType
                  }))

                ws.send(JSON.stringify({
                  type: 'room-joined',
                  roomId,
                  peerId,
                  peers: existingPeers
                }))
                break
              }

              case 'signal': {
                const { targetPeerId, data } = msg
                if (!currentPeer || !targetPeerId) return

                const room = rooms.get(currentPeer.roomId)
                if (!room) return

                const target = room.get(targetPeerId)
                if (target && target.ws.readyState === WebSocket.OPEN) {
                  target.ws.send(JSON.stringify({
                    type: 'signal',
                    senderPeerId: currentPeer.id,
                    data
                  }))
                }
                break
              }

              case 'ping': {
                ws.send(JSON.stringify({ type: 'pong' }))
                break
              }
            }
          } catch (e) {
            console.error('Failed to parse signaling message:', e)
          }
        })

        const cleanup = () => {
          if (!currentPeer) return
          const room = rooms.get(currentPeer.roomId)
          if (room) {
            room.delete(currentPeer.id)
            room.forEach((peer) => {
              if (peer.ws.readyState === WebSocket.OPEN) {
                peer.ws.send(JSON.stringify({
                  type: 'peer-left',
                  peerId: currentPeer?.id
                }))
              }
            })
            if (room.size === 0) {
              rooms.delete(currentPeer.roomId)
            }
          }
          currentPeer = null
        }

        ws.on('close', cleanup)
        ws.on('error', cleanup)
      })

      server.httpServer?.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
        const url = new URL(request.url || '', `http://${request.headers.host}`)
        if (url.pathname === '/signaling') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request)
          })
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), signalingPlugin()],
  server: {
    host: true,
    port: 5173
  },
  // @ts-ignore
  test: {
    globals: true,
    environment: 'node'
  }
})
