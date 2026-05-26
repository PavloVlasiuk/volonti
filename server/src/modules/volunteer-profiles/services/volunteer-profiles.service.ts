import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { VolunteerProfilesRepository } from '../repositories/volunteer-profiles.repository';
import { VolunteerProfileDto } from '../dtos/volunteer-profile.dto';
import { UpdateVolunteerProfileDto } from '../dtos/update-volunteer-profile.dto';
import {
  AchievementsDto,
  AchievementBadge,
  CompletedAchievementDto,
} from '../dtos/achievements.dto';
import { VolunteerProfile } from '../entities/volunteer-profile.entity';
import { VolunteerInterest } from '../entities/volunteer-interest.entity';

@Injectable()
export class VolunteerProfilesService {
  constructor(
    private readonly profilesRepository: VolunteerProfilesRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findByUserId(userId: string): Promise<VolunteerProfileDto | null> {
    return this.profilesRepository.findByUserIdWithInterests(userId);
  }

  findRawById(id: string): Promise<VolunteerProfile | null> {
    return this.profilesRepository.findRawById(id);
  }

  async findByUserIdOrThrow(
    userId: string,
  ): Promise<VolunteerProfileDto | null> {
    const profile =
      await this.profilesRepository.findByUserIdWithInterests(userId);
    if (!profile) throw new NotFoundException('Volunteer profile not found');
    return profile;
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
          await manager.save(
            VolunteerInterest,
            categoryIds.map((categoryId) => ({
              volunteerProfileId: profile.id,
              categoryId: categoryId,
            })),
          );
        }
      }
    });

    return this.profilesRepository.findByUserIdWithInterests(userId);
  }

  async getAchievements(userId: string): Promise<AchievementsDto> {
    const rows = await this.dataSource.query<
      {
        application_id: string;
        initiative_id: string;
        initiative_title: string;
        organization_id: string;
        organization_name: string;
        hours: string | number | null;
        completed_at: Date;
      }[]
    >(
      `SELECT a.id              AS application_id,
              i.id              AS initiative_id,
              i.title           AS initiative_title,
              o.id              AS organization_id,
              o.name            AS organization_name,
              a.hours_logged    AS hours,
              a.completed_at    AS completed_at
         FROM applications a
         JOIN volunteer_profiles vp ON vp.id = a.volunteer_profile_id
         JOIN initiatives i         ON i.id  = a.initiative_id
         JOIN organizations o       ON o.id  = i.organization_id
        WHERE vp.user_id = $1
          AND a.participated = true
        ORDER BY a.completed_at DESC NULLS LAST`,
      [userId],
    );

    const completed: CompletedAchievementDto[] = rows.map((r) => ({
      applicationId: r.application_id,
      initiativeId: r.initiative_id,
      initiativeTitle: r.initiative_title,
      organizationId: r.organization_id,
      organizationName: r.organization_name,
      hours: Number(r.hours ?? 0),
      completedAt: r.completed_at,
    }));

    const totalHours = completed.reduce((sum, c) => sum + c.hours, 0);
    const badges: AchievementBadge[] = ([10, 50, 100] as const)
      .filter((t) => totalHours >= t)
      .map((t) => `${t}h` as AchievementBadge);

    return new AchievementsDto({
      totalHours,
      completedCount: completed.length,
      badges,
      completed,
    });
  }
}
