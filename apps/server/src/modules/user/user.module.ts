import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserStateModule } from './user-state/user-state.module';

@Module({
  imports: [UserStateModule],
  providers: [UserService],
})
export class UserModule {}
