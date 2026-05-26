import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { AvailabilitySlot } from '../../../common/enums';

export class SubmitApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivation: string;

  @IsArray()
  @ArrayMaxSize(4)
  @IsEnum(AvailabilitySlot, { each: true })
  availability: AvailabilitySlot[];

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^\+?[0-9\s\-()]+$/)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  experience?: string;

  @IsBoolean()
  hasTransport: boolean;

  @IsBoolean()
  canStartImmediately: boolean;
}
