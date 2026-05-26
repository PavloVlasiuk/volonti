import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import {
  ApplicationStatus,
  FormatPreference,
  FormatType,
  InitiativeStatus,
} from '../../../common/enums';
import { Initiative } from '../entities/initiative.entity';
import { InitiativeDto } from '../dtos/initiative.dto';
import { FilterInitiativesDto } from '../dtos/filter-initiatives.dto';
import { VolunteerProfileDto } from '../../volunteer-profiles/dtos/volunteer-profile.dto';

@Injectable()
export class InitiativesRepository extends BaseRepositoryWrapper<
  Initiative,
  InitiativeDto
> {
  protected dtoClass = InitiativeDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Initiative, dataSource.createEntityManager());
  }

  private baseQuery(): SelectQueryBuilder<Initiative> {
    return this.createQueryBuilder('i')
      .leftJoinAndSelect('i.organization', 'org')
      .leftJoinAndSelect('i.category', 'cat')
      .loadRelationCountAndMap(
        'i.acceptedCount',
        'i.applications',
        'app',
        (q) =>
          q.where('app.status = :acceptedStatus', {
            acceptedStatus: ApplicationStatus.ACCEPTED,
          }),
      );
  }

  async findAllWithFilters(
    filters: FilterInitiativesDto,
  ): Promise<InitiativeDto[]> {
    const qb = this.baseQuery().where('i.status = :status', {
      status: InitiativeStatus.ACTIVE,
    });

    if (filters.category)
      qb.andWhere('cat.id = :category', { category: filters.category });
    if (filters.city)
      qb.andWhere('i.city ILIKE :city', { city: `%${filters.city}%` });
    if (filters.format)
      qb.andWhere('i.format = :format', { format: filters.format });
    if (filters.type) qb.andWhere('i.type = :type', { type: filters.type });
    if (filters.organizationId)
      qb.andWhere('org.id = :organizationId', {
        organizationId: filters.organizationId,
      });

    const entities = await qb.orderBy('i.createdAt', 'DESC').getMany();
    return entities.map(
      (e) => new InitiativeDto(e as Initiative & { acceptedCount?: number }),
    );
  }

  async findByIdWithRelations(id: string): Promise<InitiativeDto | null> {
    const entity = await this.baseQuery()
      .where('i.id = :id', { id })
      .getOne();
    return entity
      ? new InitiativeDto(entity as Initiative & { acceptedCount?: number })
      : null;
  }

  async findByOrganization(organizationId: string): Promise<InitiativeDto[]> {
    const entities = await this.baseQuery()
      .where('org.id = :organizationId', { organizationId })
      .orderBy('i.createdAt', 'DESC')
      .getMany();
    return entities.map(
      (e) => new InitiativeDto(e as Initiative & { acceptedCount?: number }),
    );
  }

  async findMatchingForVolunteer(
    profile: VolunteerProfileDto,
  ): Promise<InitiativeDto[]> {
    const categoryIds = profile.interests.map((i) => i.id);
    const qb = this.baseQuery().where('i.status = :status', {
      status: InitiativeStatus.ACTIVE,
    });

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
    return entities.map(
      (e) => new InitiativeDto(e as Initiative & { acceptedCount?: number }),
    );
  }
}
