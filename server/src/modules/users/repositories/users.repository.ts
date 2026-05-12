import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';

@Injectable()
export class UsersRepository extends BaseRepositoryWrapper<User, UserDto> {
  protected dtoClass = UserDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    return this.findOneToDto({ where: { email } });
  }

  async findRawByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }
}
