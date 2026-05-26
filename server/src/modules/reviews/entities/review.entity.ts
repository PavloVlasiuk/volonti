import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReviewParty } from '../../../common/enums';

@Entity('reviews')
@Index('UQ_reviews_initiative_author_target', [
  'initiativeId',
  'authorType',
  'authorId',
  'targetId',
], { unique: true })
@Index('IDX_reviews_target', ['targetType', 'targetId'])
@Check('"rating" BETWEEN 1 AND 5')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'initiative_id', type: 'uuid' })
  initiativeId: string;

  @Column({
    name: 'author_type',
    type: 'enum',
    enum: ReviewParty,
    enumName: 'review_party_enum',
  })
  authorType: ReviewParty;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: ReviewParty,
    enumName: 'review_party_enum',
  })
  targetType: ReviewParty;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ name: 'rating', type: 'smallint' })
  rating: number;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
