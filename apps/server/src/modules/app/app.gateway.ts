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
  type ChatMessageSendDto,
  chatSockets,
  userSockets,
} from '@shared';
import { ChatService } from '../chat/chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly clients: Map<string, Socket> = new Map<string, Socket>();

  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService
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
  handleInviteNew(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChatInviteNewDto
  ): void {
    this.chatService.invite({
      ...dto,
      fromSocketId: socket.id,
    });
  }

  @SubscribeMessage(chatSockets.invite.accept)
  handleInviteAccept(@ConnectedSocket() socket: Socket): void {
    this.chatService.accept(socket.id);
  }

  @SubscribeMessage(chatSockets.invite.reject)
  handleInviteReject(@ConnectedSocket() socket: Socket): void {
    this.chatService.reject(socket.id);
  }

  @SubscribeMessage(chatSockets.end)
  handleLeave(@ConnectedSocket() socket: Socket): void {
    this.chatService.leave(socket.id);
  }

  @SubscribeMessage(chatSockets.message.send)
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChatMessageSendDto
  ): void {
    this.chatService.sendMessage(socket.id, dto.message);
  }
}
