import { OrgStatus, OrgType } from '../../../common/enums';
import { Organization } from '../entities/organization.entity';

export class OrganizationDto {
  id: string;
  name: string;
  type: OrgType;
  edrpou: string;
  contactPerson: string;
  documentUrl: string | null;
  status: OrgStatus;
  rejectionReason: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  userId: string;
  email: string | null;

  constructor(entity: Organization) {
    this.id = entity.id;
    this.name = entity.name;
    this.type = entity.type;
    this.edrpou = entity.edrpou;
    this.contactPerson = entity.contactPerson;
    this.documentUrl = entity.documentUrl ?? null;
    this.status = entity.status;
    this.rejectionReason = entity.rejectionReason ?? null;
    this.verifiedAt = entity.verifiedAt ?? null;
    this.createdAt = entity.createdAt;
    this.userId = entity.user?.id;
    this.email = entity.user?.email ?? null;
  }
}
