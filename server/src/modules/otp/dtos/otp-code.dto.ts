import { ActorType } from '../../../common/enums';
import { OtpCode } from '../entities/otp-code.entity';

export class OtpCodeDto {
  id: string;
  code: string;
  pendingToken: string;
  expiresAt: Date;
  usedAt: Date | null;
  actorId: string;
  actor: ActorType;
  createdAt: Date;

  constructor(entity: OtpCode) {
    this.id = entity.id;
    this.code = entity.code;
    this.pendingToken = entity.pendingToken;
    this.expiresAt = entity.expiresAt;
    this.usedAt = entity.usedAt;
    this.actorId = entity.actorId;
    this.actor = entity.actor;
    this.createdAt = entity.createdAt;
  }
}
