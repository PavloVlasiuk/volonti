import {
  IsEmail,
  IsEnum,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { OrgType } from '../../../common/enums';

export class RegisterOrganizationDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsEnum(OrgType)
  type: OrgType;

  @IsString()
  @Matches(/^\d{8}$/)
  edrpou: string;

  @IsString()
  @Length(1, 200)
  contactPerson: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
