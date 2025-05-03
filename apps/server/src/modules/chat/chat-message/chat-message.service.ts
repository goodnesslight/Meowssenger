import { ForbiddenException, Injectable } from '@nestjs/common';
import { chatMessageSockets } from '@shared';
import { UserState } from '../../user/user-state/user-state.enums';
import { UserStateService } from '../../user/user-state/user-state.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.types';
import { ChatService } from '../chat.service';

@Injectable()
export class ChatMessageService {
  constructor(
    private readonly userService: UserService,
    private readonly userState: UserStateService,
    private readonly chatService: ChatService
  ) {}

  public send(socketId: string, message: string): void {
    const from: User = this.userService.get({ socketId });

    if (!this.userState.has(from.id, UserState.Chat)) {
      throw new ForbiddenException('You are not in a chat');
    }

    const to: User = this.userService.get({
      id: this.chatService.getPartnerUserId(from.id),
    });
    to.socket.emit(chatMessageSockets.send, { message });
  }
}
