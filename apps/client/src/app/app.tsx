import { useState } from 'react';
import ChatList from '../components/chat-list';
import ChatWindow from '../components/chat-window';
import chatsData, { Chat } from '../mocks/chat.mock';


export default function App() {
  const [chats, setChats] = useState<Chat[]>(chatsData);
  const [selectedChatId, setSelectedChatId] = useState<number>(chats[0].id);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId)!;

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-300">
        <ChatList chats={chats} selectedId={selectedChatId} onSelect={setSelectedChatId} />
      </div>
      <div className="flex-1">
        <ChatWindow chat={selectedChat} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}