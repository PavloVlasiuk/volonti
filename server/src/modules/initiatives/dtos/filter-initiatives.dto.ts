import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FormatType, InitiativeType } from '../../../common/enums';

export class FilterInitiativesDto {
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

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}
