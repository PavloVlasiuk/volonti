import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Initiative } from './entities/initiative.entity';
import { InitiativeDismissal } from './entities/initiative-dismissal.entity';
import { InitiativesRepository } from './repositories/initiatives.repository';
import { InitiativeDismissalsRepository } from './repositories/initiative-dismissals.repository';
import { InitiativesService } from './services/initiatives.service';
import { InitiativesController } from './controllers/initiatives.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { VolunteerProfilesModule } from '../volunteer-profiles/volunteer-profiles.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Initiative, InitiativeDismissal]),
    forwardRef(() => OrganizationsModule),
    forwardRef(() => VolunteerProfilesModule),
    forwardRef(() => ReviewsModule),
    MatchingModule,
  ],
  providers: [
    InitiativesService,
    InitiativesRepository,
    InitiativeDismissalsRepository,
  ],
  controllers: [InitiativesController],
  exports: [InitiativesService, InitiativesRepository],
})
export class InitiativesModule {}
