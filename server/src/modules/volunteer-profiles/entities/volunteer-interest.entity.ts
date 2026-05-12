import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { VolunteerProfile } from './volunteer-profile.entity';
import { Category } from '../../categories/entities/category.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('volunteer_interests')
@Unique(['volunteerProfileId', 'categoryId'])
export class VolunteerInterest extends BaseEntity {
  @Column({ name: 'volunteer_profile_id' })
  volunteerProfileId: string;

  @ManyToOne(() => VolunteerProfile, (vp) => vp.interests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'volunteer_profile_id' })
  volunteerProfile: VolunteerProfile;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
