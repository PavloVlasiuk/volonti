import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { VolunteerProfilesService } from '../services/volunteer-profiles.service';
import { UpdateVolunteerProfileDto } from '../dtos/update-volunteer-profile.dto';
import { VolunteerProfileDto } from '../dtos/volunteer-profile.dto';
import { InitiativesService } from '../../initiatives/services/initiatives.service';

@Controller('volunteer')
@Roles(UserRole.VOLUNTEER)
@UseGuards(RolesGuard)
export class VolunteerProfilesController {
  constructor(
    private readonly profilesService: VolunteerProfilesService,
    @Inject(forwardRef(() => InitiativesService))
    private readonly initiativesService: InitiativesService,
  ) {}

  @Get('profile')
  getProfile(@GetUser('id') userId: string): Promise<VolunteerProfileDto> {
    return this.profilesService.findByUserId(userId);
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
  ): Promise<Array<{ matchScore: number } & Record<string, any>>> {
    return this.initiativesService.getFeed(userId);
  }
}
