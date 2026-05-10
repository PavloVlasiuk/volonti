import { OtpCode } from '../entities/otp-code.entity';

export class OtpCodeDto {
  id: string;
  pendingToken: string;
  expiresAt: Date;
  usedAt: Date | null;

  constructor(entity: OtpCode) {
    this.id = entity.id;
    this.pendingToken = entity.pendingToken;
    this.expiresAt = entity.expiresAt;
    this.usedAt = entity.usedAt;
  }
}
