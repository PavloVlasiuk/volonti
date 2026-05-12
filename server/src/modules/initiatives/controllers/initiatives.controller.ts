import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { OrgVerifiedAuth } from '../../../common/decorators/organization-auth.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { InitiativesService } from '../services/initiatives.service';
import { InitiativeDto } from '../dtos/initiative.dto';
import { CreateInitiativeDto } from '../dtos/create-initiative.dto';
import { UpdateInitiativeDto } from '../dtos/update-initiative.dto';
import { UpdateInitiativeStatusDto } from '../dtos/update-initiative-status.dto';
import { FilterInitiativesDto } from '../dtos/filter-initiatives.dto';
import { ApplicationDto } from '../../applications/dtos/application.dto';

@Controller('initiatives')
export class InitiativesController {
  constructor(private readonly initiativesService: InitiativesService) {}

  @Get()
  findAll(@Query() filters: FilterInitiativesDto): Promise<InitiativeDto[]> {
    return this.initiativesService.findAll(filters);
  }

  @Get('mine')
  @OrgVerifiedAuth()
  getMyInitiatives(@GetUser('id') orgId: string): Promise<InitiativeDto[]> {
    return this.initiativesService.getMyInitiatives(orgId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InitiativeDto> {
    return this.initiativesService.findOne(id);
  }

  @Post()
  @OrgVerifiedAuth()
  create(
    @GetUser('id') orgId: string,
    @Body() dto: CreateInitiativeDto,
  ): Promise<InitiativeDto> {
    return this.initiativesService.create(orgId, dto);
  }

  @Put(':id')
  @OrgVerifiedAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') orgId: string,
    @Body() dto: UpdateInitiativeDto,
  ): Promise<InitiativeDto> {
    return this.initiativesService.update(id, orgId, dto);
  }

  @Patch(':id/status')
  @OrgVerifiedAuth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') orgId: string,
    @Body() dto: UpdateInitiativeStatusDto,
  ): Promise<InitiativeDto> {
    return this.initiativesService.updateStatus(id, orgId, dto);
  }

  @Delete(':id')
  @OrgVerifiedAuth()
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') orgId: string,
  ): Promise<void> {
    return this.initiativesService.remove(id, orgId);
  }

  @Get(':id/applications')
  @OrgVerifiedAuth()
  getApplications(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') orgId: string,
  ): Promise<ApplicationDto[]> {
    return this.initiativesService.getApplications(id, orgId);
  }
}
