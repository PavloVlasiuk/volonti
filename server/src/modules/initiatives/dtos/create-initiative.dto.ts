import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { FormatType, InitiativeType } from '../../../common/enums';

export class CreateInitiativeDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsUUID()
  categoryId: string;

  @IsEnum(InitiativeType)
  type: InitiativeType;

  @IsEnum(FormatType)
  format: FormatType;

  @IsString()
  @IsOptional()
  city?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  minAge?: number;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  slotsNeeded?: number;
}
