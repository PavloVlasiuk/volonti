import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RolesAuth } from '../../../common/decorators/roles-auth.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserRole } from '../../../common/enums';
import { CertificatesService } from '../services/certificates.service';

@Controller('applications')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get(':id/certificate.pdf')
  @RolesAuth(UserRole.VOLUNTEER)
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } =
      await this.certificatesService.generateForApplication(id, userId);

    const encoded = encodeURIComponent(filename);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="VolonTi-Certificate.pdf"; filename*=UTF-8''${encoded}`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }
}
