import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsRepository } from './repositories/applications.repository';
import { ApplicationsService } from './services/applications.service';
import { ApplicationsController } from './controllers/applications.controller';
import { VolunteerProfilesModule } from '../volunteer-profiles/volunteer-profiles.module';
import { InitiativesModule } from '../initiatives/initiatives.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application]),
    VolunteerProfilesModule,
    InitiativesModule,
    OrganizationsModule,
    forwardRef(() => ReviewsModule),
  ],
  providers: [ApplicationsService, ApplicationsRepository],
  controllers: [ApplicationsController],
  exports: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule {}
