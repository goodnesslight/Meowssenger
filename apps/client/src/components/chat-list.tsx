import { Chat } from "../mocks/chat.mock";

type Props = {
  chats: Chat[];
  selectedId: number;
  onSelect: (id: number) => void;
};

export default function ChatList({ chats, selectedId, onSelect }: Props) {
  return (
    <div>
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelect(chat.id)}
          className={`p-4 cursor-pointer hover:bg-gray-200 ${
            chat.id === selectedId ? 'bg-gray-300' : ''
          }`}
        >
          <p className="font-bold">{chat.name}</p>
          <p className="text-sm text-gray-600 truncate">{chat.messages.at(-1)?.text}</p>
        </div>
      ))}
    </div>
  );
}
