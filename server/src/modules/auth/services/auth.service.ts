import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectDataSource } from '@nestjs/typeorm';
import { EnvironmentVariables } from '../../../env.variables';
import { OrgStatus, UserRole } from '../../../common/enums';
import { UsersService } from '../../users/services/users.service';
import { OtpService } from '../../otp/services/otp.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { UploadService } from '../../upload/services/upload.service';
import { MailService } from '../../mail/services/mail.service';
import { RegisterVolunteerDto } from '../dtos/register-volunteer.dto';
import { RegisterOrganizationDto } from '../dtos/register-organization.dto';
import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly organizationsService: OrganizationsService,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async registerVolunteer(dto: RegisterVolunteerDto): Promise<void> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    await this.dataSource.transaction(async (manager) => {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        role: UserRole.VOLUNTEER,
      });
      const savedUser = await manager.save(user);

      await manager.query(
        `INSERT INTO volunteer_profiles (first_name, last_name, user_id) VALUES ($1, $2, $3)`,
        [dto.firstName, dto.lastName, savedUser.id],
      );
    });
  }

  async registerOrganization(
    dto: RegisterOrganizationDto,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const documentUrl = file
      ? this.uploadService.getFileUrl(file.filename)
      : null;

    await this.dataSource.transaction(async (manager) => {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        role: UserRole.ORGANIZATION,
      });
      const savedUser = await manager.save(user);

      await manager.query(
        `INSERT INTO organizations (name, type, edrpou, contact_person, document_url, user_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          dto.name,
          dto.type,
          dto.edrpou,
          dto.contactPerson,
          documentUrl,
          savedUser.id,
        ],
      );
    });

    this.mailService
      .sendVerificationResult(dto.email, dto.name, OrgStatus.PENDING)
      .catch(() => {});
  }

  async login(
    dto: LoginDto,
  ): Promise<
    | { status: 'otp_required'; pendingToken: string }
    | { accessToken: string; refreshToken: string }
  > {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const needsOtp = user.role === UserRole.ORGANIZATION || user.twoFaEnabled;

    if (needsOtp) {
      const pendingToken = await this.otpService.generate(user.id);
      return { status: 'otp_required', pendingToken };
    }

    return this.signTokens(user);
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = await this.otpService.verify(dto.pendingToken, dto.code);
    const user = await this.usersService.findById(userId);
    return this.signTokens(user);
  }

  async enableTwoFa(userId: string): Promise<void> {
    await this.usersService.setTwoFa(userId, true);
  }

  async disableTwoFa(userId: string): Promise<void> {
    await this.usersService.setTwoFa(userId, false);
  }

  async refresh(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: payload.sub, email: payload.email, role: payload.role },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
          infer: true,
        }),
      },
    );
    return { accessToken };
  }

  private signTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
        infer: true,
      }),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', {
        infer: true,
      }),
    });
    return { accessToken, refreshToken };
  }
}
