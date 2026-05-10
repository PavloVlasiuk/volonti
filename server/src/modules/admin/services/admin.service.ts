import { Injectable, NotFoundException } from '@nestjs/common';
import { OrgStatus } from '../../../common/enums';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { OrganizationDto } from '../../organizations/dtos/organization.dto';
import { MailService } from '../../mail/services/mail.service';
import { RejectOrganizationDto } from '../dtos/reject-organization.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly mailService: MailService,
  ) {}

  async listOrganizations(status: OrgStatus): Promise<OrganizationDto[]> {
    return this.organizationsService.findByStatus(status);
  }

  async findOne(orgId: string): Promise<OrganizationDto> {
    return this.organizationsService.findById(orgId);
  }

  async verify(orgId: string): Promise<void> {
    const org = await this.organizationsService.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');
    await this.organizationsService.updateStatus(orgId, OrgStatus.VERIFIED);
    if (org.email) {
      this.mailService
        .sendVerificationResult(org.email, org.name, OrgStatus.VERIFIED)
        .catch(() => {});
    }
  }

  async reject(orgId: string, dto: RejectOrganizationDto): Promise<void> {
    const org = await this.organizationsService.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');
    await this.organizationsService.updateStatus(
      orgId,
      OrgStatus.REJECTED,
      dto.reason,
    );
    if (org.email) {
      this.mailService
        .sendVerificationResult(
          org.email,
          org.name,
          OrgStatus.REJECTED,
          dto.reason,
        )
        .catch(() => {});
    }
  }
}
