import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import {
  type ChatInviteNewDto,
  type ChatKeySetDto,
  chatKeySockets,
  type ChatMessageSendDto,
  chatMessageSockets,
  chatSockets,
  userSockets,
} from '@shared';
import { ChatService } from '../chat/chat.service';
import { ChatMessageService } from '../chat/chat-message/chat-message.service';
import { ChatKeyService } from '../chat/chat-key/chat-key.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly clients: Map<string, Socket> = new Map<string, Socket>();

  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly chatMessageService: ChatMessageService,
    private readonly chatKeyService: ChatKeyService
  ) {}

  // ==================== NATIVE ====================

  handleConnection(socket: Socket): void {
    socket.emit(
      userSockets.id.set,
      this.userService.create({
        socket,
      })
    );
    this.clients.set(socket.id, socket);
  }

  handleDisconnect(socket: Socket): void {
    this.userService.delete({ socketId: socket.id });
    this.clients.delete(socket.id);
  }

  // ==================== CHAT ====================

  @SubscribeMessage(chatSockets.invite.new)
  handleChatInviteNew(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChatInviteNewDto
  ): void {
    this.chatService.invite(socket.id, dto);
  }

  @SubscribeMessage(chatSockets.invite.accept)
  handleChatInviteAccept(@ConnectedSocket() socket: Socket): void {
    this.chatService.accept(socket.id);
  }

  @SubscribeMessage(chatSockets.invite.reject)
  handleChatInviteReject(@ConnectedSocket() socket: Socket): void {
    this.chatService.reject(socket.id);
  }

  @SubscribeMessage(chatSockets.end)
  handleChatEnd(@ConnectedSocket() socket: Socket): void {
    this.chatService.leave(socket.id);
  }

  // ==================== CHAT-MESSAGE ====================

  @SubscribeMessage(chatMessageSockets.send)
  handleChatMessageSend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChatMessageSendDto
  ): void {
    this.chatMessageService.send(socket.id, dto);
  }

  // ==================== CHAT-KEY ====================

  @SubscribeMessage(chatKeySockets.set)
  handleChatKeySet(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChatKeySetDto
  ): void {
    this.chatKeyService.set(socket.id, dto);
  }
}
