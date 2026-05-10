import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrgStatus, OrgType } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: OrgType })
  type: OrgType;

  @Column({ unique: true, length: 8 })
  edrpou: string;

  @Column({ length: 200 })
  contactPerson: string;

  @Column({ length: 500, nullable: true })
  documentUrl: string | null;

  @Column({ type: 'enum', enum: OrgStatus, default: OrgStatus.PENDING })
  status: OrgStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany('Initiative', 'organization')
  initiatives: any[];
}
