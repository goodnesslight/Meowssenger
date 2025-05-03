import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { UserStateModule } from '../../user/user-state/user-state.module';
import { ChatModule } from '../chat.module';
import { ChatMessageService } from './chat-message.service';

@Module({
  imports: [UserModule, UserStateModule, ChatModule],
  providers: [ChatMessageService],
  exports: [ChatMessageService],
})
export class ChatMessageModule {}
