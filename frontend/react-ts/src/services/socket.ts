class SocketService {
  private socket: WebSocket | null = null

  connect(
    port: string,
    room: string,
    onOpen?: () => void,
    onError?: () => void
  ) {
    console.log('Tentando conectar...')

    this.socket = new WebSocket(
      `ws://localhost:${port}/ws/${room}`
    )

    this.socket.onopen = () => {
      console.log('✅ WebSocket conectado')

      if (onOpen) {
        onOpen()
      }
    }

    this.socket.onclose = () => {
      console.log('❌ WebSocket desconectado')
    }

    this.socket.onerror = (error) => {
      console.error('⚠️ WebSocket erro:', error)

      if (onError) {
        onError()
      }
    }
  }

  sendMessage(message: string) {
    if (
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      console.error('WebSocket não está conectado')
      return
    }

    this.socket.send(message)
  }

  onMessage(callback: (message: string) => void) {
    if (!this.socket) return

    this.socket.onmessage = (event) => {
      callback(event.data)
    }
  }

  disconnect() {
    this.socket?.close()
  }
}

export const socketService = new SocketService()