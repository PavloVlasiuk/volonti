import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ApplicationStatus, OrgStatus } from '../../../common/enums';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendApplicationStatusChanged(
    to: string,
    volunteerName: string,
    initiativeTitle: string,
    status: ApplicationStatus,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: `Статус вашої заявки змінено`,
      template: 'application-status',
      context: { volunteerName, initiativeTitle, status },
    });
  }

  async sendNewInitiativeNotification(
    to: string,
    initiative: { title: string; city?: string | null; format: string },
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: `Нова ініціатива: ${initiative.title}`,
      template: 'new-initiative',
      context: { initiative },
    });
  }

  async sendNewApplicationArrived(
    to: string,
    volunteerName: string,
    initiativeTitle: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: `Нова заявка на ініціативу "${initiativeTitle}"`,
      template: 'new-application',
      context: { volunteerName, initiativeTitle },
    });
  }

  async sendVerificationResult(
    to: string,
    orgName: string,
    status: OrgStatus,
    reason?: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject:
        status === OrgStatus.VERIFIED
          ? 'Вашу організацію верифіковано'
          : 'Результат верифікації організації',
      template: 'verification-result',
      context: { orgName, status, reason },
    });
  }

  async sendOtpCode(to: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Ваш код підтвердження',
      template: 'otp-code',
      context: { code },
    });
  }
}
