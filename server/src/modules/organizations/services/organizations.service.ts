import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { InitiativeStatus, OrgStatus, ReviewParty } from '../../../common/enums';
import { Organization } from '../entities/organization.entity';
import { OrganizationDto } from '../dtos/organization.dto';
import { OrganizationPublicDto } from '../dtos/organization-public.dto';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { ReviewsRepository } from '../../reviews/repositories/reviews.repository';
import { InitiativesRepository } from '../../initiatives/repositories/initiatives.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    @Inject(forwardRef(() => ReviewsRepository))
    private readonly reviewsRepository: ReviewsRepository,
    @Inject(forwardRef(() => InitiativesRepository))
    private readonly initiativesRepository: InitiativesRepository,
  ) {}

  async findById(id: string): Promise<OrganizationDto> {
    const org = await this.organizationsRepository.findOneToDto({
      where: { id },
    });
    if (!org) throw new NotFoundException('Organization not found');
    const aggregate = await this.reviewsRepository.aggregateFor(
      ReviewParty.ORGANIZATION,
      org.id,
    );
    org.avgRating = aggregate.avg;
    org.reviewCount = aggregate.count;
    return org;
  }

  async findByStatus(status: OrgStatus): Promise<OrganizationDto[]> {
    return this.organizationsRepository.findByStatus(status);
  }

  async findByEmail(email: string): Promise<OrganizationDto | null> {
    return this.organizationsRepository.findByEmail(email);
  }

  findRawByEmail(email: string): Promise<Organization | null> {
    return this.organizationsRepository.findRawByEmail(email);
  }

  async create(data: DeepPartial<Organization>): Promise<OrganizationDto> {
    return this.organizationsRepository.saveToDto(data);
  }

  async getPublic(id: string): Promise<OrganizationPublicDto> {
    const org = await this.findById(id);
    const initiatives = await this.initiativesRepository.findByOrganization(id);
    const activeInitiatives = initiatives.filter(
      (i) => i.status === InitiativeStatus.ACTIVE,
    );
    const completedInitiatives = initiatives.filter(
      (i) => i.status === InitiativeStatus.COMPLETED,
    );
    const recentReviews = await this.reviewsRepository.findFor(
      ReviewParty.ORGANIZATION,
      id,
      5,
    );
    return new OrganizationPublicDto(
      org,
      activeInitiatives,
      completedInitiatives,
      recentReviews,
    );
  }

  async updateStatus(
    id: string,
    status: OrgStatus,
    reason?: string,
  ): Promise<void> {
    const update: Partial<Organization> = { status };
    if (status === OrgStatus.VERIFIED) update.verifiedAt = new Date();
    if (status === OrgStatus.REJECTED && reason)
      update.rejectionReason = reason;
    await this.organizationsRepository.update(id, update);
  }
}
