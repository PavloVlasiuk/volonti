import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import {
  FormatPreference,
  FormatType,
  InitiativeStatus,
} from '../../../common/enums';
import { VolunteerProfile } from '../../volunteer-profiles/entities/volunteer-profile.entity';
import { Initiative } from '../entities/initiative.entity';
import { InitiativeDto } from '../dtos/initiative.dto';
import { FilterInitiativesDto } from '../dtos/filter-initiatives.dto';

@Injectable()
export class InitiativesRepository extends BaseRepositoryWrapper<
  Initiative,
  InitiativeDto
> {
  protected dtoClass = InitiativeDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Initiative, dataSource.createEntityManager());
  }

  async findAllWithFilters(
    filters: FilterInitiativesDto,
  ): Promise<InitiativeDto[]> {
    const qb = this.createQueryBuilder('i')
      .leftJoinAndSelect('i.organization', 'org')
      .leftJoinAndSelect('i.category', 'cat')
      .where('i.status = :status', { status: InitiativeStatus.ACTIVE });

    if (filters.category)
      qb.andWhere('cat.id = :category', { category: filters.category });
    if (filters.city)
      qb.andWhere('i.city ILIKE :city', { city: `%${filters.city}%` });
    if (filters.format)
      qb.andWhere('i.format = :format', { format: filters.format });
    if (filters.type) qb.andWhere('i.type = :type', { type: filters.type });

    const entities = await qb.orderBy('i.createdAt', 'DESC').getMany();
    return entities.map((e) => new InitiativeDto(e));
  }

  async findByIdWithRelations(id: string): Promise<InitiativeDto | null> {
    const entity = await this.findOne({
      where: { id },
      relations: ['organization', 'category'],
    });
    return entity ? new InitiativeDto(entity) : null;
  }

  async findByOrganization(organizationId: string): Promise<InitiativeDto[]> {
    const entities = await this.find({
      where: { organization: { id: organizationId } },
      relations: ['category', 'organization'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => new InitiativeDto(e));
  }

  async findMatchingForVolunteer(
    profile: VolunteerProfile,
  ): Promise<InitiativeDto[]> {
    const categoryIds = profile.interests.map((i: any) => i.category.id);
    const qb = this.createQueryBuilder('i')
      .leftJoinAndSelect('i.organization', 'org')
      .leftJoinAndSelect('i.category', 'cat')
      .where('i.status = :status', { status: InitiativeStatus.ACTIVE });

    if (categoryIds.length) {
      qb.andWhere('cat.id IN (:...categoryIds)', { categoryIds });
    }

    if (profile.formatPreference === FormatPreference.REMOTE) {
      qb.andWhere('i.format = :format', { format: FormatType.REMOTE });
    } else if (
      profile.formatPreference === FormatPreference.ON_SITE &&
      profile.city
    ) {
      qb.andWhere('i.format = :format AND i.city ILIKE :city', {
        format: FormatType.ON_SITE,
        city: profile.city,
      });
    }

    if (profile.age) {
      qb.andWhere('(i.minAge IS NULL OR i.minAge <= :age)', {
        age: profile.age,
      });
    }

    const entities = await qb.orderBy('i.createdAt', 'DESC').getMany();
    return entities.map((e) => new InitiativeDto(e));
  }
}
