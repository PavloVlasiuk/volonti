import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { FormatPreference } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { VolunteerInterest } from './volunteer-interest.entity';
import { Application } from '../../applications/entities/application.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('volunteer_profiles')
export class VolunteerProfile extends BaseEntity {
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'age', type: 'smallint', nullable: true })
  age: number | null;

  @Column({
    name: 'format_preference',
    type: 'enum',
    enum: FormatPreference,
    default: FormatPreference.ANY,
  })
  formatPreference: FormatPreference;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => VolunteerInterest, (interest) => interest.volunteerProfile)
  interests: VolunteerInterest[];

  @OneToMany(() => Application, (application) => application.volunteerProfile)
  applications: Application[];
}
