import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from '../../../env.variables';
import { ActorType, UserRole } from '../../../common/enums';

export interface RefreshJwtPayload {
  sub: string;
  email: string;
  actor: ActorType;
  role?: UserRole;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET', { infer: true }),
    });
  }

  validate(payload: RefreshJwtPayload): RefreshJwtPayload {
    return payload;
  }
}
