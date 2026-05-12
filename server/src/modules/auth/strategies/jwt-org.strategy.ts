import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from '../../../env.variables';
import { ActorType } from '../../../common/enums';

export interface OrgJwtPayload {
  sub: string;
  email: string;
  actor: ActorType.ORGANIZATION;
}

@Injectable()
export class JwtOrgStrategy extends PassportStrategy(Strategy, 'jwt-org') {
  constructor(configService: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  validate(payload: OrgJwtPayload): { id: string; email: string } {
    if (payload.actor !== ActorType.ORGANIZATION)
      throw new UnauthorizedException();
    return { id: payload.sub, email: payload.email };
  }
}
