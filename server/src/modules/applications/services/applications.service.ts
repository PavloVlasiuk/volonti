import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InitiativeStatus } from '../../../common/enums';
import { Initiative } from '../../initiatives/entities/initiative.entity';
import { VolunteerProfile } from '../../volunteer-profiles/entities/volunteer-profile.entity';
import { InitiativesService } from '../../initiatives/services/initiatives.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { VolunteerProfilesService } from '../../volunteer-profiles/services/volunteer-profiles.service';
import { MailService } from '../../mail/services/mail.service';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { ApplicationDto } from '../dtos/application.dto';
import { UpdateApplicationStatusDto } from '../dtos/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly volunteerProfilesService: VolunteerProfilesService,
    private readonly initiativesService: InitiativesService,
    private readonly organizationsService: OrganizationsService,
    private readonly mailService: MailService,
  ) {}

  async submit(initiativeId: string, userId: string): Promise<ApplicationDto> {
    const profile = await this.volunteerProfilesService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');

    const initiative = await this.initiativesService.findById(initiativeId);
    if (!initiative) throw new NotFoundException('Initiative not found');
    if (initiative.status !== InitiativeStatus.ACTIVE) {
      throw new BadRequestException('Initiative is not active');
    }

    let savedId: string;
    try {
      const saved = await this.applicationsRepository.save({
        initiative: { id: initiativeId } as Initiative,
        volunteerProfile: { id: profile.id } as VolunteerProfile,
      });
      savedId = saved.id;
    } catch (e: any) {
      if (e?.code === '23505')
        throw new ConflictException('Already applied to this initiative');
      throw e;
    }

    void this.mailService.sendNewApplicationArrived(
      initiative.organization.email,
      `${profile.firstName} ${profile.lastName}`,
      initiative.title,
    );

    return this.applicationsRepository.findById(savedId);
  }

  async updateStatus(
    applicationId: string,
    userId: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationDto> {
    const app = await this.applicationsRepository.findById(applicationId);
    if (!app) throw new NotFoundException('Application not found');

    const org = await this.organizationsService
      .findById(userId)
      .catch(() => null);
    if (!org || app.initiative.organization.id !== org.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.applicationsRepository.update(applicationId, {
      status: dto.status,
    });

    const volunteerRaw = await this.volunteerProfilesService.findRawById(
      app.volunteer.id,
    );
    if (volunteerRaw?.user?.email) {
      void this.mailService.sendApplicationStatusChanged(
        volunteerRaw.user.email,
        `${volunteerRaw.firstName} ${volunteerRaw.lastName}`,
        app.initiative.title,
        dto.status,
      );
    }

    return this.applicationsRepository.findById(applicationId);
  }

  async findByVolunteer(userId: string): Promise<ApplicationDto[]> {
    const profile = await this.volunteerProfilesService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');
    return this.applicationsRepository.findByVolunteerProfile(profile.id);
  }
}
