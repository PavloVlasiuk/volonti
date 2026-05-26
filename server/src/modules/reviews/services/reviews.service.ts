import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import {
  ApplicationStatus,
  InitiativeStatus,
  ReviewParty,
} from '../../../common/enums';
import { Review } from '../entities/review.entity';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { ReviewDto } from '../dtos/review.dto';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { InitiativesService } from '../../initiatives/services/initiatives.service';
import { VolunteerProfilesService } from '../../volunteer-profiles/services/volunteer-profiles.service';
import { Application } from '../../applications/entities/application.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @Inject(forwardRef(() => InitiativesService))
    private readonly initiativesService: InitiativesService,
    private readonly volunteerProfilesService: VolunteerProfilesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createFromVolunteer(
    initiativeId: string,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    const initiative = await this.initiativesService.findOne(initiativeId);
    if (initiative.status !== InitiativeStatus.COMPLETED) {
      throw new BadRequestException(
        'Reviews can only be left after the initiative is completed',
      );
    }

    const profile = await this.volunteerProfilesService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');

    const participated = await this.dataSource
      .getRepository(Application)
      .createQueryBuilder('a')
      .where('a.initiative_id = :initiativeId', { initiativeId })
      .andWhere('a.volunteer_profile_id = :profileId', { profileId: profile.id })
      .andWhere('a.participated = true')
      .getCount();
    if (participated === 0) {
      throw new ForbiddenException(
        'Only volunteers who participated can leave a review',
      );
    }

    const targetOrgId = initiative.organization.id;
    return this.persist(
      initiativeId,
      ReviewParty.VOLUNTEER,
      profile.id,
      ReviewParty.ORGANIZATION,
      targetOrgId,
      dto.rating,
      dto.comment,
    );
  }

  async createFromOrganization(
    initiativeId: string,
    orgId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    if (!dto.targetId) {
      throw new BadRequestException(
        'targetId (volunteer profile id) is required when an organization leaves a review',
      );
    }

    const initiative = await this.initiativesService.findOne(initiativeId);
    if (initiative.status !== InitiativeStatus.COMPLETED) {
      throw new BadRequestException(
        'Reviews can only be left after the initiative is completed',
      );
    }
    if (initiative.organization.id !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    const targetParticipated = await this.dataSource
      .getRepository(Application)
      .createQueryBuilder('a')
      .where('a.initiative_id = :initiativeId', { initiativeId })
      .andWhere('a.volunteer_profile_id = :profileId', {
        profileId: dto.targetId,
      })
      .andWhere('a.participated = true')
      .getCount();
    if (targetParticipated === 0) {
      throw new BadRequestException(
        'Target volunteer did not participate in this initiative',
      );
    }

    return this.persist(
      initiativeId,
      ReviewParty.ORGANIZATION,
      orgId,
      ReviewParty.VOLUNTEER,
      dto.targetId,
      dto.rating,
      dto.comment,
    );
  }

  async getOrganizationReviews(orgId: string): Promise<ReviewDto[]> {
    return this.reviewsRepository.findFor(ReviewParty.ORGANIZATION, orgId);
  }

  async getOwnReviewFromVolunteer(
    initiativeId: string,
    userId: string,
  ): Promise<ReviewDto | null> {
    const profile = await this.volunteerProfilesService.findByUserId(userId);
    if (!profile) return null;
    return this.reviewsRepository.findOwnForInitiative(
      initiativeId,
      ReviewParty.VOLUNTEER,
      profile.id,
    );
  }

  async getOwnReviewFromOrganization(
    initiativeId: string,
    orgId: string,
    targetId: string,
  ): Promise<ReviewDto | null> {
    return this.reviewsRepository.findOwnForInitiative(
      initiativeId,
      ReviewParty.ORGANIZATION,
      orgId,
      targetId,
    );
  }

  private async persist(
    initiativeId: string,
    authorType: ReviewParty,
    authorId: string,
    targetType: ReviewParty,
    targetId: string,
    rating: number,
    comment?: string,
  ): Promise<ReviewDto> {
    const entity = this.reviewsRepository.create({
      initiativeId,
      authorType,
      authorId,
      targetType,
      targetId,
      rating,
      comment: comment ?? null,
    });
    let saved: Review;
    try {
      saved = await this.reviewsRepository.save(entity);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as QueryFailedError & { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Review already submitted');
      }
      throw err;
    }
    const dto = await this.reviewsRepository.findOwnForInitiative(
      initiativeId,
      authorType,
      authorId,
      targetId,
    );
    return dto ?? this.toBareDto(saved);
  }

  private toBareDto(entity: Review): ReviewDto {
    return {
      id: entity.id,
      initiativeId: entity.initiativeId,
      authorType: entity.authorType,
      authorId: entity.authorId,
      authorName: '',
      targetType: entity.targetType,
      targetId: entity.targetId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt,
    };
  }
}
