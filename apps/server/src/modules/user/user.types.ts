import { Socket } from 'socket.io';
import { UserState } from './user-state/user-state.enums';

export interface User {
  id: string;
  socket: Socket;
  states: Set<UserState>;
}
