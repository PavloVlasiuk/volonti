import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { OrgStatus } from '../../../common/enums';
import { Organization } from '../entities/organization.entity';
import { OrganizationDto } from '../dtos/organization.dto';
import { OrganizationsRepository } from '../repositories/organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  async findByUserId(userId: string): Promise<OrganizationDto | null> {
    const org = await this.organizationsRepository.findByUserId(userId);
    return org ? new OrganizationDto(org) : null;
  }

  async findById(id: string): Promise<OrganizationDto> {
    const org = await this.organizationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!org) throw new NotFoundException('Organization not found');
    return new OrganizationDto(org);
  }

  async findByStatus(status: OrgStatus): Promise<OrganizationDto[]> {
    return this.organizationsRepository.findByStatus(status);
  }

  async create(data: DeepPartial<Organization>): Promise<OrganizationDto> {
    return this.organizationsRepository.saveToDto(data);
  }

  async updateStatus(
    id: string,
    status: OrgStatus,
    reason?: string,
  ): Promise<void> {
    const update: Partial<Organization> = { status };
    if (status === OrgStatus.VERIFIED) update.verifiedAt = new Date();
    if (status === OrgStatus.REJECTED && reason)
      update.rejectionReason = reason;
    await this.organizationsRepository.update(id, update);
  }
}
