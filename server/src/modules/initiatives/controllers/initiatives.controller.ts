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
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { OrgVerifiedGuard } from '../../../common/guards/org-verified.guard';
import { UserRole } from '../../../common/enums';
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
  @Public()
  findAll(@Query() filters: FilterInitiativesDto): Promise<InitiativeDto[]> {
    return this.initiativesService.findAll(filters);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InitiativeDto> {
    return this.initiativesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ORGANIZATION)
  @UseGuards(RolesGuard, OrgVerifiedGuard)
  create(
    @GetUser('id') userId: string,
    @Body() dto: CreateInitiativeDto,
  ): Promise<InitiativeDto> {
    return this.initiativesService.create(userId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ORGANIZATION)
  @UseGuards(RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateInitiativeDto,
  ): Promise<InitiativeDto> {
    return this.initiativesService.update(id, userId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ORGANIZATION)
  @UseGuards(RolesGuard)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateInitiativeStatusDto,
  ): Promise<InitiativeDto> {
    return this.initiativesService.updateStatus(id, userId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ORGANIZATION)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return this.initiativesService.remove(id, userId);
  }

  @Get(':id/applications')
  @Roles(UserRole.ORGANIZATION)
  @UseGuards(RolesGuard)
  getApplications(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ): Promise<ApplicationDto[]> {
    return this.initiativesService.getApplications(id, userId);
  }
}
