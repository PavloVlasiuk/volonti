import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { FormatType, InitiativeType } from '../../../common/enums';

export class FeedQueryDto {
  @IsUUID()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEnum(FormatType)
  @IsOptional()
  format?: FormatType;

  @IsEnum(InitiativeType)
  @IsOptional()
  type?: InitiativeType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}
