import { useEffect, useState } from 'react';
import { socket } from '../../helpers/socket/socket';
import { useTranslation } from 'react-i18next';
import Chat from '../../components/chat';
import Invite from '../../components/invite';
import Notification from '../../components/notification';
import Language from '../../components/language';
import Theme from '../../components/theme';
import Particles from '../../components/particles';
import {
  ChatInviteAcceptDto,
  ChatInviteNewDto,
  ChatKeySetDto,
  chatKeySockets,
  chatSockets,
  userSockets,
} from '@shared';
import {
  generateECDHKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedKey,
} from '../../helpers/crypto/crypto';

const App = () => {
  const { t } = useTranslation();

  const [myId, setMyId] = useState<string>('');
  const [inviteFrom, setInviteFrom] = useState<string | null>(null);
  const [inChatWith, setInChatWith] = useState<string | null>(null);

  const [myKeyPair, setMyKeyPair] = useState<CryptoKeyPair | null>(null);
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    socket.on(userSockets.id.set, (dto: { id: string }) => {
      setMyId(dto.id);
    });

    socket.on(chatSockets.invite.new, (dto: ChatInviteNewDto) => {
      setInviteFrom(dto.userId);
      timer = setTimeout(() => {
        if (!inChatWith) {
          socket.emit(chatSockets.invite.reject);
          setInviteFrom(null);
        }
      }, 15000);
    });

    socket.on(chatSockets.invite.accept, (dto: ChatInviteAcceptDto) => {
      setInChatWith(dto.userId);
      setInviteFrom(null);
      (async () => {
        const kp: CryptoKeyPair = await generateECDHKeyPair();
        setMyKeyPair(kp);
        const jwk: JsonWebKey = await exportPublicKey(kp.publicKey);
        socket.emit(chatKeySockets.set, { key: jwk });
      })();
    });

    socket.on(chatSockets.end, () => {
      setInChatWith(null);
      setInviteFrom(null);
    });

    socket.on(chatKeySockets.set, async (dto: ChatKeySetDto) => {
      if (!myKeyPair) {
        return;
      }

      console.log(dto);
      const theirPub: CryptoKey = await importPublicKey(dto.key);
      const sk: CryptoKey = await deriveSharedKey(
        myKeyPair.privateKey,
        theirPub
      );
      setSharedKey(sk);
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

      {inChatWith && sharedKey && (
        <Chat
          partnerId={inChatWith}
          sharedKey={sharedKey}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
};

export default App;
