import {
  ApplicationStatus,
  AvailabilitySlot,
  FormatPreference,
} from '../../../common/enums';
import { Application } from '../entities/application.entity';

export class ApplicationDto {
  id: string;
  status: ApplicationStatus;
  motivation: string;
  availability: AvailabilitySlot[];
  contactPhone: string | null;
  experience: string | null;
  hasTransport: boolean;
  canStartImmediately: boolean;
  participated: boolean | null;
  hoursLogged: number | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  initiative: {
    id: string;
    title: string;
    organization: {
      id: string;
      name: string;
    };
  };
  volunteer: {
    id: string;
    firstName: string;
    lastName: string;
    city: string | null;
    age: number | null;
    formatPreference: FormatPreference;
    bio: string | null;
    interests: { id: string; name: string }[];
    avgRating: number | null;
    reviewCount: number;
  };

  constructor(
    entity: Application & {
      volunteerAvgRating?: number | null;
      volunteerReviewCount?: number;
    },
  ) {
    this.id = entity.id;
    this.status = entity.status;
    this.motivation = entity.motivation ?? '';
    this.availability = entity.availability ?? [];
    this.contactPhone = entity.contactPhone ?? null;
    this.experience = entity.experience ?? null;
    this.hasTransport = entity.hasTransport ?? false;
    this.canStartImmediately = entity.canStartImmediately ?? false;
    this.participated = entity.participated ?? null;
    this.hoursLogged = entity.hoursLogged ?? null;
    this.completedAt = entity.completedAt ?? null;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.initiative = {
      id: entity.initiative?.id,
      title: entity.initiative?.title,
      organization: {
        id: entity.initiative?.organization?.id,
        name: entity.initiative?.organization?.name,
      },
    };
    const profile = entity.volunteerProfile;
    this.volunteer = {
      id: profile?.id,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      city: profile?.city ?? null,
      age: profile?.age ?? null,
      formatPreference: profile?.formatPreference,
      bio: profile?.bio ?? null,
      interests:
        profile?.interests?.map((i) => ({
          id: i.category?.id,
          name: i.category?.name,
        })) ?? [],
      avgRating:
        entity.volunteerAvgRating === undefined ||
        entity.volunteerAvgRating === null
          ? null
          : Number(entity.volunteerAvgRating),
      reviewCount: Number(entity.volunteerReviewCount ?? 0),
    };
  }
}
