import { UserRole } from '../../../common/enums';
import { User } from '../entities/user.entity';

export class UserDto {
  id: string;
  email: string;
  role: UserRole;
  twoFaEnabled: boolean;
  createdAt: Date;

  constructor(entity: User) {
    this.id = entity.id;
    this.email = entity.email;
    this.role = entity.role;
    this.twoFaEnabled = entity.twoFaEnabled;
    this.createdAt = entity.createdAt;
  }
}
