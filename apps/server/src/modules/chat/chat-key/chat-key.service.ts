import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { ChatKeySetDto, chatKeySockets } from '@shared';
import { ChatService } from '../chat.service';
import { User } from '../../user/user.types';

@Injectable()
export class ChatKeyService {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService
  ) {}

  set(socketId: string, dto: ChatKeySetDto): void {
    const from: User = this.userService.get({ socketId });
    const toId: string = this.chatService.getPartnerUserId(from.id);
    const to: User = this.userService.get({ id: toId });
    to.socket.emit(chatKeySockets.set, dto);
  }
}
