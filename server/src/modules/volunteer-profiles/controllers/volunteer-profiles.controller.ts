import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Put,
  Query,
} from '@nestjs/common';
import { RolesAuth } from '../../../common/decorators/roles-auth.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserRole } from '../../../common/enums';
import { VolunteerProfilesService } from '../services/volunteer-profiles.service';
import { UpdateVolunteerProfileDto } from '../dtos/update-volunteer-profile.dto';
import { VolunteerProfileDto } from '../dtos/volunteer-profile.dto';
import { AchievementsDto } from '../dtos/achievements.dto';
import { InitiativesService } from '../../initiatives/services/initiatives.service';
import { FeedQueryDto } from '../../initiatives/dtos/feed-query.dto';
import { FeedItemDto } from '../../initiatives/dtos/feed-item.dto';
import { PaginatedDto } from '../../../common/dtos/paginated.dto';

@Controller('volunteer')
@RolesAuth(UserRole.VOLUNTEER)
export class VolunteerProfilesController {
  constructor(
    private readonly profilesService: VolunteerProfilesService,
    @Inject(forwardRef(() => InitiativesService))
    private readonly initiativesService: InitiativesService,
  ) {}

  @Get('profile')
  getProfile(@GetUser('id') userId: string): Promise<VolunteerProfileDto> {
    return this.profilesService.findByUserIdOrThrow(userId);
  }

  @Put('profile')
  updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateVolunteerProfileDto,
  ): Promise<VolunteerProfileDto> {
    return this.profilesService.update(userId, dto);
  }

  @Get('feed')
  getFeed(
    @GetUser('id') userId: string,
    @Query() query: FeedQueryDto,
  ): Promise<PaginatedDto<FeedItemDto>> {
    return this.initiativesService.getFeed(userId, query);
  }

  @Get('achievements')
  getAchievements(@GetUser('id') userId: string): Promise<AchievementsDto> {
    return this.profilesService.getAchievements(userId);
  }
}
