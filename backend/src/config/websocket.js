import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import { parse } from 'url'

const clients = new Map() // userId -> Set<ws>

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws, req) => {
    const { query } = parse(req.url, true)
    const token = query.token

    if (!token) { ws.close(1008, 'No token'); return }

    let userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.id
    } catch {
      ws.close(1008, 'Invalid token')
      return
    }

    if (!clients.has(userId)) clients.set(userId, new Set())
    clients.get(userId).add(ws)

    ws.on('close', () => {
      clients.get(userId)?.delete(ws)
      if (!clients.get(userId)?.size) clients.delete(userId)
    })

    ws.send(JSON.stringify({ type: 'connected', data: { userId } }))
  })

  return wss
}

export function sendToUser(userId, type, data) {
  const userClients = clients.get(String(userId))
  if (!userClients) return
  const payload = JSON.stringify({ type, data })
  userClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(payload)
  })
}
