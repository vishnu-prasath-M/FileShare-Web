import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'

const PORT = process.env.PORT || 8787
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'DropLink Signaling Server is running' }))
})

const wss = new WebSocketServer({ server })
const rooms = new Map()

wss.on('connection', (ws) => {
  let currentPeer = null

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString())

      switch (msg.type) {
        case 'join-room': {
          const { roomId, peerId, deviceName, deviceType } = msg
          if (!roomId || !peerId) return

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map())
          }

          const room = rooms.get(roomId)
          if (room.size >= 10) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }))
            return
          }

          currentPeer = {
            id: peerId,
            ws,
            roomId,
            deviceName: deviceName || 'Unknown Device',
            deviceType: deviceType || 'laptop'
          }

          // Notify existing
          room.forEach((peer) => {
            if (peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(JSON.stringify({
                type: 'peer-joined',
                peerId,
                deviceName: currentPeer.deviceName,
                deviceType: currentPeer.deviceType
              }))
            }
          })

          room.set(peerId, currentPeer)

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
      console.error('Error handling message:', e)
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
            peerId: currentPeer.id
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

server.listen(PORT, () => {
  console.log(`DropLink Signaling Server running on port ${PORT}`)
})
