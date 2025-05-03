import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';
import { UserStateService } from '../user/user-state/user-state.service';
import { UserState } from '../user/user-state/user-state.enums';
import { chatSockets, UserInviteDto } from '@shared';

@Injectable()
export class ChatService {
  private readonly invites = new Map<string, string>();

  private readonly chats = new Map<string, string>();

  constructor(
    private readonly userService: UserService,
    private readonly userState: UserStateService
  ) {}

  public invite(dto: UserInviteDto & { fromSocketId: string }): boolean {
    const userFrom: User = this.userService.get({ socketId: dto.fromSocketId });

    if (!this.userState.isIdle(userFrom.id)) {
      throw new ForbiddenException('You are busy');
    }

    if (!this.userState.isIdle(dto.toUserId)) {
      throw new ForbiddenException('Partner is not idle');
    }

    if (this.invites.has(dto.toUserId)) {
      throw new ForbiddenException('Partner already has a pending invite');
    }

    const userTo: User = this.userService.get({ id: dto.toUserId });
    userTo.socket.emit(chatSockets.invite.new, dto);

    this.invites.set(dto.toUserId, userFrom.id);

    this.userState.add(userFrom.id, UserState.Invite);
    this.userState.add(dto.toUserId, UserState.Invite);

    return true;
  }

  public accept(socketId: string): void {
    const me: User = this.userService.get({ socketId });

    if (!this.userState.has(me.id, UserState.Invite)) {
      throw new ForbiddenException('No pending invite to accept');
    }

    const partner: User = this.userService.get({
      id: this.invites.get(me.id),
    });

    me.socket.emit(chatSockets.invite.accept, me.id);
    partner.socket.emit(chatSockets.invite.accept, me.id);

    this.chats.set(me.id, partner.id);
    this.chats.set(partner.id, me.id);

    this.userState.delete(me.id, UserState.Invite);
    this.userState.delete(partner.id, UserState.Invite);

    this.userState.add(me.id, UserState.Chat);
    this.userState.add(partner.id, UserState.Chat);

    this.invites.delete(socketId);
  }

  public reject(socketId: string): void {
    const user = this.userService.get({ socketId });

    if (!this.userState.has(user.id, UserState.Invite)) {
      return;
    }

    const fromUserId = this.invites.get(user.id);

    if (fromUserId) {
      this.invites.delete(user.id);
      this.invites.delete(fromUserId);
      this.userState.delete(user.id, UserState.Invite);
      this.userState.delete(fromUserId, UserState.Invite);
    }
  }

  public leave(socketId: string): void {
    const user = this.userService.get({ socketId });

    if (!this.userState.has(user.id, UserState.Chat)) {
      throw new ForbiddenException('You are not in a chat');
    }

    const partnerId: string | undefined = this.chats.get(user.id);

    if (!partnerId) {
      throw new NotFoundException('Chat partner not found');
    }

    const me: User = this.userService.get({ id: user.id });
    const partner: User = this.userService.get({ id: partnerId });

    me.socket.emit(chatSockets.end);
    partner.socket.emit(chatSockets.end);

    this.chats.delete(user.id);
    this.chats.delete(partnerId);

    this.userState.delete(user.id, UserState.Chat);
    this.userState.delete(partnerId, UserState.Chat);
  }

  public sendMessage(socketId: string, message: string): void {
    const user = this.userService.get({ socketId });
    const partner: User = this.userService.get({ id: user.id });
    partner.socket.emit(chatSockets.message.send, message);
  }
}
