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
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserRole } from '../../../common/enums';
import { AuthService } from '../services/auth.service';
import { UploadService } from '../../upload/services/upload.service';
import { RegisterVolunteerDto } from '../dtos/register-volunteer.dto';
import { RegisterOrganizationDto } from '../dtos/register-organization.dto';
import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('register/volunteer')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  registerVolunteer(@Body() dto: RegisterVolunteerDto): Promise<void> {
    return this.authService.registerVolunteer(dto);
  }

  @Post('register/organization')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('document'))
  async registerOrganization(
    @Body() dto: RegisterOrganizationDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<void> {
    return this.authService.registerOrganization(dto, file);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): void {
    // Tokens are stateless — client discards them locally; no server-side action needed
  }

  @Post('refresh')
  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  refresh(
    @Request() req: { user: { sub: string; email: string; role: string } },
  ) {
    return this.authService.refresh(req.user);
  }

  @Post('2fa/enable')
  @Roles(UserRole.VOLUNTEER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  enableTwoFa(@GetUser('id') userId: string): Promise<void> {
    return this.authService.enableTwoFa(userId);
  }

  @Post('2fa/disable')
  @Roles(UserRole.VOLUNTEER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  disableTwoFa(@GetUser('id') userId: string): Promise<void> {
    return this.authService.disableTwoFa(userId);
  }
}
