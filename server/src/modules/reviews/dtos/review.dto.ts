import { ReviewParty } from '../../../common/enums';

export class ReviewDto {
  id: string;
  initiativeId: string;
  authorType: ReviewParty;
  authorId: string;
  authorName: string;
  targetType: ReviewParty;
  targetId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}
