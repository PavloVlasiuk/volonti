import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ActorType } from '../../../common/enums';
import { MailService } from '../../mail/services/mail.service';
import { OtpRepository } from '../repositories/otp.repository';

const RESEND_COOLDOWN_MS = 60 * 1000;

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly mailService: MailService,
  ) {}

  async generate(
    actorId: string,
    email: string,
    actor: ActorType,
  ): Promise<string> {
    // Throttle resends: if a still-valid code was issued within the cooldown
    // window, reuse it instead of sending another email.
    const last = await this.otpRepository.findLatestByActor(actorId);
    if (
      last &&
      !last.usedAt &&
      last.expiresAt > new Date() &&
      Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return last.pendingToken;
    }

    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const code = await bcrypt.hash(rawCode, 10);
    const pendingToken = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpRepository.save({
      code,
      pendingToken,
      expiresAt,
      actorId,
      actor,
    });
    console.log(`***************Generated OTP for ${email}: ${rawCode}`); // For debugging, remove in production
    void this.mailService.sendOtpCode(email, rawCode);

    return pendingToken;
  }

  async verify(
    pendingToken: string,
    code: string,
  ): Promise<{ actorId: string; actor: ActorType }> {
    const otp = await this.otpRepository.findByPendingToken(pendingToken);
    if (!otp) throw new NotFoundException('Invalid OTP token');

    if (otp.usedAt) throw new UnauthorizedException('OTP already used');
    if (otp.expiresAt < new Date())
      throw new UnauthorizedException('OTP expired');

    const valid = await bcrypt.compare(code, otp.code);
    if (!valid) throw new UnauthorizedException('Invalid OTP code');

    await this.otpRepository.update(otp.id, { usedAt: new Date() });
    return { actorId: otp.actorId, actor: otp.actor };
  }
}
