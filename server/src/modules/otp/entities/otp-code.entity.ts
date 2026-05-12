import { Column, Entity } from 'typeorm';
import { ActorType } from '../../../common/enums';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('otp_codes')
export class OtpCode extends BaseEntity {
  @Column({ length: 255 })
  code: string;

  @Column({ unique: true, name: 'pending_token' })
  pendingToken: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'used_at' })
  usedAt: Date | null;

  @Column({ name: 'actor_id' })
  actorId: string;

  @Column({ type: 'enum', enum: ActorType, name: 'actor_type' })
  actor: ActorType;
}
