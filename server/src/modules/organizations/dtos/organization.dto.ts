import { OrgStatus, OrgType } from '../../../common/enums';
import { Organization } from '../entities/organization.entity';

export class OrganizationDto {
  id: string;
  name: string;
  type: OrgType;
  edrpou: string;
  contactPerson: string;
  documentUrl: string | null;
  email: string;
  status: OrgStatus;
  rejectionReason: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  avgRating: number | null;
  reviewCount: number;

  constructor(
    entity: Organization & { avgRating?: number | null; reviewCount?: number },
  ) {
    this.id = entity.id;
    this.name = entity.name;
    this.type = entity.type;
    this.edrpou = entity.edrpou;
    this.contactPerson = entity.contactPerson;
    this.documentUrl = entity.documentUrl ?? null;
    this.email = entity.email;
    this.status = entity.status;
    this.rejectionReason = entity.rejectionReason ?? null;
    this.verifiedAt = entity.verifiedAt ?? null;
    this.createdAt = entity.createdAt;
    this.avgRating =
      entity.avgRating === undefined || entity.avgRating === null
        ? null
        : Number(entity.avgRating);
    this.reviewCount = Number(entity.reviewCount ?? 0);
  }
}
