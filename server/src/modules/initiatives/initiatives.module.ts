import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Initiative } from './entities/initiative.entity';
import { InitiativesRepository } from './repositories/initiatives.repository';
import { InitiativesService } from './services/initiatives.service';
import { InitiativesController } from './controllers/initiatives.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { VolunteerProfilesModule } from '../volunteer-profiles/volunteer-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Initiative]),
    OrganizationsModule,
    forwardRef(() => VolunteerProfilesModule),
  ],
  providers: [InitiativesService, InitiativesRepository],
  controllers: [InitiativesController],
  exports: [InitiativesService],
})
export class InitiativesModule {}
