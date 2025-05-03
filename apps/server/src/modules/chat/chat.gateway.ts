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
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:4200', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server | undefined;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const id = this.chatService.createUser(client.id);
    client.emit('yourId', id);
  }

  handleDisconnect(client: Socket) {
    const socketToNotify = this.chatService.removeUserBySocket(client.id);

    if (socketToNotify) {
      this.server.to(socketToNotify).emit('chatEnded');
    }
  }

  @SubscribeMessage('invite')
  handleInvite(@MessageBody() toId: string, @ConnectedSocket() client: Socket) {
    const user = this.chatService.getUserBySocket(client.id);
    if (!user) return;

    const success = this.chatService.sendInvite(user.id, toId);
    if (!success) {
      client.emit('inviteFailed', toId);
      return;
    }

    const targetUser = this.chatService.getUserById(toId);
    if (targetUser) {
      this.server.to(targetUser.socketId).emit('incomingInvite', user.id);
    }
  }

  @SubscribeMessage('accept')
  handleAccept(@ConnectedSocket() client: Socket) {
    const user = this.chatService.getUserBySocket(client.id);
    if (!user) return;

    const otherSocket = this.chatService.acceptInvite(user.id);
    if (otherSocket) {
      this.server.to(otherSocket).emit('inviteAccepted', user.id);
      client.emit('inviteAccepted', user.id);
    }
  }

  @SubscribeMessage('reject')
  handleReject(@ConnectedSocket() client: Socket) {
    const user = this.chatService.getUserBySocket(client.id);
    if (!user) return;

    this.chatService.rejectInvite(user.id);
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket) {
    const user = this.chatService.getUserBySocket(client.id);
    if (!user) return;

    const partnerSocket = this.chatService.leaveChat(user.id);
    if (partnerSocket) {
      this.server.to(partnerSocket).emit('chatEnded');
    }

    client.emit('chatEnded');
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket
  ) {
    const user = this.chatService.getUserBySocket(client.id);
    if (!user || !user.inChatWith) return;

    const partner = this.chatService.getUserById(user.inChatWith);
    if (partner) {
      this.server.to(partner.socketId).emit('message', message);
    }
  }
}
