// components/ChatWindow.tsx

import { Chat } from '../mocks/chat.mock';
import MessageInput from './message-input';

type Props = {
  chat: Chat;
  onSendMessage: (text: string) => void;
};

export default function ChatWindow({ chat, onSendMessage }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-300 bg-white font-bold text-lg">
        {chat.name}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-xs ${
              msg.sender === 'me' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-200'
            }`}
          >
            <p>{msg.text}</p>
            <p className="text-xs text-right text-gray-500">{msg.time}</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-300 bg-white">
        <MessageInput onSend={onSendMessage} />
      </div>
    </div>
  );
}