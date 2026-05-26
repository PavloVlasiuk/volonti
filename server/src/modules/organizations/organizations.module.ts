import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { OrganizationsService } from './services/organizations.service';
import { OrganizationsController } from './controllers/organizations.controller';
import { ReviewsModule } from '../reviews/reviews.module';
import { InitiativesModule } from '../initiatives/initiatives.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    forwardRef(() => ReviewsModule),
    forwardRef(() => InitiativesModule),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsRepository, OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
