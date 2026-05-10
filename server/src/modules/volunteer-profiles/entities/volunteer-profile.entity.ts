import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FormatPreference } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { VolunteerInterest } from './volunteer-interest.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity('volunteer_profiles')
export class VolunteerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'smallint', nullable: true })
  age: number | null;

  @Column({
    type: 'enum',
    enum: FormatPreference,
    default: FormatPreference.ANY,
  })
  formatPreference: FormatPreference;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany('VolunteerInterest', 'volunteerProfile')
  interests: VolunteerInterest[];

  @OneToMany('Application', 'volunteerProfile')
  applications: Application[];
}
