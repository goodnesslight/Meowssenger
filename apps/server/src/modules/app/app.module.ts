import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, ChatModule],
  providers: [AppGateway],
})
export class AppModule {}
