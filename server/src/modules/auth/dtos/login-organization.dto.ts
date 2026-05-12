import { IsString, Length, Matches } from 'class-validator';

export class LoginOrganizationDto {
  @IsString()
  @Length(8, 8, { message: 'EDRPOU must be exactly 8 digits' })
  @Matches(/^\d{8}$/, { message: 'EDRPOU must contain only digits' })
  edrpou: string;

  @IsString()
  password: string;
}
