import { useState } from 'react'

import ConnectionForm from '@/components/ConnectionForm'
import { socketService } from './services/socket'

type ConnectionData = {
  username: string
  room: string
  port: string
}

export default function App() {
  const [connection, setConnection] =
    useState<ConnectionData | null>(null)

function handleConnect(
  username: string,
  room: string,
  port: string
) {
  socketService.connect(
    port,
    room,

    () => {
      setConnection({
        username,
        room,
        port,
      })
    },

    () => {
      alert('Não foi possível conectar ao servidor')
    }
  )
}

  return (
    <main className="h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      {!connection ? (
        <ConnectionForm onConnect={handleConnect} />
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Conectado 🎉
          </h1>

          <div className="text-slate-400">
            <p>Usuário: {connection.username}</p>
            <p>Sala: {connection.room}</p>
            <p>Porta: {connection.port}</p>
          </div>
        </div>
      )}
    </main>
  )
}