import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';
import { UserState } from './user-state.enums';

@Injectable()
export class UserStateService {
  constructor(private readonly userService: UserService) {}

  add(id: string, state: UserState): void {
    this.userService.get({ id }).states.add(state);
  }

  delete(id: string, state: UserState): void {
    this.userService.get({ id }).states.delete(state);
  }

  has(id: string, state: UserState): boolean {
    return this.userService.get({ id }).states.has(state);
  }

  isIdle(id: string): boolean {
    return this.userService.get({ id }).states.size === 0;
  }
}
