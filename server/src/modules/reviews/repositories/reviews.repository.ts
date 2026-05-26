import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { ReviewParty } from '../../../common/enums';
import { Review } from '../entities/review.entity';
import { ReviewDto } from '../dtos/review.dto';

export interface ReviewAggregate {
  avg: number | null;
  count: number;
}

class ReviewDtoBox {
  id: string;
  initiativeId: string;
  authorType: ReviewParty;
  authorId: string;
  authorName: string;
  targetType: ReviewParty;
  targetId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;

  constructor(entity: Review) {
    this.id = entity.id;
    this.initiativeId = entity.initiativeId;
    this.authorType = entity.authorType;
    this.authorId = entity.authorId;
    this.authorName = '';
    this.targetType = entity.targetType;
    this.targetId = entity.targetId;
    this.rating = entity.rating;
    this.comment = entity.comment;
    this.createdAt = entity.createdAt;
  }
}

@Injectable()
export class ReviewsRepository extends BaseRepositoryWrapper<Review, ReviewDto> {
  protected dtoClass = ReviewDtoBox;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }

  async aggregateFor(
    targetType: ReviewParty,
    targetId: string,
  ): Promise<ReviewAggregate> {
    const row = await this.createQueryBuilder('r')
      .select('AVG(r.rating)::float', 'avg')
      .addSelect('COUNT(*)::int', 'count')
      .where('r.target_type = :targetType', { targetType })
      .andWhere('r.target_id = :targetId', { targetId })
      .getRawOne<{ avg: number | null; count: number }>();
    const count = Number(row?.count ?? 0);
    const avg = row?.avg === null || row?.avg === undefined ? null : Number(row.avg);
    return { avg, count };
  }

  async aggregateForMany(
    targetType: ReviewParty,
    targetIds: string[],
  ): Promise<Map<string, ReviewAggregate>> {
    const map = new Map<string, ReviewAggregate>();
    if (targetIds.length === 0) return map;
    const rows = await this.createQueryBuilder('r')
      .select('r.target_id', 'targetId')
      .addSelect('AVG(r.rating)::float', 'avg')
      .addSelect('COUNT(*)::int', 'count')
      .where('r.target_type = :targetType', { targetType })
      .andWhere('r.target_id IN (:...targetIds)', { targetIds })
      .groupBy('r.target_id')
      .getRawMany<{ targetId: string; avg: number | null; count: number }>();
    for (const row of rows) {
      map.set(row.targetId, {
        avg: row.avg === null || row.avg === undefined ? null : Number(row.avg),
        count: Number(row.count),
      });
    }
    return map;
  }

  async findFor(
    targetType: ReviewParty,
    targetId: string,
    limit?: number,
  ): Promise<ReviewDto[]> {
    const qb = this.createQueryBuilder('r')
      .where('r.target_type = :targetType', { targetType })
      .andWhere('r.target_id = :targetId', { targetId })
      .orderBy('r.created_at', 'DESC');
    if (limit) qb.limit(limit);
    const entities = await qb.getMany();
    return this.attachAuthorNames(entities);
  }

  async findOwnForInitiative(
    initiativeId: string,
    authorType: ReviewParty,
    authorId: string,
    targetId?: string,
  ): Promise<ReviewDto | null> {
    const qb = this.createQueryBuilder('r')
      .where('r.initiative_id = :initiativeId', { initiativeId })
      .andWhere('r.author_type = :authorType', { authorType })
      .andWhere('r.author_id = :authorId', { authorId });
    if (targetId) qb.andWhere('r.target_id = :targetId', { targetId });
    const entity = await qb.getOne();
    if (!entity) return null;
    const [dto] = await this.attachAuthorNames([entity]);
    return dto;
  }

  private async attachAuthorNames(entities: Review[]): Promise<ReviewDto[]> {
    if (entities.length === 0) return [];

    const volunteerIds = entities
      .filter((e) => e.authorType === ReviewParty.VOLUNTEER)
      .map((e) => e.authorId);
    const orgIds = entities
      .filter((e) => e.authorType === ReviewParty.ORGANIZATION)
      .map((e) => e.authorId);

    const volunteerNames = new Map<string, string>();
    const orgNames = new Map<string, string>();

    if (volunteerIds.length > 0) {
      const rows = await this.dataSource.query<
        { id: string; first_name: string; last_name: string }[]
      >(
        `SELECT id, first_name, last_name
           FROM volunteer_profiles
          WHERE id = ANY($1::uuid[])`,
        [volunteerIds],
      );
      for (const row of rows) {
        volunteerNames.set(row.id, `${row.first_name} ${row.last_name}`.trim());
      }
    }

    if (orgIds.length > 0) {
      const rows = await this.dataSource.query<{ id: string; name: string }[]>(
        `SELECT id, name FROM organizations WHERE id = ANY($1::uuid[])`,
        [orgIds],
      );
      for (const row of rows) {
        orgNames.set(row.id, row.name);
      }
    }

    return entities.map((e) => ({
      id: e.id,
      initiativeId: e.initiativeId,
      authorType: e.authorType,
      authorId: e.authorId,
      authorName:
        e.authorType === ReviewParty.VOLUNTEER
          ? volunteerNames.get(e.authorId) ?? ''
          : orgNames.get(e.authorId) ?? '',
      targetType: e.targetType,
      targetId: e.targetId,
      rating: e.rating,
      comment: e.comment,
      createdAt: e.createdAt,
    }));
  }
}
