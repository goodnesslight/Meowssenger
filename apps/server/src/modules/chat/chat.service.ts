import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserStateService } from '../user/user-state/user-state.service';
import { UserState } from '../user/user-state/user-state.enums';
import { ChatInviteNewDto, chatSockets } from '@shared';
import { User } from '../user/user.types';

@Injectable()
export class ChatService {
  private readonly chats = new Map<string, string>();

  private readonly invites = new Map<string, string>();

  constructor(
    private readonly userService: UserService,
    private readonly userStateService: UserStateService
  ) {}

  invite(socketId: string, dto: ChatInviteNewDto): void {
    const from: User = this.userService.get({ socketId });
    const to: User = this.userService.get({ id: dto.userId });

    if (!this.userStateService.isIdle(from.id)) {
      throw new ForbiddenException('You are busy');
    }

    if (!this.userStateService.isIdle(to.id)) {
      throw new ForbiddenException('Partner is not idle');
    }

    if (this.invites.has(from.id) || this.invites.has(to.id)) {
      throw new ForbiddenException('Already invited');
    }

    this.invites.set(from.id, to.id);
    this.invites.set(to.id, from.id);

    this.userStateService.add(from.id, UserState.Invite);
    this.userStateService.add(to.id, UserState.Invite);

    to.socket.emit(chatSockets.invite.new, { userId: from.id });
  }

  accept(socketId: string): void {
    const from: User = this.userService.get({ socketId });

    if (!this.userStateService.has(from.id, UserState.Invite)) {
      throw new ForbiddenException('No pending invite to accept');
    }

    const toId: string | undefined = this.invites.get(from.id);

    if (!toId) {
      throw new NotFoundException('Invite mapping broken');
    }

    const to: User = this.userService.get({ id: toId });

    this.invites.delete(from.id);
    this.invites.delete(toId);

    this.chats.set(from.id, toId);
    this.chats.set(toId, from.id);

    this.userStateService.delete(from.id, UserState.Invite);
    this.userStateService.delete(toId, UserState.Invite);

    this.userStateService.add(from.id, UserState.Chat);
    this.userStateService.add(toId, UserState.Chat);

    from.socket.emit(chatSockets.invite.accept, { userId: to.id });
    to.socket.emit(chatSockets.invite.accept, { userId: from.id });
  }

  reject(socketId: string): void {
    const from: User = this.userService.get({ socketId });

    if (!this.userStateService.has(from.id, UserState.Invite)) {
      return;
    }

    const toId: string | undefined = this.invites.get(from.id);

    if (!toId) {
      throw new ForbiddenException();
    }

    this.invites.delete(from.id);
    this.invites.delete(toId);

    this.userStateService.delete(from.id, UserState.Invite);
    this.userStateService.delete(toId, UserState.Invite);
  }

  leave(socketId: string): void {
    const from: User = this.userService.get({ socketId });

    if (!this.userStateService.has(from.id, UserState.Chat)) {
      throw new ForbiddenException('You are not in a chat');
    }

    const toId: string | undefined = this.chats.get(from.id);

    if (!toId) {
      throw new NotFoundException('Chat partner not found');
    }

    const to: User = this.userService.get({ id: toId });

    this.chats.delete(from.id);
    this.chats.delete(toId);

    this.userStateService.delete(from.id, UserState.Chat);
    this.userStateService.delete(toId, UserState.Chat);

    from.socket.emit(chatSockets.end);
    to.socket.emit(chatSockets.end);
  }

  getPartnerUserId(userId: string): string {
    const partnerId: string | undefined = this.chats.get(userId);

    if (!partnerId) {
      throw new NotFoundException('Partner user id not found');
    }

    return partnerId;
  }
}
