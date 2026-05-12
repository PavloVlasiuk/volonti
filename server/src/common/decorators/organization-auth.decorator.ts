import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtOrgGuard } from '../guards/jwt-org.guard';
import { OrgVerifiedGuard } from '../guards/org-verified.guard';

export const OrganizationAuth = () =>
  applyDecorators(UseGuards(JwtOrgGuard));

export const OrgVerifiedAuth = () =>
  applyDecorators(UseGuards(JwtOrgGuard, OrgVerifiedGuard));
