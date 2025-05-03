import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { AppGateway } from './app.gateway';
import { UserStateModule } from '../user/user-state/user-state.module';
import { ChatMessageModule } from '../chat/chat-message/chat-message.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    UserStateModule,
    ChatModule,
    ChatMessageModule,
  ],
  providers: [AppGateway],
})
export class AppModule {}
