import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.types';
import { v4 } from 'uuid';
import { UserState } from './user-state/user-state.enums';
import type { UserCreateResponse } from '@shared';
import { UserDeleteDto } from './api/dto/user-delete.dto';
import { UserGetDto } from './api/dto/user-get.dto';
import { UserCreateDto } from './api/dto/user-create.dto';

@Injectable()
export class UserService {
  private readonly ids: Map<string, string> = new Map<string, string>();

  private readonly users: Map<string, User> = new Map<string, User>();

  create(dto: UserCreateDto): UserCreateResponse {
    const id: string = v4();
    this.ids.set(dto.socket.id, id);
    this.users.set(id, {
      id,
      socket: dto.socket,
      states: new Set<UserState>(),
    });
    return { id };
  }

  delete(dto: UserDeleteDto): void {
    const user: User = this.get(dto);
    this.ids.delete(user.socket.id);
    this.users.delete(user.id);
  }

  get(dto: UserGetDto): User {
    let id: string | undefined;

    if (dto.id) {
      id = dto.id;
    } else if (dto.socketId) {
      id = this.ids.get(dto.socketId);
    }

    if (!id) {
      throw new ForbiddenException('Id was not found');
    }

    const user: User | undefined = this.users.get(id);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return user;
  }
}
