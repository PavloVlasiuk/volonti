import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrganizationDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
