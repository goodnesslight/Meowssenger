import { useState } from 'react'
import socket from '../socket'

const InviteInput: React.FC = () => {
  const [inputId, setInputId] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    socket.emit('invite', inputId)
  }

  socket.on('inviteFailed', (toId: string) => {
    setMessage(`Не удалось отправить приглашение пользователю ${toId}`)
  })

  socket.on('incomingInvite', () => {
    setMessage('')
  })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <input
        className="border px-4 py-2 rounded-md"
        placeholder="ID собеседника"
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        type="submit"
      >
        Отправить приглашение
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  )
}

export default InviteInput
