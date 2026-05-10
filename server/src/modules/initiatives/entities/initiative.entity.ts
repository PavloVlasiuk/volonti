import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  FormatType,
  InitiativeStatus,
  InitiativeType,
} from '../../../common/enums';
import { Organization } from '../../organizations/entities/organization.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('initiatives')
export class Initiative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: InitiativeType })
  type: InitiativeType;

  @Column({ type: 'enum', enum: FormatType })
  format: FormatType;

  @Column({ length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'smallint', nullable: true })
  minAge: number | null;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({ type: 'date', nullable: true })
  startsAt: Date | null;

  @Column({ type: 'date', nullable: true })
  endsAt: Date | null;

  @Column({
    type: 'enum',
    enum: InitiativeStatus,
    default: InitiativeStatus.ACTIVE,
  })
  status: InitiativeStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (o) => o.initiatives, { onDelete: 'CASCADE' })
  organization: Organization;

  @ManyToOne(() => Category)
  category: Category;

  @OneToMany('Application', 'initiative')
  applications: any[];
}
