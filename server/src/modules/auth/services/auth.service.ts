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
import { ActorType, OrgStatus, UserRole } from '../../../common/enums';
import { UsersService } from '../../users/services/users.service';
import { OtpService } from '../../otp/services/otp.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { UploadService } from '../../upload/services/upload.service';
import { MailService } from '../../mail/services/mail.service';
import { RegisterVolunteerDto } from '../dtos/register-volunteer.dto';
import { RegisterOrganizationDto } from '../dtos/register-organization.dto';
import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { RefreshJwtPayload } from '../strategies/jwt-refresh.strategy';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly organizationsService: OrganizationsService,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async registerVolunteer(
    dto: RegisterVolunteerDto,
  ): Promise<{ pendingToken: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        role: UserRole.VOLUNTEER,
      });
      const created = await manager.save(user);

      await manager.query(
        `INSERT INTO volunteer_profiles (first_name, last_name, user_id) VALUES ($1, $2, $3)`,
        [dto.firstName, dto.lastName, created.id],
      );
      return created;
    });

    const pendingToken = await this.otpService.generate(
      savedUser.id,
      savedUser.email,
      ActorType.USER,
    );
    return { pendingToken };
  }

  async verifyEmail(
    dto: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { actorId, actor } = await this.otpService.verify(
      dto.pendingToken,
      dto.code,
    );
    if (actor !== ActorType.USER)
      throw new UnauthorizedException('Invalid verification token');

    await this.usersService.setEmailVerified(actorId, true);

    const user = await this.usersService.findById(actorId);
    return this.signUserTokens(user.id, user.email, user.role);
  }

  async registerOrganization(
    dto: RegisterOrganizationDto,
    file: Express.Multer.File | undefined,
  ): Promise<void> {
    const existing = await this.organizationsService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const documentUrl = file
      ? this.uploadService.getFileUrl(file.filename)
      : null;

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.organizationsService.create({
      name: dto.name,
      type: dto.type,
      edrpou: dto.edrpou,
      contactPerson: dto.contactPerson,
      email: dto.email,
      passwordHash,
      documentUrl,
    });

    void this.mailService.sendVerificationResult(
      dto.email,
      dto.name,
      OrgStatus.PENDING,
    );
  }

  async login(
    dto: LoginDto,
  ): Promise<
    | { status: 'otp_required'; pendingToken: string }
    | { status: 'email_verification_required'; pendingToken: string }
    | { accessToken: string; refreshToken: string }
  > {
    const user = await this.usersService.findRawByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.role === UserRole.VOLUNTEER && !user.emailVerified) {
      const pendingToken = await this.otpService.generate(
        user.id,
        user.email,
        ActorType.USER,
      );
      return { status: 'email_verification_required', pendingToken };
    }

    if (user.twoFaEnabled) {
      const pendingToken = await this.otpService.generate(
        user.id,
        user.email,
        ActorType.USER,
      );
      return { status: 'otp_required', pendingToken };
    }

    return this.signUserTokens(user.id, user.email, user.role);
  }

  async loginOrganization(dto: { email: string; password: string }): Promise<{
    status: 'otp_required';
    pendingToken: string;
  }> {
    const org = await this.organizationsService.findRawByEmail(dto.email);
    if (!org) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, org.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const pendingToken = await this.otpService.generate(
      org.id,
      org.email,
      ActorType.ORGANIZATION,
    );
    return { status: 'otp_required', pendingToken };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { actorId, actor } = await this.otpService.verify(
      dto.pendingToken,
      dto.code,
    );

    if (actor === ActorType.ORGANIZATION) {
      const org = await this.organizationsService.findById(actorId);
      return this.signOrgTokens(org.id, org.email);
    }

    const user = await this.usersService.findById(actorId);
    return this.signUserTokens(user.id, user.email, user.role);
  }

  async enableTwoFa(userId: string): Promise<void> {
    await this.usersService.setTwoFa(userId, true);
  }

  async disableTwoFa(userId: string): Promise<void> {
    await this.usersService.setTwoFa(userId, false);
  }

  async refresh(payload: RefreshJwtPayload): Promise<{ accessToken: string }> {
    const jwtPayload =
      payload.actor === ActorType.ORGANIZATION
        ? {
            sub: payload.sub,
            email: payload.email,
            actor: ActorType.ORGANIZATION,
          }
        : {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            actor: ActorType.USER,
          };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
        infer: true,
      }),
    });
    return { accessToken };
  }

  private signUserTokens(
    id: string,
    email: string,
    role: UserRole,
  ): { accessToken: string; refreshToken: string } {
    const payload = { sub: id, email, role, actor: ActorType.USER };
    return this.signTokenPair(payload);
  }

  private signOrgTokens(
    id: string,
    email: string,
  ): { accessToken: string; refreshToken: string } {
    const payload = { sub: id, email, actor: ActorType.ORGANIZATION };
    return this.signTokenPair(payload);
  }

  private signTokenPair(payload: object): {
    accessToken: string;
    refreshToken: string;
  } {
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
