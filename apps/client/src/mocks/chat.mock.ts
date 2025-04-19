export type Message = {
  id: number;
  text: string;
  sender: string;
  time: string;
};

export type Chat = {
  id: number;
  name: string;
  messages: Message[];
};

const chatsData: Chat[] = [
  {
    id: 1,
    name: 'Alice',
    messages: [
      { id: 101, text: 'Привет!', sender: 'Alice', time: '10:00' },
      { id: 102, text: 'Как дела?', sender: 'Alice', time: '10:01' },
    ],
  },
  {
    id: 2,
    name: 'Bob',
    messages: [{ id: 201, text: 'Йо! Ты где?', sender: 'Bob', time: '09:30' }],
  },
];

export default chatsData;
