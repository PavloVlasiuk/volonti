import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsService } from './services/reviews.service';
import { ReviewsController } from './controllers/reviews.controller';
import { InitiativesModule } from '../initiatives/initiatives.module';
import { VolunteerProfilesModule } from '../volunteer-profiles/volunteer-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => InitiativesModule),
    VolunteerProfilesModule,
  ],
  providers: [ReviewsService, ReviewsRepository],
  controllers: [ReviewsController],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
