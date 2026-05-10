import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { ApplicationStatus } from '../../../common/enums';
import { Initiative } from '../../initiatives/entities/initiative.entity';
import { VolunteerProfile } from '../../volunteer-profiles/entities/volunteer-profile.entity';

@Entity('applications')
@Unique(['initiative', 'volunteerProfile'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Initiative, { onDelete: 'CASCADE' })
  initiative: Initiative;

  @ManyToOne(() => VolunteerProfile)
  volunteerProfile: VolunteerProfile;
}
