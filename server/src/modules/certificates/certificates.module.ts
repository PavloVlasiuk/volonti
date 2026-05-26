import { Module } from '@nestjs/common';
import { CertificatesService } from './services/certificates.service';
import { CertificatesController } from './controllers/certificates.controller';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
