import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import {
  ApplicationStatus,
  InitiativeStatus,
  ReviewParty,
} from '../../../common/enums';
import { Initiative } from '../entities/initiative.entity';
import { InitiativeDto } from '../dtos/initiative.dto';
import { FilterInitiativesDto } from '../dtos/filter-initiatives.dto';
import { VolunteerProfileDto } from '../../volunteer-profiles/dtos/volunteer-profile.dto';
import { ReviewsRepository } from '../../reviews/repositories/reviews.repository';

export type RatedInitiative = Initiative & {
  acceptedCount?: number;
  organizationAvgRating?: number | null;
  organizationReviewCount?: number;
};

@Injectable()
export class InitiativesRepository extends BaseRepositoryWrapper<
  Initiative,
  InitiativeDto
> {
  protected dtoClass = InitiativeDto;

  constructor(
    @InjectDataSource() dataSource: DataSource,
    @Inject(forwardRef(() => ReviewsRepository))
    private readonly reviewsRepository: ReviewsRepository,
  ) {
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

  private async toDtosWithRatings(
    entities: Initiative[],
  ): Promise<InitiativeDto[]> {
    if (entities.length === 0) return [];
    const orgIds = Array.from(
      new Set(entities.map((e) => e.organization?.id).filter(Boolean)),
    );
    const ratings = await this.reviewsRepository.aggregateForMany(
      ReviewParty.ORGANIZATION,
      orgIds,
    );
    return entities.map((e) => {
      const rating = e.organization?.id
        ? ratings.get(e.organization.id)
        : undefined;
      const enriched: RatedInitiative = e as RatedInitiative;
      enriched.organizationAvgRating = rating?.avg ?? null;
      enriched.organizationReviewCount = rating?.count ?? 0;
      return new InitiativeDto(enriched);
    });
  }

  async findAllWithFilters(
    filters: FilterInitiativesDto,
  ): Promise<{ items: InitiativeDto[]; total: number }> {
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

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    qb.orderBy('i.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [entities, total] = await qb.getManyAndCount();
    const items = await this.toDtosWithRatings(entities);
    return { items, total };
  }

  async findByIdWithRelations(id: string): Promise<InitiativeDto | null> {
    const entity = await this.baseQuery()
      .where('i.id = :id', { id })
      .getOne();
    if (!entity) return null;
    const [dto] = await this.toDtosWithRatings([entity]);
    return dto;
  }

  async findByOrganization(organizationId: string): Promise<InitiativeDto[]> {
    const entities = await this.baseQuery()
      .where('org.id = :organizationId', { organizationId })
      .orderBy('i.createdAt', 'DESC')
      .getMany();
    return this.toDtosWithRatings(entities);
  }

  async findCandidateEntitiesForFeed(
    profile: VolunteerProfileDto,
    userId: string,
    filters: {
      category?: string;
      city?: string;
      format?: string;
      type?: string;
    } = {},
  ): Promise<RatedInitiative[]> {
    const qb = this.baseQuery().where('i.status = :status', {
      status: InitiativeStatus.ACTIVE,
    });

    if (profile.age) {
      qb.andWhere('(i.minAge IS NULL OR i.minAge <= :age)', {
        age: profile.age,
      });
    }

    qb.andWhere(
      `i.id NOT IN (
        SELECT a.initiative_id FROM applications a
        WHERE a.volunteer_profile_id = :volunteerProfileId
      )`,
      { volunteerProfileId: profile.id },
    );

    qb.andWhere(
      `i.id NOT IN (
        SELECT d.initiative_id FROM initiative_dismissals d
        WHERE d.user_id = :userId
      )`,
      { userId },
    );

    if (filters.category)
      qb.andWhere('cat.id = :category', { category: filters.category });
    if (filters.city)
      qb.andWhere('i.city ILIKE :city', { city: `%${filters.city}%` });
    if (filters.format)
      qb.andWhere('i.format = :format', { format: filters.format });
    if (filters.type) qb.andWhere('i.type = :type', { type: filters.type });

    const entities = await qb.orderBy('i.createdAt', 'DESC').getMany();
    if (entities.length === 0) return [];

    const orgIds = Array.from(
      new Set(entities.map((e) => e.organization?.id).filter(Boolean)),
    );
    const ratings = await this.reviewsRepository.aggregateForMany(
      ReviewParty.ORGANIZATION,
      orgIds,
    );
    for (const e of entities) {
      const rating = e.organization?.id
        ? ratings.get(e.organization.id)
        : undefined;
      const enriched = e as RatedInitiative;
      enriched.organizationAvgRating = rating?.avg ?? null;
      enriched.organizationReviewCount = rating?.count ?? 0;
    }
    return entities as RatedInitiative[];
  }
}
