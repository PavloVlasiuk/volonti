import { IsEmail, IsString } from 'class-validator';

export class LoginOrganizationDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
