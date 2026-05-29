import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ApplicationStatus, AvailabilitySlot } from '../../../common/enums';
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

  @Column({ name: 'motivation', type: 'text', default: '' })
  motivation: string;

  @Column({
    name: 'availability',
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  availability: AvailabilitySlot[];

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  contactPhone: string | null;

  @Column({ name: 'experience', type: 'text', nullable: true })
  experience: string | null;

  @Column({ name: 'has_transport', type: 'boolean', default: false })
  hasTransport: boolean;

  @Column({ name: 'can_start_immediately', type: 'boolean', default: false })
  canStartImmediately: boolean;

  @Column({ name: 'participated', type: 'boolean', nullable: true })
  participated: boolean | null;

  @Column({
    name: 'hours_logged',
    type: 'numeric',
    precision: 5,
    scale: 1,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) =>
        value === null || value === undefined ? null : Number(value),
    },
  })
  hoursLogged: number | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

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
