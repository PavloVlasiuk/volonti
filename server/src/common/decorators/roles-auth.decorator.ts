import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '../enums';
import { JwtUserGuard } from '../guards/jwt-user.guard';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

export const RolesAuth = (...roles: UserRole[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtUserGuard, RolesGuard),
  );
