import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOneToDto({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    return this.usersRepository.findByEmail(email);
  }

  findRawByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findRawByEmail(email);
  }

  async create(data: DeepPartial<User>): Promise<UserDto> {
    return this.usersRepository.saveToDto(data);
  }

  async setTwoFa(userId: string, enabled: boolean): Promise<void> {
    await this.usersRepository.update(userId, { twoFaEnabled: enabled });
  }

  async setEmailVerified(userId: string, verified: boolean): Promise<void> {
    await this.usersRepository.update(userId, { emailVerified: verified });
  }
}
