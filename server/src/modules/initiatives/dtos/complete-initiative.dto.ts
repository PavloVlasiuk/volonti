import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ParticipationEntryDto {
  @IsUUID()
  applicationId: string;

  @IsBoolean()
  participated: boolean;

  @IsNumber()
  @Min(0)
  @Max(999.9)
  hours: number;
}

export class CompleteInitiativeDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ParticipationEntryDto)
  participations: ParticipationEntryDto[];
}
