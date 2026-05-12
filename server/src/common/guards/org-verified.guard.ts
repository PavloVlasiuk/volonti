import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { OrgStatus } from '../enums';
import { OrganizationsService } from '../../modules/organizations/services/organizations.service';

@Injectable()
export class OrgVerifiedGuard implements CanActivate {
  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const organizationsService = this.moduleRef.get(OrganizationsService, {
      strict: false,
    });
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { id: string } }>();
    const org = await organizationsService.findById(user.id).catch(() => null);
    if (!org || org.status !== OrgStatus.VERIFIED) {
      throw new ForbiddenException('Organization is not verified');
    }
    return true;
  }
}
