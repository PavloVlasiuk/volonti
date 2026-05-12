import { Column, Entity } from 'typeorm';
import { UserRole } from '../../../common/enums';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'two_fa_enabled', default: false })
  twoFaEnabled: boolean;
}
