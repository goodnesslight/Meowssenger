import { useEffect, useState } from 'react'
import Chat from '../components/chat'
import Invite from '../components/invite'
import Notification from '../components/notification'
import Language from '../components/language';
import Theme from '../components/theme';
import { socket } from '../socket/socket'
import { useTranslation } from 'react-i18next';

const App = () => {
  const { t } = useTranslation();

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
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 dark:text-white p-4 transition-colors">
      <Language />
       <Theme />
      <div className="absolute top-4 text-gray-700 text-xl font-mono">{t('self.id', { id: myId })}</div>
      {inviteFrom && !inChatWith && (
        <Notification inviterId={inviteFrom} onAccept={handleAccept} onReject={handleReject} />
      )}
      {!inviteFrom && !inChatWith && <Invite />}
      {inChatWith && <Chat partnerId={inChatWith} onLeave={handleLeave} />}
    </div>
  )
}

export default App
