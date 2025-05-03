import { useEffect, useState } from 'react';
import { socket } from '../../socket/socket';
import { useTranslation } from 'react-i18next';
import Chat from '../../components/chat';
import Invite from '../../components/invite';
import Notification from '../../components/notification';
import Language from '../../components/language';
import Theme from '../../components/theme';
import Particles from '../../components/particles';
import { ChatInviteNewDto, chatSockets, userSockets } from '@shared';

const App = () => {
  const { t } = useTranslation();

  const [myId, setMyId] = useState<string>('');
  const [inviteFrom, setInviteFrom] = useState<string | null>(null);
  const [inChatWith, setInChatWith] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Получаем свой ID
    socket.on(userSockets.id.set, (dto: { id: string }) => {
      setMyId(dto.id);
    });

    // Новое приглашение: { userId: string }
    socket.on(chatSockets.invite.new, (dto: ChatInviteNewDto) => {
      setInviteFrom(dto.userId);
      // авто-отклонение через 15 сек
      timer = setTimeout(() => {
        if (!inChatWith) {
          socket.emit(chatSockets.invite.reject);
          setInviteFrom(null);
        }
      }, 15000);
    });

    // Принимаем приглашение: { userId: string }
    socket.on(chatSockets.invite.accept, (dto: { userId: string }) => {
      setInChatWith(dto.userId);
      setInviteFrom(null);
    });

    // Конец чата
    socket.on(chatSockets.end, () => {
      setInChatWith(null);
      setInviteFrom(null);
    });

    return () => {
      socket.off(userSockets.id.set);
      socket.off(chatSockets.invite.new);
      socket.off(chatSockets.invite.accept);
      socket.off(chatSockets.end);
      clearTimeout(timer);
    };
  }, [inChatWith]);

  const handleAccept = () => {
    socket.emit(chatSockets.invite.accept);
  };
  const handleReject = () => {
    socket.emit(chatSockets.invite.reject);
    setInviteFrom(null);
  };
  const handleLeave = () => {
    socket.emit(chatSockets.end);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 dark:text-white p-4 transition-colors">
      <Particles />
      <Language />
      <Theme />
      <div className="absolute top-4 text-gray-700 text-xl font-mono dark:text-gray-200">
        {t('self.id', { id: myId })}
      </div>

      {inviteFrom && !inChatWith && (
        <Notification
          inviterId={inviteFrom}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      {!inviteFrom && !inChatWith && <Invite />}

      {inChatWith && <Chat partnerId={inChatWith} onLeave={handleLeave} />}
    </div>
  );
};

export default App;
