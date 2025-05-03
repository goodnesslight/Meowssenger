import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import {
  type ChatInviteNewDto,
  type ChatMessageSendDto,
  chatSockets,
  userSockets,
} from '@shared';
import { ChatService } from '../chat/chat.service';
import { User } from '../user/user.types';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly clients: Map<string, Socket> = new Map<string, Socket>();

  @WebSocketServer() server!: Server;

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
    const userFrom: User = this.userService.get({ socketId: socket.id });
    this.chatService.invite({ ...dto, fromUserId: userFrom.id });
  }

  @SubscribeMessage(chatSockets.invite.accept)
  handleInviteAccept(@ConnectedSocket() socket: Socket): void {
    const userTo: User = this.userService.get({ socketId: socket.id });
    this.chatService.accept(userTo.id);
  }

  @SubscribeMessage(chatSockets.invite.reject)
  handleInviteReject(@ConnectedSocket() socket: Socket): void {
    const userTo: User = this.userService.get({ socketId: socket.id });
    this.chatService.reject(userTo.id);
  }

  @SubscribeMessage(chatSockets.end)
  handleLeave(@ConnectedSocket() socket: Socket): void {
    const userTo: User = this.userService.get({ socketId: socket.id });
    this.chatService.leave(userTo.id);
  }

  @SubscribeMessage(chatSockets.message.send)
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: ChatMessageSendDto
  ): void {
    const userTo: User = this.userService.get({ socketId: socket.id });
    this.chatService.sendMessage(userTo.id, dto.message);
  }
}
