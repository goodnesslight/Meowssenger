import { io } from 'socket.io-client';
import { User } from '@shared/chat';

const socket = io('http://localhost:3000', { withCredentials: true });
export default socket;

console.log('asdas');

const test: User;
