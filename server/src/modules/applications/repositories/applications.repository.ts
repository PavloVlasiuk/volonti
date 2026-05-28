import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { Application } from '../entities/application.entity';
import { ApplicationDto } from '../dtos/application.dto';
import { ApplicationStatus, ReviewParty } from '../../../common/enums';
import { ReviewsRepository } from '../../reviews/repositories/reviews.repository';

const APPLICATION_RELATIONS = [
  'initiative',
  'initiative.organization',
  'volunteerProfile',
  'volunteerProfile.interests',
  'volunteerProfile.interests.category',
];

type RatedApplication = Application & {
  volunteerAvgRating?: number | null;
  volunteerReviewCount?: number;
};

@Injectable()
export class ApplicationsRepository extends BaseRepositoryWrapper<
  Application,
  ApplicationDto
> {
  protected dtoClass = ApplicationDto;

  constructor(
    @InjectDataSource() dataSource: DataSource,
    @Inject(forwardRef(() => ReviewsRepository))
    private readonly reviewsRepository: ReviewsRepository,
  ) {
    super(Application, dataSource.createEntityManager());
  }

  async toDtosWithRatings(entities: Application[]): Promise<ApplicationDto[]> {
    if (entities.length === 0) return [];
    const volunteerIds = Array.from(
      new Set(entities.map((e) => e.volunteerProfile?.id).filter(Boolean)),
    );
    const ratings = await this.reviewsRepository.aggregateForMany(
      ReviewParty.VOLUNTEER,
      volunteerIds,
    );
    return entities.map((e) => {
      const rating = e.volunteerProfile?.id
        ? ratings.get(e.volunteerProfile.id)
        : undefined;
      const enriched: RatedApplication = e as RatedApplication;
      enriched.volunteerAvgRating = rating?.avg ?? null;
      enriched.volunteerReviewCount = rating?.count ?? 0;
      return new ApplicationDto(enriched);
    });
  }

  async findById(id: string): Promise<ApplicationDto | null> {
    const entity = await this.findOne({
      where: { id },
      relations: APPLICATION_RELATIONS,
    });
    if (!entity) return null;
    const [dto] = await this.toDtosWithRatings([entity]);
    return dto;
  }

  async findByVolunteerProfile(
    volunteerProfileId: string,
  ): Promise<ApplicationDto[]> {
    const entities = await this.find({
      where: { volunteerProfile: { id: volunteerProfileId } },
      relations: APPLICATION_RELATIONS,
      order: { createdAt: 'DESC' },
    });
    return this.toDtosWithRatings(entities);
  }

  async findOwnForInitiative(
    initiativeId: string,
    volunteerProfileId: string,
  ): Promise<ApplicationDto | null> {
    const entity = await this.findOne({
      where: {
        initiative: { id: initiativeId },
        volunteerProfile: { id: volunteerProfileId },
      },
      relations: APPLICATION_RELATIONS,
    });
    if (!entity) return null;
    const [dto] = await this.toDtosWithRatings([entity]);
    return dto;
  }

  async findByInitiative(initiativeId: string): Promise<ApplicationDto[]> {
    const entities = await this.find({
      where: { initiative: { id: initiativeId } },
      relations: APPLICATION_RELATIONS,
      order: { createdAt: 'DESC' },
    });
    return this.toDtosWithRatings(entities);
  }

  countAccepted(initiativeId: string): Promise<number> {
    return this.count({
      where: {
        initiativeId,
        status: ApplicationStatus.ACCEPTED,
      },
    });
  }
}
