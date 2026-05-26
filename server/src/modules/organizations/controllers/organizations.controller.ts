import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { OrganizationsService } from '../services/organizations.service';
import { OrganizationDto } from '../dtos/organization.dto';
import { OrganizationPublicDto } from '../dtos/organization-public.dto';
import { JwtOrgGuard } from '../../../common/guards/jwt-org.guard';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  @UseGuards(JwtOrgGuard)
  getMe(@GetUser('id') orgId: string): Promise<OrganizationDto> {
    return this.organizationsService.findById(orgId);
  }

  @Get(':id')
  getPublic(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationPublicDto> {
    return this.organizationsService.getPublic(id);
  }
}
