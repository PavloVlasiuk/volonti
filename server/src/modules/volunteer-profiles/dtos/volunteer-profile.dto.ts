import { FormatPreference } from '../../../common/enums';
import { VolunteerProfile } from '../entities/volunteer-profile.entity';

export class VolunteerProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  city: string | null;
  age: number | null;
  formatPreference: FormatPreference;
  bio: string | null;
  updatedAt: Date;
  interests: Array<{ id: string; name: string }>;

  constructor(entity: VolunteerProfile) {
    this.id = entity.id;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.city = entity.city ?? null;
    this.age = entity.age ?? null;
    this.formatPreference = entity.formatPreference;
    this.bio = entity.bio ?? null;
    this.updatedAt = entity.updatedAt;
    this.interests =
      entity.interests?.map((vi) => ({
        id: vi.category.id,
        name: vi.category.name,
      })) ?? [];
  }
}
