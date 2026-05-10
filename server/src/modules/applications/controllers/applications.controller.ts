import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApplicationsService } from '../services/applications.service';
import { ApplicationDto } from '../dtos/application.dto';
import { UpdateApplicationStatusDto } from '../dtos/update-application-status.dto';

@Controller('')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('initiatives/:id/applications')
  @Roles(UserRole.VOLUNTEER)
  @UseGuards(RolesGuard)
  submit(
    @Param('id', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') userId: string,
  ): Promise<ApplicationDto> {
    return this.applicationsService.submit(initiativeId, userId);
  }

  @Patch('applications/:id')
  @Roles(UserRole.ORGANIZATION)
  @UseGuards(RolesGuard)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationDto> {
    return this.applicationsService.updateStatus(id, userId, dto);
  }

  @Get('volunteer/applications')
  @Roles(UserRole.VOLUNTEER)
  @UseGuards(RolesGuard)
  findByVolunteer(@GetUser('id') userId: string): Promise<ApplicationDto[]> {
    return this.applicationsService.findByVolunteer(userId);
  }
}
