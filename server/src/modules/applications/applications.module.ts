import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsRepository } from './repositories/applications.repository';
import { ApplicationsService } from './services/applications.service';
import { ApplicationsController } from './controllers/applications.controller';
import { VolunteerProfilesModule } from '../volunteer-profiles/volunteer-profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application]), VolunteerProfilesModule],
  providers: [ApplicationsService, ApplicationsRepository],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
