import { useEffect, useState } from 'react';
import { socket } from '../socket/socket';
import { ChatMessageSendDto, chatMessageSockets } from '@shared';
import { decryptMessage, encryptMessage } from '../utils/crypto';

interface Props {
  partnerId: string;
  sharedKey: CryptoKey;
  onLeave: () => void;
}

const Chat: React.FC<Props> = ({ partnerId, sharedKey, onLeave }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;
    const { iv, ciphertext } = await encryptMessage(sharedKey, input);
    socket.emit(chatMessageSockets.send, {
      iv,
      ciphertext,
    });
    setMessages((prev) => [...prev, `Вы: ${input}`]);
    setInput('');
  };

  useEffect(() => {
    const handleIncoming = async (dto: ChatMessageSendDto) => {
      const text = await decryptMessage(sharedKey, {
        iv: dto.iv,
        ciphertext: dto.ciphertext,
      });
      setMessages((prev) => [...prev, `${partnerId}: ${text}`]);
    };

    socket.on(chatMessageSockets.send, handleIncoming);
    return () => {
      socket.off(chatMessageSockets.send, handleIncoming);
    };
  }, [partnerId]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded shadow-md transition-colors">
      <h2 className="text-xl mb-2 text-center">Чат с {partnerId}</h2>
      <div className="border dark:border-gray-700 h-48 p-2 mb-2 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm mb-1">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2 py-1 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Сообщение..."
        />
        <button
          onClick={sendMessage}
          disabled={!sharedKey}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить
        </button>
      </div>
      <button onClick={onLeave} className="mt-4 text-sm text-red-400 underline">
        Выйти из чата
      </button>
    </div>
  );
};

export default Chat;
