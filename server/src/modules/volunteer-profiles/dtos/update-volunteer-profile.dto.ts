import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FormatPreference } from '../../../common/enums';

export class UpdateVolunteerProfileDto {
  @IsString()
  @Length(1, 100)
  @IsOptional()
  firstName?: string;

  @IsString()
  @Length(1, 100)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsInt()
  @Min(14)
  @Max(100)
  @IsOptional()
  age?: number;

  @IsEnum(FormatPreference)
  @IsOptional()
  formatPreference?: FormatPreference;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  @Matches(/^\+?[0-9\s\-()]*$/)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  telegram?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  messenger?: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];
}
