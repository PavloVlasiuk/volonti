import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: false })
  twoFaEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne('VolunteerProfile', 'user')
  volunteerProfile: any;

  @OneToOne('Organization', 'user')
  organization: any;

  @OneToMany('OtpCode', 'user')
  otpCodes: any[];
}
