import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerProfile } from './entities/volunteer-profile.entity';
import { VolunteerInterest } from './entities/volunteer-interest.entity';
import { VolunteerProfilesRepository } from './repositories/volunteer-profiles.repository';
import { VolunteerProfilesService } from './services/volunteer-profiles.service';
import { VolunteerProfilesController } from './controllers/volunteer-profiles.controller';
import { InitiativesModule } from '../initiatives/initiatives.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VolunteerProfile, VolunteerInterest]),
    forwardRef(() => InitiativesModule),
  ],
  providers: [VolunteerProfilesRepository, VolunteerProfilesService],
  controllers: [VolunteerProfilesController],
  exports: [VolunteerProfilesService],
})
export class VolunteerProfilesModule {}
