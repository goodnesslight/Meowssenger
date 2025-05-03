import { Module } from '@nestjs/common';
import { UserStateService } from './user-state.service';
import { UserModule } from '../user.module';

@Module({
  imports: [UserModule],
  providers: [UserStateService],
  exports: [UserStateService],
})
export class UserStateModule {}
