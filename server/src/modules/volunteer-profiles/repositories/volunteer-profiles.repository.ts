import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { VolunteerProfile } from '../entities/volunteer-profile.entity';
import { VolunteerProfileDto } from '../dtos/volunteer-profile.dto';

@Injectable()
export class VolunteerProfilesRepository extends BaseRepositoryWrapper<
  VolunteerProfile,
  VolunteerProfileDto
> {
  protected dtoClass = VolunteerProfileDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(VolunteerProfile, dataSource.createEntityManager());
  }

  async findByUserIdWithInterests(
    userId: string,
  ): Promise<VolunteerProfileDto | null> {
    return this.findOneToDto({
      where: { user: { id: userId } },
      relations: ['user', 'interests', 'interests.category'],
    });
  }

  async findRawById(id: string): Promise<VolunteerProfile | null> {
    return this.findOne({ where: { id }, relations: ['user'] });
  }
}
