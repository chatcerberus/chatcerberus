type Props = {
  messages: string[]
}

export default function MessageList({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3">
      {messages.map((message, index) => (
        <div
          key={index}
          className="bg-slate-800 px-4 py-3 rounded-2xl w-fit max-w-[70%]"
        >
          {message}
        </div>
      ))}
    </div>
  )
}