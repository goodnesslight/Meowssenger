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
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly duration: number = 15_000;

  @WebSocketServer() server: Server | undefined;

  constructor(private readonly service: ChatService) {}

  handleConnection(client: Socket) {
    const id: string = this.service.createUser(client.id);
    client.emit('yourId', id);
  }

  handleDisconnect(client: Socket) {
    const socketToNotify = this.service.removeUserBySocket(client.id);

    if (socketToNotify) {
      this.server.to(socketToNotify).emit('chatEnded');
    }
  }

  @SubscribeMessage('invite')
  handleInvite(@MessageBody() toId: string, @ConnectedSocket() client: Socket) {
    const user = this.service.getUserBySocketId(client.id);
    if (!user) {
      return;
    }

    const success = this.service.sendInvite(user.id, toId);
    if (!success) {
      client.emit('inviteFailed', toId);
      return;
    }

    const targetUser = this.service.getUserById(toId);
    if (targetUser) {
      this.server
        .to(targetUser.socketId)
        .emit('incomingInvite', user.id, this.duration);
    }
  }

  @SubscribeMessage('accept')
  handleAccept(@ConnectedSocket() client: Socket) {
    const user = this.service.getUserBySocketId(client.id);
    if (!user) {
      return;
    }

    const otherSocket = this.service.acceptInvite(user.id);
    if (otherSocket) {
      this.server.to(otherSocket).emit('inviteAccepted', user.id);
      client.emit('inviteAccepted', user.id);
    }
  }

  @SubscribeMessage('reject')
  handleReject(@ConnectedSocket() client: Socket) {
    const user = this.service.getUserBySocketId(client.id);
    if (!user) {
      return;
    }

    this.service.rejectInvite(user.id);
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket) {
    const user = this.service.getUserBySocketId(client.id);
    if (!user) {
      return;
    }

    const partnerSocket = this.service.leaveChat(user.id);
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
    const user = this.service.getUserBySocketId(client.id);

    if (!user || !user.inChatWith) {
      return;
    }

    const partner = this.service.getUserById(user.inChatWith);

    if (partner) {
      this.server.to(partner.socketId).emit('message', message);
    }
  }
}
