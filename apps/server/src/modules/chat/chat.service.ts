import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  socketId: string;
  pendingInviteFrom: string | null;
  inChatWith: string | null;
}

@Injectable()
export class ChatService {
  private users = new Map<string, User>();

  createUser(socketId: string): string {
    const id = uuidv4().slice(0, 8);
    this.users.set(id, {
      id,
      socketId,
      pendingInviteFrom: null,
      inChatWith: null,
    });
    return id;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserBySocket(socketId: string): User | undefined {
    return [...this.users.values()].find((u) => u.socketId === socketId);
  }

  sendInvite(fromId: string, toId: string): boolean {
    const toUser = this.users.get(toId);
    if (!toUser || toUser.pendingInviteFrom || toUser.inChatWith) return false;
    toUser.pendingInviteFrom = fromId;
    return true;
  }

  acceptInvite(myId: string): string | null {
    const me = this.users.get(myId);
    if (!me || !me.pendingInviteFrom) return null;
    const fromUser = this.users.get(me.pendingInviteFrom);
    if (!fromUser) return null;

    me.inChatWith = fromUser.id;
    fromUser.inChatWith = myId;
    me.pendingInviteFrom = null;

    return fromUser.socketId;
  }

  rejectInvite(myId: string): void {
    const me = this.users.get(myId);
    if (me) me.pendingInviteFrom = null;
  }

  leaveChat(userId: string): string | null {
    const me = this.users.get(userId);
    if (!me || !me.inChatWith) return null;

    const partner = this.users.get(me.inChatWith);
    if (partner) partner.inChatWith = null;

    const socketToNotify = partner?.socketId || null;
    me.inChatWith = null;
    return socketToNotify;
  }

  removeUserBySocket(socketId: string) {
    const user = this.getUserBySocket(socketId);
    if (user) {
      this.leaveChat(user.id);
      this.users.delete(user.id);
    }
  }
}
