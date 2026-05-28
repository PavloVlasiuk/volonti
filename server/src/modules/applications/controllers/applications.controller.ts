import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RolesAuth } from '../../../common/decorators/roles-auth.decorator';
import { OrgVerifiedAuth } from '../../../common/decorators/organization-auth.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserRole } from '../../../common/enums';
import { ApplicationsService } from '../services/applications.service';
import { ApplicationDto } from '../dtos/application.dto';
import { SubmitApplicationDto } from '../dtos/submit-application.dto';
import { UpdateApplicationStatusDto } from '../dtos/update-application-status.dto';

@Controller('')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('initiatives/:id/applications')
  @RolesAuth(UserRole.VOLUNTEER)
  submit(
    @Param('id', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') userId: string,
    @Body() dto: SubmitApplicationDto,
  ): Promise<ApplicationDto> {
    return this.applicationsService.submit(initiativeId, userId, dto);
  }

  @Patch('applications/:id')
  @OrgVerifiedAuth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') orgId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationDto> {
    return this.applicationsService.updateStatus(id, orgId, dto);
  }

  @Get('volunteer/applications')
  @RolesAuth(UserRole.VOLUNTEER)
  findByVolunteer(@GetUser('id') userId: string): Promise<ApplicationDto[]> {
    return this.applicationsService.findByVolunteer(userId);
  }

  @Get('volunteer/initiatives/:id/application')
  @RolesAuth(UserRole.VOLUNTEER)
  findOwnForInitiative(
    @Param('id', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') userId: string,
  ): Promise<ApplicationDto | null> {
    return this.applicationsService.findOwnForInitiative(initiativeId, userId);
  }
}
