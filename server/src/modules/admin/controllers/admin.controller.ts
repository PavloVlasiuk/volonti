import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RolesAuth } from '../../../common/decorators/roles-auth.decorator';
import { OrgStatus, UserRole } from '../../../common/enums';
import { OrganizationDto } from '../../organizations/dtos/organization.dto';
import { AdminService } from '../services/admin.service';
import { RejectOrganizationDto } from '../dtos/reject-organization.dto';

@Controller('admin')
@RolesAuth(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('organizations')
  listOrganizations(
    @Query('status') status?: OrgStatus,
  ): Promise<OrganizationDto[]> {
    return this.adminService.listOrganizations(status ?? OrgStatus.PENDING);
  }

  @Get('organizations/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrganizationDto> {
    return this.adminService.findOne(id);
  }

  @Post('organizations/:id/verify')
  @HttpCode(200)
  verify(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.verify(id);
  }

  @Post('organizations/:id/reject')
  @HttpCode(200)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectOrganizationDto,
  ): Promise<void> {
    return this.adminService.reject(id, dto);
  }
}
