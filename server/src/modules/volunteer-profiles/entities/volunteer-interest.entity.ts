import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { VolunteerProfile } from './volunteer-profile.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('volunteer_interests')
@Unique(['volunteerProfile', 'category'])
export class VolunteerInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VolunteerProfile, (vp) => vp.interests, {
    onDelete: 'CASCADE',
  })
  volunteerProfile: VolunteerProfile;

  @ManyToOne(() => Category, { eager: true })
  category: Category;
}
