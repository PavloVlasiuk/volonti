import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { RolesAuth } from '../../../common/decorators/roles-auth.decorator';
import { OrganizationAuth } from '../../../common/decorators/organization-auth.decorator';
import { UserRole } from '../../../common/enums';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewDto } from '../dtos/review.dto';

@Controller('')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('initiatives/:initiativeId/reviews')
  @RolesAuth(UserRole.VOLUNTEER)
  createFromVolunteer(
    @Param('initiativeId', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.createFromVolunteer(initiativeId, userId, dto);
  }

  @Post('initiatives/:initiativeId/reviews/from-organization')
  @OrganizationAuth()
  createFromOrganization(
    @Param('initiativeId', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') orgId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.createFromOrganization(initiativeId, orgId, dto);
  }

  @Get('organizations/:id/reviews')
  getOrganizationReviews(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewDto[]> {
    return this.reviewsService.getOrganizationReviews(id);
  }

  @Get('initiatives/:initiativeId/reviews/own')
  @RolesAuth(UserRole.VOLUNTEER)
  getOwnFromVolunteer(
    @Param('initiativeId', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') userId: string,
  ): Promise<ReviewDto | null> {
    return this.reviewsService.getOwnReviewFromVolunteer(initiativeId, userId);
  }

  @Get('initiatives/:initiativeId/reviews/own/from-organization')
  @OrganizationAuth()
  getOwnFromOrganization(
    @Param('initiativeId', ParseUUIDPipe) initiativeId: string,
    @GetUser('id') orgId: string,
    @Query('targetId', ParseUUIDPipe) targetId: string,
  ): Promise<ReviewDto | null> {
    return this.reviewsService.getOwnReviewFromOrganization(
      initiativeId,
      orgId,
      targetId,
    );
  }
}
