import { OrgStatus, OrgType } from '../../../common/enums';
import { InitiativeDto } from '../../initiatives/dtos/initiative.dto';
import { ReviewDto } from '../../reviews/dtos/review.dto';
import { OrganizationDto } from './organization.dto';

export class OrganizationPublicDto {
  id: string;
  name: string;
  type: OrgType;
  contactPerson: string;
  status: OrgStatus;
  verifiedAt: Date | null;
  createdAt: Date;
  avgRating: number | null;
  reviewCount: number;
  activeInitiatives: InitiativeDto[];
  completedInitiatives: InitiativeDto[];
  recentReviews: ReviewDto[];

  constructor(
    org: OrganizationDto,
    activeInitiatives: InitiativeDto[],
    completedInitiatives: InitiativeDto[],
    recentReviews: ReviewDto[],
  ) {
    this.id = org.id;
    this.name = org.name;
    this.type = org.type;
    this.contactPerson = org.contactPerson;
    this.status = org.status;
    this.verifiedAt = org.verifiedAt;
    this.createdAt = org.createdAt;
    this.avgRating = org.avgRating;
    this.reviewCount = org.reviewCount;
    this.activeInitiatives = activeInitiatives;
    this.completedInitiatives = completedInitiatives;
    this.recentReviews = recentReviews;
  }
}
