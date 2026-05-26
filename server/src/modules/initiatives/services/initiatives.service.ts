import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EnvironmentVariables } from '../../../env.variables';
import { InitiativeStatus, ReviewParty } from '../../../common/enums';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { VolunteerProfilesService } from '../../volunteer-profiles/services/volunteer-profiles.service';
import { MailService } from '../../mail/services/mail.service';
import { VolunteerInterest } from '../../volunteer-profiles/entities/volunteer-interest.entity';
import { InitiativesRepository } from '../repositories/initiatives.repository';
import { InitiativeDismissalsRepository } from '../repositories/initiative-dismissals.repository';
import { Initiative } from '../entities/initiative.entity';
import { InitiativeDto } from '../dtos/initiative.dto';
import { FeedItemDto } from '../dtos/feed-item.dto';
import { CreateInitiativeDto } from '../dtos/create-initiative.dto';
import { UpdateInitiativeDto } from '../dtos/update-initiative.dto';
import { UpdateInitiativeStatusDto } from '../dtos/update-initiative-status.dto';
import { CompleteInitiativeDto } from '../dtos/complete-initiative.dto';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationDto } from '../../applications/dtos/application.dto';
import { FilterInitiativesDto } from '../dtos/filter-initiatives.dto';
import { FeedQueryDto } from '../dtos/feed-query.dto';
import { PaginatedDto } from '../../../common/dtos/paginated.dto';
import { ReviewsRepository } from '../../reviews/repositories/reviews.repository';
import { MatchingService } from '../../matching/services/matching.service';

@Injectable()
export class InitiativesService {
  constructor(
    private readonly initiativesRepository: InitiativesRepository,
    private readonly initiativeDismissalsRepository: InitiativeDismissalsRepository,
    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationsService: OrganizationsService,
    @Inject(forwardRef(() => VolunteerProfilesService))
    private readonly volunteerProfilesService: VolunteerProfilesService,
    private readonly mailService: MailService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ReviewsRepository))
    private readonly reviewsRepository: ReviewsRepository,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly matchingService: MatchingService,
  ) {}

  async dismiss(initiativeId: string, userId: string): Promise<void> {
    const exists = await this.initiativesRepository.exist({
      where: { id: initiativeId },
    });
    if (!exists) throw new NotFoundException('Initiative not found');
    await this.initiativeDismissalsRepository.dismiss(userId, initiativeId);
  }

  private async attachVolunteerRatings(
    apps: Application[],
  ): Promise<ApplicationDto[]> {
    if (apps.length === 0) return [];
    const volunteerIds = Array.from(
      new Set(apps.map((a) => a.volunteerProfile?.id).filter(Boolean)),
    );
    const ratings = await this.reviewsRepository.aggregateForMany(
      ReviewParty.VOLUNTEER,
      volunteerIds,
    );
    return apps.map((a) => {
      const rating = a.volunteerProfile?.id
        ? ratings.get(a.volunteerProfile.id)
        : undefined;
      const enriched = a as Application & {
        volunteerAvgRating?: number | null;
        volunteerReviewCount?: number;
      };
      enriched.volunteerAvgRating = rating?.avg ?? null;
      enriched.volunteerReviewCount = rating?.count ?? 0;
      return new ApplicationDto(enriched);
    });
  }

  async create(
    userId: string,
    dto: CreateInitiativeDto,
  ): Promise<InitiativeDto> {
    const org = await this.organizationsService.findById(userId);
    const { categoryId, ...fields } = dto;
    const entity = this.initiativesRepository.create({
      ...fields,
      organization: { id: org.id },
      category: { id: categoryId },
    });
    const saved = await this.initiativesRepository.save(entity);
    const result = await this.initiativesRepository.findByIdWithRelations(
      saved.id,
    );
    this.notifyMatchingVolunteers(result);
    return result;
  }

  async findAll(
    filters: FilterInitiativesDto,
  ): Promise<PaginatedDto<InitiativeDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const { items, total } =
      await this.initiativesRepository.findAllWithFilters(filters);
    return new PaginatedDto(items, total, page, limit);
  }

  async getMyInitiatives(userId: string): Promise<InitiativeDto[]> {
    const org = await this.organizationsService.findById(userId);
    if (!org) return [];
    return this.initiativesRepository.findByOrganization(org.id);
  }

  async findOne(id: string): Promise<InitiativeDto> {
    const dto = await this.initiativesRepository.findByIdWithRelations(id);
    if (!dto) throw new NotFoundException('Initiative not found');
    return dto;
  }

  async findById(id: string): Promise<InitiativeDto | null> {
    return this.initiativesRepository.findOneToDto({
      where: { id },
      relations: ['organization'],
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateInitiativeDto,
  ): Promise<InitiativeDto> {
    const initiative = await this.initiativesRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!initiative) throw new NotFoundException('Initiative not found');
    const org = await this.organizationsService.findById(userId);
    if (initiative.organization?.id !== org?.id)
      throw new ForbiddenException('Access denied');

    const { categoryId, ...fields } = dto;
    Object.assign(initiative, fields);
    if (categoryId !== undefined)
      initiative.category = { id: categoryId } as any;
    await this.initiativesRepository.save(initiative);
    return await this.initiativesRepository.findByIdWithRelations(id);
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateInitiativeStatusDto,
  ): Promise<InitiativeDto> {
    const existingDto =
      await this.initiativesRepository.findByIdWithRelations(id);
    if (!existingDto) throw new NotFoundException('Initiative not found');
    const org = await this.organizationsService.findById(userId);
    if (existingDto.organization.id !== org?.id)
      throw new ForbiddenException('Access denied');
    await this.initiativesRepository.update(id, { status: dto.status });
    return await this.initiativesRepository.findByIdWithRelations(id);
  }

  async complete(
    id: string,
    userId: string,
    dto: CompleteInitiativeDto,
  ): Promise<InitiativeDto> {
    const existing = await this.initiativesRepository.findByIdWithRelations(id);
    if (!existing) throw new NotFoundException('Initiative not found');

    const org = await this.organizationsService.findById(userId);
    if (existing.organization.id !== org?.id) {
      throw new ForbiddenException('Access denied');
    }
    if (
      existing.status !== InitiativeStatus.ACTIVE &&
      existing.status !== InitiativeStatus.CLOSED
    ) {
      throw new BadRequestException('Initiative is already completed');
    }

    await this.dataSource.transaction(async (manager) => {
      const now = new Date();
      for (const entry of dto.participations) {
        await manager
          .createQueryBuilder()
          .update(Application)
          .set({
            participated: entry.participated,
            hoursLogged: entry.hours,
            completedAt: now,
          })
          .where('id = :id AND initiative_id = :initiativeId', {
            id: entry.applicationId,
            initiativeId: id,
          })
          .execute();
      }
      await manager.update(Initiative, id, {
        status: InitiativeStatus.COMPLETED,
        completedAt: now,
      });
    });

    this.requestReviews(id, existing.title, existing.organization).catch(
      () => {},
    );

    return this.initiativesRepository.findByIdWithRelations(id);
  }

  private async requestReviews(
    initiativeId: string,
    initiativeTitle: string,
    organization: InitiativeDto['organization'],
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL', { infer: true }) ?? '';

    const volunteers = await this.dataSource
      .getRepository(Application)
      .createQueryBuilder('a')
      .innerJoin('a.volunteerProfile', 'vp')
      .innerJoin('vp.user', 'u')
      .select('u.email', 'email')
      .addSelect('vp.first_name', 'firstName')
      .where('a.initiative_id = :initiativeId', { initiativeId })
      .andWhere('a.participated = true')
      .getRawMany<{ email: string; firstName: string }>();

    const volunteerUrl = `${frontendUrl}/applications`;
    for (const v of volunteers) {
      this.mailService
        .sendReviewRequest(v.email, v.firstName, initiativeTitle, volunteerUrl)
        .catch(() => {});
    }

    if (organization?.email && volunteers.length > 0) {
      const orgUrl = `${frontendUrl}/initiatives/${initiativeId}/applications`;
      this.mailService
        .sendReviewRequest(
          organization.email,
          organization.name,
          initiativeTitle,
          orgUrl,
        )
        .catch(() => {});
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingDto =
      await this.initiativesRepository.findByIdWithRelations(id);
    if (!existingDto) throw new NotFoundException('Initiative not found');
    const org = await this.organizationsService.findById(userId);
    if (existingDto.organization.id !== org?.id)
      throw new ForbiddenException('Access denied');
    await this.initiativesRepository.delete(id);
  }

  async getApplications(
    initiativeId: string,
    userId: string,
  ): Promise<ApplicationDto[]> {
    const existingDto =
      await this.initiativesRepository.findByIdWithRelations(initiativeId);
    if (!existingDto) throw new NotFoundException('Initiative not found');
    const org = await this.organizationsService.findById(userId);
    if (existingDto.organization.id !== org?.id)
      throw new ForbiddenException('Access denied');

    const apps = await this.dataSource
      .getRepository(Application)
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.volunteerProfile', 'vp')
      .innerJoinAndSelect('a.initiative', 'i')
      .leftJoinAndSelect('i.organization', 'org')
      .leftJoinAndSelect('vp.interests', 'vi')
      .leftJoinAndSelect('vi.category', 'cat')
      .where('i.id = :initiativeId', { initiativeId })
      .orderBy('a.createdAt', 'DESC')
      .getMany();
    return this.attachVolunteerRatings(apps);
  }

  async getFeed(
    userId: string,
    query: FeedQueryDto = {},
  ): Promise<PaginatedDto<FeedItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const profile = await this.volunteerProfilesService.findByUserId(userId);
    if (!profile) return new PaginatedDto<FeedItemDto>([], 0, page, limit);

    const affinity = await this.loadAppliedAffinity(profile.id);
    const entities =
      await this.initiativesRepository.findCandidateEntitiesForFeed(
        profile,
        userId,
        {
          category: query.category,
          city: query.city,
          format: query.format,
          type: query.type,
        },
      );

    const items = entities.map((entity) => {
      const dto = new InitiativeDto(entity);
      const { score, reasons } = this.matchingService.scoreForVolunteer(
        dto,
        profile,
        affinity,
      );
      return new FeedItemDto(entity, score, reasons);
    });

    items.sort((a, b) => b.matchScore - a.matchScore);

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);
    return new PaginatedDto(paged, total, page, limit);
  }

  private async loadAppliedAffinity(
    volunteerProfileId: string,
  ): Promise<Map<string, number>> {
    const rows = await this.dataSource
      .getRepository(Application)
      .createQueryBuilder('a')
      .innerJoin('a.initiative', 'i')
      .select('i.category_id', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('a.volunteer_profile_id = :volunteerProfileId', {
        volunteerProfileId,
      })
      .groupBy('i.category_id')
      .getRawMany<{ categoryId: string; count: string }>();

    const map = new Map<string, number>();
    if (rows.length === 0) return map;

    const counts = rows.map((r) => Number(r.count));
    const maxCount = Math.max(...counts);
    if (maxCount <= 0) return map;

    for (const r of rows) {
      map.set(r.categoryId, Number(r.count) / maxCount);
    }
    return map;
  }

  private notifyMatchingVolunteers(initiative: InitiativeDto): void {
    this.dataSource
      .getRepository(VolunteerInterest)
      .createQueryBuilder('vi')
      .innerJoinAndSelect('vi.volunteerProfile', 'vp')
      .innerJoinAndSelect('vp.user', 'u')
      .innerJoin('vi.category', 'cat')
      .where('cat.id = :categoryId', { categoryId: initiative.categoryId })
      .andWhere('(:minAge IS NULL OR vp.age IS NULL OR vp.age >= :minAge)', {
        minAge: initiative.minAge ?? null,
      })
      .getMany()
      .then((interests) =>
        Promise.all(
          interests.map((vi) =>
            this.mailService.sendNewInitiativeNotification(
              vi.volunteerProfile.user.email,
              initiative,
            ),
          ),
        ),
      )
      .catch(() => {});
  }
}
