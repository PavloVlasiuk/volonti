import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { ApplicationStatus, OrgStatus } from '../../../common/enums';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: ISendMailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail(options);
    } catch (error) {
      this.logger.error(
        `Failed to send email (template: ${options.template ?? 'n/a'}): ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  sendApplicationStatusChanged(
    to: string,
    volunteerName: string,
    initiativeTitle: string,
    status: ApplicationStatus,
  ): Promise<void> {
    return this.sendMail({
      to,
      subject: 'Статус вашої заявки змінено',
      template: 'application-status',
      context: { volunteerName, initiativeTitle, status },
    });
  }

  sendNewInitiativeNotification(
    to: string,
    initiative: { title: string; city?: string | null; format: string },
  ): Promise<void> {
    return this.sendMail({
      to,
      subject: `Нова ініціатива: ${initiative.title}`,
      template: 'new-initiative',
      context: { initiative },
    });
  }

  sendNewApplicationArrived(
    to: string,
    volunteerName: string,
    initiativeTitle: string,
  ): Promise<void> {
    return this.sendMail({
      to,
      subject: `Нова заявка на ініціативу "${initiativeTitle}"`,
      template: 'new-application',
      context: { volunteerName, initiativeTitle },
    });
  }

  sendVerificationResult(
    to: string,
    orgName: string,
    status: OrgStatus,
    reason?: string,
  ): Promise<void> {
    return this.sendMail({
      to,
      subject:
        status === OrgStatus.VERIFIED
          ? 'Вашу організацію верифіковано'
          : 'Результат верифікації організації',
      template: 'verification-result',
      context: { orgName, status, reason },
    });
  }

  sendOtpCode(to: string, code: string): Promise<void> {
    return this.sendMail({
      to,
      subject: 'Ваш код підтвердження',
      template: 'otp-code',
      context: { code },
    });
  }

  sendReviewRequest(
    to: string,
    name: string,
    initiativeTitle: string,
    reviewUrl: string,
  ): Promise<void> {
    return this.sendMail({
      to,
      subject: `Залиште відгук про "${initiativeTitle}"`,
      template: 'review-request',
      context: { name, initiativeTitle, reviewUrl },
    });
  }
}
