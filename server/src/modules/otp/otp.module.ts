import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { OtpRepository } from './repositories/otp.repository';
import { OtpService } from './services/otp.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([OtpCode]), UsersModule],
  providers: [OtpRepository, OtpService],
  exports: [OtpService],
})
export class OtpModule {}
