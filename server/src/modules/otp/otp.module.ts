import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { OtpRepository } from './repositories/otp.repository';
import { OtpService } from './services/otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpCode])],
  providers: [OtpRepository, OtpService],
  exports: [OtpService],
})
export class OtpModule {}
