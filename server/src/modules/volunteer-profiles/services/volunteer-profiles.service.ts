import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { VolunteerProfilesRepository } from '../repositories/volunteer-profiles.repository';
import { VolunteerProfileDto } from '../dtos/volunteer-profile.dto';
import { UpdateVolunteerProfileDto } from '../dtos/update-volunteer-profile.dto';
import { VolunteerProfile } from '../entities/volunteer-profile.entity';
import { VolunteerInterest } from '../entities/volunteer-interest.entity';
import { Category } from '../../categories/entities/category.entity';

@Injectable()
export class VolunteerProfilesService {
  constructor(
    private readonly profilesRepository: VolunteerProfilesRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findByUserId(userId: string): Promise<VolunteerProfileDto> {
    const profile =
      await this.profilesRepository.findByUserIdWithInterests(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');
    return new VolunteerProfileDto(profile);
  }

  async findRawByUserId(userId: string): Promise<VolunteerProfile | null> {
    return this.profilesRepository.findByUserIdWithInterests(userId);
  }

  async update(
    userId: string,
    dto: UpdateVolunteerProfileDto,
  ): Promise<VolunteerProfileDto> {
    const profile =
      await this.profilesRepository.findByUserIdWithInterests(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');

    await this.dataSource.transaction(async (manager) => {
      const { categoryIds, ...profileFields } = dto;

      if (Object.keys(profileFields).length > 0) {
        await manager.update(VolunteerProfile, profile.id, profileFields);
      }

      if (categoryIds !== undefined) {
        await manager.delete(VolunteerInterest, {
          volunteerProfile: { id: profile.id },
        });

        if (categoryIds.length > 0) {
          const interests = categoryIds.map((catId) => {
            const interest = new VolunteerInterest();
            interest.volunteerProfile = profile;
            interest.category = { id: catId } as Category;
            return interest;
          });
          await manager.save(VolunteerInterest, interests);
        }
      }
    });

    const updated =
      await this.profilesRepository.findByUserIdWithInterests(userId);
    return new VolunteerProfileDto(updated);
  }
}
