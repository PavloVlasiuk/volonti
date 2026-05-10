import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { Application } from '../entities/application.entity';
import { ApplicationDto } from '../dtos/application.dto';

@Injectable()
export class ApplicationsRepository extends BaseRepositoryWrapper<
  Application,
  ApplicationDto
> {
  protected dtoClass = ApplicationDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Application, dataSource.createEntityManager());
  }

  async findByIdWithRelations(id: string): Promise<Application | null> {
    return this.findOne({
      where: { id },
      relations: [
        'initiative',
        'initiative.organization',
        'initiative.organization.user',
        'volunteerProfile',
        'volunteerProfile.user',
      ],
    });
  }

  async findByVolunteerProfile(
    volunteerProfileId: string,
  ): Promise<ApplicationDto[]> {
    const entities = await this.find({
      where: { volunteerProfile: { id: volunteerProfileId } },
      relations: ['initiative', 'initiative.organization', 'volunteerProfile'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => new ApplicationDto(e));
  }
}
