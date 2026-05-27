import { useState } from 'react'

type Props = {
  onConnect: (
    username: string,
    room: string,
    port: string
  ) => void
}

export default function ConnectionForm({
  onConnect,
}: Props) {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('general')
  const [port, setPort] = useState('8000')

  function handleConnect() {
    if (!username || !room || !port) return

    onConnect(username, room, port)
  }

  return (
    <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
      <h2 className="text-2xl font-bold">
        Conectar ao Chat
      </h2>

      <input
        type="text"
        placeholder="Seu nome"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none"
      />

      <input
        type="text"
        placeholder="Sala"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none"
      />

      <input
        type="text"
        placeholder="Porta"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none"
      />

      <button
        onClick={handleConnect}
        className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-medium"
      >
        Conectar
      </button>
    </div>
  )
}