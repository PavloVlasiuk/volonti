import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { Organization } from '../entities/organization.entity';
import { OrganizationDto } from '../dtos/organization.dto';
import { OrgStatus } from '../../../common/enums';

@Injectable()
export class OrganizationsRepository extends BaseRepositoryWrapper<
  Organization,
  OrganizationDto
> {
  protected dtoClass = OrganizationDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<OrganizationDto | null> {
    return this.findOneToDto({ where: { email } });
  }

  async findRawByEmail(email: string): Promise<Organization | null> {
    return this.findOne({ where: { email } });
  }

  async findRawByEdrpou(edrpou: string): Promise<Organization | null> {
    return this.findOne({ where: { edrpou } });
  }

  async findByStatus(status: OrgStatus): Promise<OrganizationDto[]> {
    const entities = await this.findToDto({
      where: { status },
      order: { createdAt: 'DESC' },
    });
    return entities;
  }
}
