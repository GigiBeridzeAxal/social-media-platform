class SocketService {
  constructor() {
    this.ws = null
    this.listeners = {}
  }

  connect(userId) {
    const url = (import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001').replace(/^http/, 'ws')
    this.ws = new WebSocket(`${url}/ws?userId=${userId}`)
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      this.listeners[type]?.forEach(cb => cb(data))
    }
    this.ws.onclose = () => setTimeout(() => this.connect(userId), 3000)
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback) || []
  }

  send(type, data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

export default new SocketService()
