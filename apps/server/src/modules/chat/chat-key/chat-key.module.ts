import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { ChatKeyService } from './chat-key.service';
import { ChatModule } from '../chat.module';

@Module({
  imports: [UserModule, ChatModule],
  providers: [ChatKeyService],
  exports: [ChatKeyService],
})
export class ChatKeyModule {}
