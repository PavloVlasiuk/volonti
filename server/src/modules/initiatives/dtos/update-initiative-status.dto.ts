import { IsIn } from 'class-validator';
import { InitiativeStatus } from '../../../common/enums';

export class UpdateInitiativeStatusDto {
  @IsIn([InitiativeStatus.CLOSED, InitiativeStatus.COMPLETED])
  status: InitiativeStatus;
}
