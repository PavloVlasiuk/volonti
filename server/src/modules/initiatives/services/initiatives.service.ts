import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  FormatPreference,
  FormatType,
  InitiativeStatus,
} from '../../../common/enums';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { VolunteerProfilesService } from '../../volunteer-profiles/services/volunteer-profiles.service';
import { MailService } from '../../mail/services/mail.service';
import { VolunteerInterest } from '../../volunteer-profiles/entities/volunteer-interest.entity';
import { InitiativesRepository } from '../repositories/initiatives.repository';
import { Initiative } from '../entities/initiative.entity';
import { InitiativeDto } from '../dtos/initiative.dto';
import { CreateInitiativeDto } from '../dtos/create-initiative.dto';
import { UpdateInitiativeDto } from '../dtos/update-initiative.dto';
import { UpdateInitiativeStatusDto } from '../dtos/update-initiative-status.dto';
import { CompleteInitiativeDto } from '../dtos/complete-initiative.dto';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationDto } from '../../applications/dtos/application.dto';
import { FilterInitiativesDto } from '../dtos/filter-initiatives.dto';
import { VolunteerProfileDto } from '../../volunteer-profiles/dtos/volunteer-profile.dto';

function computeMatchScore(
  dto: InitiativeDto,
  profile: VolunteerProfileDto,
): number {
  const categoryIds = profile.interests.map((i) => i.id);
  const criteria = [
    categoryIds.includes(dto.categoryId) ? 2 : 0,
    profile.formatPreference === FormatPreference.ANY ||
    (profile.formatPreference as string) === (dto.format as string)
      ? 1
      : 0,
    dto.format === FormatType.ON_SITE && profile.city
      ? profile.city.toLowerCase() === dto.city?.toLowerCase()
        ? 1
        : 0
      : 1,
    !dto.minAge || (profile.age !== null && profile.age >= dto.minAge) ? 1 : 0,
  ];
  return Math.round((criteria.reduce((a, b) => a + b, 0) / 5) * 100);
}

@Injectable()
export class InitiativesService {
  constructor(
    private readonly initiativesRepository: InitiativesRepository,
    private readonly organizationsService: OrganizationsService,
    @Inject(forwardRef(() => VolunteerProfilesService))
    private readonly volunteerProfilesService: VolunteerProfilesService,
    private readonly mailService: MailService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

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

  async findAll(filters: FilterInitiativesDto): Promise<InitiativeDto[]> {
    return this.initiativesRepository.findAllWithFilters(filters);
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

    return this.initiativesRepository.findByIdWithRelations(id);
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
    return apps.map((a) => new ApplicationDto(a));
  }

  async getFeed(
    userId: string,
  ): Promise<Array<InitiativeDto & { matchScore: number }>> {
    const profile = await this.volunteerProfilesService.findByUserId(userId);
    if (!profile || !profile.interests?.length) {
      const all = await this.initiativesRepository.findAllWithFilters({});
      return all.map((dto) => ({ ...dto, matchScore: 0 }));
    }
    const initiatives =
      await this.initiativesRepository.findMatchingForVolunteer(profile);
    return initiatives
      .map((dto) => ({ ...dto, matchScore: computeMatchScore(dto, profile) }))
      .sort((a, b) => b.matchScore - a.matchScore);
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
