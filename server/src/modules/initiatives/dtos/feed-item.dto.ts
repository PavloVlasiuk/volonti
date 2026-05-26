import { Initiative } from '../entities/initiative.entity';
import { InitiativeDto } from './initiative.dto';

type EnrichedInitiative = Initiative & {
  acceptedCount?: number;
  organizationAvgRating?: number | null;
  organizationReviewCount?: number;
};

export class FeedItemDto extends InitiativeDto {
  matchScore: number;
  reasons: string[];

  constructor(
    entity: EnrichedInitiative,
    matchScore: number,
    reasons: string[],
  ) {
    super(entity);
    this.matchScore = matchScore;
    this.reasons = reasons;
  }
}
