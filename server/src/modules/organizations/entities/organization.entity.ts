import { Column, Entity, OneToMany } from 'typeorm';
import { OrgStatus, OrgType } from '../../../common/enums';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Initiative } from '../../initiatives/entities/initiative.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'type', type: 'enum', enum: OrgType })
  type: OrgType;

  @Column({ name: 'edrpou', unique: true, length: 8 })
  edrpou: string;

  @Column({ name: 'contact_person', length: 200 })
  contactPerson: string;

  @Column({ name: 'document_url', length: 500, nullable: true })
  documentUrl: string | null;

  @Column({ name: 'email', unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrgStatus,
    default: OrgStatus.PENDING,
  })
  status: OrgStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @OneToMany(() => Initiative, (initiative) => initiative.organization)
  initiatives: Initiative[];
}
