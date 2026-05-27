import { useState } from 'react'

type Props = {
  onSend: (message: string) => void
}

export default function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState('')

  function handleSend() {
    if (!message.trim()) return

    onSend(message)
    setMessage('')
  }

  return (
    <div className="border-t border-slate-800 p-4 flex gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite uma mensagem..."
        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
      />

      <button
        onClick={handleSend}
        className="bg-indigo-600 hover:bg-indigo-500 px-5 rounded-xl font-medium"
      >
        Enviar
      </button>
    </div>
  )
}