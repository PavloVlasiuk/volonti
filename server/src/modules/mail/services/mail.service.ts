import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { ApplicationStatus, OrgStatus } from '../../../common/enums';
import { EnvironmentVariables } from '../../../env.variables';

const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Очікує розгляду',
  [ApplicationStatus.ACCEPTED]: 'Прийнято',
  [ApplicationStatus.REJECTED]: 'Відхилено',
};

const ORG_STATUS_LABEL: Record<OrgStatus, string> = {
  [OrgStatus.PENDING]: 'Очікує верифікації',
  [OrgStatus.VERIFIED]: 'Верифіковано',
  [OrgStatus.REJECTED]: 'Відхилено',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  private getFrontendUrl(): string {
    return this.configService.get('FRONTEND_URL', { infer: true }) ?? '';
  }

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
    const applicationsUrl = `${this.getFrontendUrl()}/applications`;
    return this.sendMail({
      to,
      subject: 'Статус вашої заявки змінено',
      template: 'application-status',
      context: {
        volunteerName,
        initiativeTitle,
        status,
        statusLabel: APPLICATION_STATUS_LABEL[status] ?? status,
        applicationsUrl,
      },
    });
  }

  sendNewInitiativeNotification(
    to: string,
    initiative: {
      id: string;
      title: string;
      city?: string | null;
      format: string;
    },
  ): Promise<void> {
    console.log(
      'Sending new initiative email to',
      to,
      'about initiative',
      initiative,
    );
    const initiativeUrl = `${this.getFrontendUrl()}/initiatives/${initiative.id}`;
    const feedUrl = `${this.getFrontendUrl()}/feed`;
    return this.sendMail({
      to,
      subject: `Нова ініціатива: ${initiative.title}`,
      template: 'new-initiative',
      context: { initiative, initiativeUrl, feedUrl },
    });
  }

  sendNewApplicationArrived(
    to: string,
    volunteerName: string,
    initiativeTitle: string,
    initiativeId: string,
    contacts: {
      email: string;
      phone: string | null;
      telegram: string | null;
      messenger: string | null;
    },
  ): Promise<void> {
    const applicationsUrl = `${this.getFrontendUrl()}/initiatives/${initiativeId}/applications`;
    return this.sendMail({
      to,
      subject: `Нова заявка на ініціативу "${initiativeTitle}"`,
      template: 'new-application',
      context: {
        volunteerName,
        initiativeTitle,
        applicationsUrl,
        contacts,
      },
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
      context: {
        orgName,
        status,
        statusLabel: ORG_STATUS_LABEL[status] ?? status,
        reason,
      },
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
