import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('initiative_dismissals')
@Index('UQ_initiative_dismissals_user_initiative', ['userId', 'initiativeId'], {
  unique: true,
})
export class InitiativeDismissal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'initiative_id', type: 'uuid' })
  initiativeId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
