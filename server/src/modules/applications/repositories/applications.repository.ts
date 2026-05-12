import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { Application } from '../entities/application.entity';
import { ApplicationDto } from '../dtos/application.dto';

const APPLICATION_RELATIONS = [
  'initiative',
  'initiative.organization',
  'volunteerProfile',
];

@Injectable()
export class ApplicationsRepository extends BaseRepositoryWrapper<
  Application,
  ApplicationDto
> {
  protected dtoClass = ApplicationDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Application, dataSource.createEntityManager());
  }

  findById(id: string): Promise<ApplicationDto | null> {
    return this.findOneToDto({
      where: { id },
      relations: APPLICATION_RELATIONS,
    });
  }

  findByVolunteerProfile(
    volunteerProfileId: string,
  ): Promise<ApplicationDto[]> {
    return this.findToDto({
      where: { volunteerProfile: { id: volunteerProfileId } },
      relations: APPLICATION_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  findByInitiative(initiativeId: string): Promise<ApplicationDto[]> {
    return this.findToDto({
      where: { initiative: { id: initiativeId } },
      relations: APPLICATION_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }
}
