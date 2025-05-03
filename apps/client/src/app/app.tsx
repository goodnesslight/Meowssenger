import { useEffect, useState } from 'react'
import Chat from '../components/chat'
import InviteInput from '../components/invite'
import Notification from '../components/notification'
import socket from './socket'


const App = () => {
  const [myId, setMyId] = useState('')
  const [inviteFrom, setInviteFrom] = useState<string | null>(null)
  const [inChatWith, setInChatWith] = useState<string | null>(null)

  useEffect(() => {
    socket.on('yourId', (id: string) => {
      setMyId(id)
    })

    socket.on('incomingInvite', (fromId: string) => {
      setInviteFrom(fromId)
      setTimeout(() => {
        if (!inChatWith) {
          socket.emit('reject')
          setInviteFrom(null)
        }
      }, 15000)
    })

    socket.on('inviteAccepted', (partnerId: string) => {
      setInChatWith(partnerId)
      setInviteFrom(null)
    })

    socket.on('chatEnded', () => {
      setInChatWith(null)
      setInviteFrom(null)
    })

    return () => {
      socket.off('yourId')
      socket.off('incomingInvite')
      socket.off('inviteAccepted')
      socket.off('chatEnded')
    }
  }, [inChatWith])

  const handleAccept = () => {
    socket.emit('accept')
  }

  const handleReject = () => {
    socket.emit('reject')
    setInviteFrom(null)
  }

  const handleLeave = () => {
    socket.emit('leave')
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 text-gray-700 text-xl font-mono">Ваш ID: {myId}</div>
      {inviteFrom && !inChatWith && (
        <Notification inviterId={inviteFrom} onAccept={handleAccept} onReject={handleReject} />
      )}
      {!inviteFrom && !inChatWith && <InviteInput />}
      {inChatWith && <Chat partnerId={inChatWith} onLeave={handleLeave} />}
    </div>
  )
}

export default App
