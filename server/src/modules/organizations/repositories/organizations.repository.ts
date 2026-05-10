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

  async findByUserId(userId: string): Promise<Organization | null> {
    return this.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findByStatus(status: OrgStatus): Promise<OrganizationDto[]> {
    const entities = await this.find({
      where: { status },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => new OrganizationDto(e));
  }
}
