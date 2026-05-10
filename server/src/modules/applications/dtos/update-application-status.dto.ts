import { IsEnum, IsIn } from 'class-validator';
import { ApplicationStatus } from '../../../common/enums';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsIn([ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED])
  status: ApplicationStatus;
}
