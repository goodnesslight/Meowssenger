import { useEffect, useState } from 'react'
import socket from '../app/socket'

interface Props {
  partnerId: string
  onLeave: () => void
}

const Chat: React.FC<Props> = ({ partnerId, onLeave }) => {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit('message', input)
    setMessages((prev) => [...prev, `Вы: ${input}`])
    setInput('')
  }

  useEffect(() => {
    return () => {
      socket.disconnect()
    }
  }, [])
  

  return (
    <div className="w-full max-w-md bg-white p-4 rounded shadow-md">
      <h2 className="text-xl mb-2 text-center">Чат с {partnerId}</h2>
      <div className="border h-48 p-2 mb-2 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm mb-1">{msg}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Сообщение..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Отправить
        </button>
      </div>
      <button onClick={onLeave} className="mt-4 text-sm text-red-500 underline">
        Выйти из чата
      </button>
    </div>
  )
}

export default Chat
