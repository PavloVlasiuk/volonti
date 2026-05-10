import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InitiativeStatus } from '../../../common/enums';
import { VolunteerProfilesService } from '../../volunteer-profiles/services/volunteer-profiles.service';
import { MailService } from '../../mail/services/mail.service';
import { Initiative } from '../../initiatives/entities/initiative.entity';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { ApplicationDto } from '../dtos/application.dto';
import { UpdateApplicationStatusDto } from '../dtos/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly volunteerProfilesService: VolunteerProfilesService,
    private readonly mailService: MailService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async submit(initiativeId: string, userId: string): Promise<ApplicationDto> {
    const profile = await this.volunteerProfilesService.findRawByUserId(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');

    const initiative = await this.dataSource.getRepository(Initiative).findOne({
      where: { id: initiativeId },
      relations: ['organization', 'organization.user'],
    });
    if (!initiative) throw new NotFoundException('Initiative not found');
    if (initiative.status !== InitiativeStatus.ACTIVE) {
      throw new BadRequestException('Initiative is not active');
    }

    let savedId: string;
    try {
      const saved = await this.applicationsRepository.save({
        initiative: { id: initiativeId } as any,
        volunteerProfile: { id: profile.id } as any,
      });
      savedId = saved.id;
    } catch (e: any) {
      if (e?.code === '23505')
        throw new ConflictException('Already applied to this initiative');
      throw e;
    }

    this.mailService
      .sendNewApplicationArrived(
        initiative.organization.user.email,
        `${profile.firstName} ${profile.lastName}`,
        initiative.title,
      )
      .catch(() => {});

    const full =
      await this.applicationsRepository.findByIdWithRelations(savedId);
    return new ApplicationDto(full);
  }

  async updateStatus(
    applicationId: string,
    userId: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationDto> {
    const app =
      await this.applicationsRepository.findByIdWithRelations(applicationId);
    if (!app) throw new NotFoundException('Application not found');

    if (app.initiative.organization.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.applicationsRepository.update(applicationId, {
      status: dto.status,
    });

    this.mailService
      .sendApplicationStatusChanged(
        app.volunteerProfile.user.email,
        `${app.volunteerProfile.firstName} ${app.volunteerProfile.lastName}`,
        app.initiative.title,
        dto.status,
      )
      .catch(() => {});

    const updated =
      await this.applicationsRepository.findByIdWithRelations(applicationId);
    return new ApplicationDto(updated);
  }

  async findByVolunteer(userId: string): Promise<ApplicationDto[]> {
    const profile = await this.volunteerProfilesService.findRawByUserId(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');
    return this.applicationsRepository.findByVolunteerProfile(profile.id);
  }
}
