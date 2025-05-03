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

  public invite(dto: UserInviteDto): boolean {
    if (!this.userState.isIdle(dto.fromUserId)) {
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

    this.invites.set(dto.toUserId, dto.fromUserId);

    this.userState.add(dto.fromUserId, UserState.Invite);
    this.userState.add(dto.toUserId, UserState.Invite);

    return true;
  }

  public accept(userId: string): void {
    if (!this.userState.has(userId, UserState.Invite)) {
      throw new ForbiddenException('No pending invite to accept');
    }

    const me: User = this.userService.get({ id: userId });
    const partner: User = this.userService.get({
      id: this.invites.get(userId),
    });

    me.socket.emit(chatSockets.invite.accept, me.id);
    partner.socket.emit(chatSockets.invite.accept, me.id);

    this.chats.set(me.id, partner.id);
    this.chats.set(partner.id, me.id);

    this.userState.delete(me.id, UserState.Invite);
    this.userState.delete(partner.id, UserState.Invite);

    this.userState.add(me.id, UserState.Chat);
    this.userState.add(partner.id, UserState.Chat);

    this.invites.delete(userId);
  }

  public reject(userId: string): void {
    if (!this.userState.has(userId, UserState.Invite)) {
      return;
    }

    const fromUserId = this.invites.get(userId);

    if (fromUserId) {
      this.invites.delete(userId);
      this.invites.delete(fromUserId);
      this.userState.delete(userId, UserState.Invite);
      this.userState.delete(fromUserId, UserState.Invite);
    }
  }

  public leave(userId: string): void {
    if (!this.userState.has(userId, UserState.Chat)) {
      throw new ForbiddenException('You are not in a chat');
    }

    const partnerId: string | undefined = this.chats.get(userId);

    if (!partnerId) {
      throw new NotFoundException('Chat partner not found');
    }

    const me: User = this.userService.get({ id: userId });
    const partner: User = this.userService.get({ id: partnerId });

    me.socket.emit(chatSockets.end);
    partner.socket.emit(chatSockets.end);

    this.chats.delete(userId);
    this.chats.delete(partnerId);

    this.userState.delete(userId, UserState.Chat);
    this.userState.delete(partnerId, UserState.Chat);
  }

  public sendMessage(userId: string, message: string): void {
    const partner: User = this.userService.get({ id: this.chats.get(userId) });
    partner.socket.emit(chatSockets.message.send, message);
  }
}
