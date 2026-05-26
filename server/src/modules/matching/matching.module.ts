import { Module } from '@nestjs/common';
import { MatchingService } from './services/matching.service';

@Module({
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
