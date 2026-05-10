import { Equals, IsEnum } from 'class-validator';
import { InitiativeStatus } from '../../../common/enums';

export class UpdateInitiativeStatusDto {
  @IsEnum(InitiativeStatus)
  @Equals(InitiativeStatus.CLOSED)
  status: InitiativeStatus;
}
