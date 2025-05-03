import { Injectable, NotFoundException } from '@nestjs/common';
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
    const id: string = uuidv4().slice(0, 8);
    this.users.set(id, {
      id,
      socketId,
      pendingInviteFrom: null,
      inChatWith: null,
    });
    return id;
  }

  sendInvite(fromId: string, toId: string): boolean {
    const partner: User | undefined = this.users.get(toId);

    if (!partner || partner.pendingInviteFrom || partner.inChatWith) {
      throw new NotFoundException('Partner user was not found!');
    }

    partner.pendingInviteFrom = fromId;
    return true;
  }

  acceptInvite(myId: string): string | null {
    const self: User | undefined = this.users.get(myId);
    if (!self || !self.pendingInviteFrom) {
      throw new NotFoundException('Self user was not found!');
    }

    const partner: User | undefined = this.users.get(self.pendingInviteFrom);

    if (!partner) {
      throw new NotFoundException('Partner user was not found!');
    }

    self.inChatWith = partner.id;
    partner.inChatWith = myId;
    self.pendingInviteFrom = null;

    return partner.socketId;
  }

  rejectInvite(myId: string): void {
    const self: User | undefined = this.users.get(myId);

    if (!self) {
      throw new NotFoundException('Self user was not found!');
    }

    self.pendingInviteFrom = null;
  }

  leaveChat(userId: string): string | null {
    const self: User | undefined = this.users.get(userId);

    if (!self || !self.inChatWith) {
      throw new NotFoundException('Self user was not found!');
    }

    const partner: User | undefined = this.users.get(self.inChatWith);

    if (!partner) {
      throw new NotFoundException('Partner user was not found!');
    }

    partner.inChatWith = null;
    const socketToNotify = partner?.socketId || null;
    self.inChatWith = null;
    return socketToNotify;
  }

  removeUserBySocket(socketId: string) {
    const user: User | undefined = this.getUserBySocketId(socketId);

    if (!user) {
      throw new NotFoundException('User was not found!');
    }

    this.leaveChat(user.id);
    this.users.delete(user.id);
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserBySocketId(socketId: string): User | undefined {
    return [...this.users.values()].find(
      (user: User) => user.socketId === socketId
    );
  }
}
