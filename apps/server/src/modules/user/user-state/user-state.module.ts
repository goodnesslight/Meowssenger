import { Module } from '@nestjs/common';
import { UserStateService } from './user-state.service';
import { UserService } from '../user.service';

@Module({
  imports: [UserService],
  providers: [UserStateService],
})
export class UserStateModule {}
