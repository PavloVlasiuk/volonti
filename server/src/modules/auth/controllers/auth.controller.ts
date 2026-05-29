import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesAuth } from '../../../common/decorators/roles-auth.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserRole } from '../../../common/enums';
import { AuthService } from '../services/auth.service';
import { RegisterVolunteerDto } from '../dtos/register-volunteer.dto';
import { RegisterOrganizationDto } from '../dtos/register-organization.dto';
import { LoginDto } from '../dtos/login.dto';
import { LoginOrganizationDto } from '../dtos/login-organization.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { RefreshJwtPayload } from '../strategies/jwt-refresh.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/volunteer')
  @HttpCode(HttpStatus.CREATED)
  registerVolunteer(@Body() dto: RegisterVolunteerDto) {
    return this.authService.registerVolunteer(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('register/organization')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('document'))
  registerOrganization(
    @Body() dto: RegisterOrganizationDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<void> {
    return this.authService.registerOrganization(dto, file);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/organization')
  @HttpCode(HttpStatus.OK)
  loginOrganization(@Body() dto: LoginOrganizationDto) {
    return this.authService.loginOrganization(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): void {}

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  refresh(@Request() req: { user: RefreshJwtPayload }) {
    return this.authService.refresh(req.user);
  }

  @Post('2fa/enable')
  @RolesAuth(UserRole.VOLUNTEER)
  @HttpCode(HttpStatus.NO_CONTENT)
  enableTwoFa(@GetUser('id') userId: string): Promise<void> {
    return this.authService.enableTwoFa(userId);
  }

  @Post('2fa/disable')
  @RolesAuth(UserRole.VOLUNTEER)
  @HttpCode(HttpStatus.NO_CONTENT)
  disableTwoFa(@GetUser('id') userId: string): Promise<void> {
    return this.authService.disableTwoFa(userId);
  }
}
