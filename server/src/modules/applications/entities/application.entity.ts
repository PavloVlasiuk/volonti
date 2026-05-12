import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ApplicationStatus } from '../../../common/enums';
import { Initiative } from '../../initiatives/entities/initiative.entity';
import { VolunteerProfile } from '../../volunteer-profiles/entities/volunteer-profile.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('applications')
@Unique(['initiativeId', 'volunteerProfileId'])
export class Application extends BaseEntity {
  @Column({
    name: 'status',
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'initiative_id' })
  initiativeId: string;

  @ManyToOne(() => Initiative, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiative_id' })
  initiative: Initiative;

  @Column({ name: 'volunteer_profile_id' })
  volunteerProfileId: string;

  @ManyToOne(() => VolunteerProfile)
  @JoinColumn({ name: 'volunteer_profile_id' })
  volunteerProfile: VolunteerProfile;
}
