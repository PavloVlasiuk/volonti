import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import * as path from 'path';
import PDFDocument = require('pdfkit');
import { Application } from '../../applications/entities/application.entity';
import { InitiativeStatus } from '../../../common/enums';

const FONT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'assets',
  'fonts',
  'Roboto-Regular.ttf',
);

export interface CertificatePayload {
  buffer: Buffer;
  filename: string;
  volunteerFullName: string;
}

@Injectable()
export class CertificatesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async generateForApplication(
    applicationId: string,
    userId: string,
  ): Promise<CertificatePayload> {
    const application = await this.dataSource
      .getRepository(Application)
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.initiative', 'i')
      .innerJoinAndSelect('i.organization', 'org')
      .innerJoinAndSelect('a.volunteerProfile', 'vp')
      .innerJoinAndSelect('vp.user', 'u')
      .where('a.id = :id', { id: applicationId })
      .getOne();

    if (!application) throw new NotFoundException('Application not found');

    if (application.volunteerProfile.user.id !== userId) {
      throw new ForbiddenException('Not your certificate');
    }
    if (application.participated !== true) {
      throw new ForbiddenException('Participation not confirmed');
    }
    if (application.initiative.status !== InitiativeStatus.COMPLETED) {
      throw new ForbiddenException('Initiative is not completed');
    }

    const volunteerFullName = `${application.volunteerProfile.firstName} ${application.volunteerProfile.lastName}`;
    const buffer = await renderCertificate({
      certificateId: randomUUID(),
      volunteerFullName,
      orgName: application.initiative.organization.name,
      orgEdrpou: application.initiative.organization.edrpou,
      initiativeTitle: application.initiative.title,
      startsAt: application.initiative.startsAt,
      endsAt: application.initiative.endsAt,
      hours: application.hoursLogged ?? 0,
      completedAt: application.initiative.completedAt ?? new Date(),
    });

    return {
      buffer,
      filename: `VolonTi-Сертифікат-${volunteerFullName}.pdf`,
      volunteerFullName,
    };
  }
}

interface RenderInput {
  certificateId: string;
  volunteerFullName: string;
  orgName: string;
  orgEdrpou: string;
  initiativeTitle: string;
  startsAt: Date | null;
  endsAt: Date | null;
  hours: number;
  completedAt: Date;
}

function formatUk(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

function renderCertificate(input: RenderInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 56 });
      doc.registerFont('roboto', FONT_PATH);
      doc.font('roboto');

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(28)
        .text('Сертифікат VolonTi', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .fillColor('#666')
        .text('Підтвердження участі у волонтерській ініціативі', {
          align: 'center',
        });

      doc.moveDown(2);
      doc
        .fontSize(13)
        .fillColor('#000')
        .text('Цим сертифікатом підтверджується, що', { align: 'center' });

      doc.moveDown(0.6);
      doc.fontSize(22).text(input.volunteerFullName, { align: 'center' });

      doc.moveDown(0.6);
      doc
        .fontSize(13)
        .text('взяв(-ла) участь у ініціативі', { align: 'center' });

      doc.moveDown(0.6);
      doc.fontSize(16).text(input.initiativeTitle, { align: 'center' });

      doc.moveDown(0.6);
      doc
        .fontSize(13)
        .text(`організована «${input.orgName}» (ЄДРПОУ ${input.orgEdrpou})`, {
          align: 'center',
        });

      const dateLine =
        input.startsAt || input.endsAt
          ? `Період проведення: ${formatUk(input.startsAt)} — ${formatUk(input.endsAt)}`
          : null;

      doc.moveDown(1.5);
      if (dateLine) doc.fontSize(12).text(dateLine, { align: 'center' });
      doc
        .fontSize(12)
        .text(`Відпрацьовано годин: ${input.hours.toFixed(1)}`, {
          align: 'center',
        });
      doc
        .fontSize(12)
        .text(`Завершено: ${formatUk(input.completedAt)}`, { align: 'center' });

      doc.moveDown(3);
      doc
        .fontSize(11)
        .fillColor('#666')
        .text('_____________________________________', { align: 'center' });
      doc.fontSize(10).text('Підпис представника організації', {
        align: 'center',
      });

      doc.moveDown(2);
      doc
        .fontSize(9)
        .fillColor('#999')
        .text(`Ідентифікатор сертифіката: ${input.certificateId}`, {
          align: 'center',
        });

      doc.end();
    } catch (e) {
      reject(e as Error);
    }
  });
}
