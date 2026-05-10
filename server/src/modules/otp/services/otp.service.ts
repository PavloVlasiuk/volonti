import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { MailService } from '../../mail/services/mail.service';
import { UsersService } from '../../users/services/users.service';
import { OtpRepository } from '../repositories/otp.repository';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async generate(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const code = await bcrypt.hash(rawCode, 10);
    const pendingToken = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpRepository.save({ code, pendingToken, expiresAt, user });
    this.mailService.sendOtpCode(user.email, rawCode).catch(() => {});

    return pendingToken;
  }

  async verify(pendingToken: string, code: string): Promise<string> {
    const otp = await this.otpRepository.findByPendingToken(pendingToken);
    if (!otp) throw new NotFoundException('Invalid OTP token');

    if (otp.usedAt) throw new UnauthorizedException('OTP already used');
    if (otp.expiresAt < new Date())
      throw new UnauthorizedException('OTP expired');

    const valid = await bcrypt.compare(code, otp.code);
    if (!valid) throw new UnauthorizedException('Invalid OTP code');

    await this.otpRepository.update(otp.id, { usedAt: new Date() });
    return otp.user.id;
  }
}
