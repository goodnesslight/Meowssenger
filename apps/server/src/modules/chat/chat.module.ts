import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';
import { UserStateModule } from '../user/user-state/user-state.module';

@Module({
  imports: [UserModule, UserStateModule],
  providers: [ChatService],
})
export class ChatModule {}
