import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Initiative } from './initiative.entity';

@Entity('initiative_dismissals')
@Index('UQ_initiative_dismissals_user_initiative', ['userId', 'initiativeId'], {
  unique: true,
})
export class InitiativeDismissal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'initiative_id', type: 'uuid' })
  initiativeId: string;

  @ManyToOne(() => Initiative, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiative_id' })
  initiative: Initiative;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
