import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { OtpModule } from '../otp/otp.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UploadModule } from '../upload/upload.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { JwtOrgStrategy } from './strategies/jwt-org.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    OtpModule,
    OrganizationsModule,
    UploadModule,
  ],
  providers: [AuthService, JwtUserStrategy, JwtOrgStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
