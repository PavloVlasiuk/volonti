import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  FormatType,
  InitiativeStatus,
  InitiativeType,
} from '../../../common/enums';
import { Organization } from '../../organizations/entities/organization.entity';
import { Category } from '../../categories/entities/category.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity('initiatives')
export class Initiative extends BaseEntity {
  @Column({ name: 'title', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'type', type: 'enum', enum: InitiativeType })
  type: InitiativeType;

  @Column({ name: 'format', type: 'enum', enum: FormatType })
  format: FormatType;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'min_age', type: 'smallint', nullable: true })
  minAge: number | null;

  @Column({ name: 'requirements', type: 'text', nullable: true })
  requirements: string | null;

  @Column({ name: 'starts_at', type: 'date', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'date', nullable: true })
  endsAt: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: InitiativeStatus,
    default: InitiativeStatus.ACTIVE,
  })
  status: InitiativeStatus;

  @Column({ name: 'slots_needed', type: 'smallint', nullable: true })
  slotsNeeded: number | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (o) => o.initiatives, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Application, (application) => application.initiative)
  applications: Application[];
}
