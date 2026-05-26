import {
  FormatType,
  InitiativeStatus,
  InitiativeType,
  OrgStatus,
} from '../../../common/enums';
import { Initiative } from '../entities/initiative.entity';

export class InitiativeDto {
  id: string;
  title: string;
  description: string;
  type: InitiativeType;
  format: FormatType;
  city: string | null;
  minAge: number | null;
  requirements: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  status: InitiativeStatus;
  slotsNeeded: number | null;
  acceptedCount: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organization: {
    id: string;
    name: string;
    status: OrgStatus;
    email: string;
  };
  categoryId: string;
  categoryName: string;

  constructor(entity: Initiative & { acceptedCount?: number }) {
    this.id = entity.id;
    this.title = entity.title;
    this.description = entity.description;
    this.type = entity.type;
    this.format = entity.format;
    this.city = entity.city ?? null;
    this.minAge = entity.minAge ?? null;
    this.requirements = entity.requirements ?? null;
    this.startsAt = entity.startsAt ?? null;
    this.endsAt = entity.endsAt ?? null;
    this.status = entity.status;
    this.slotsNeeded = entity.slotsNeeded ?? null;
    this.acceptedCount = Number(entity.acceptedCount ?? 0);
    this.completedAt = entity.completedAt ?? null;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.organization = {
      id: entity.organization?.id,
      name: entity.organization?.name,
      status: entity.organization?.status,
      email: entity.organization?.email,
    };
    this.categoryId = entity.category?.id;
    this.categoryName = entity.category?.name;
  }
}
