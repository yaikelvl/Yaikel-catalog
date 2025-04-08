import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';
import { ValidRoles } from '../enum/valid-roles';
import { AuthGuard } from '../guards/auth.guard';

/**
 * Auth decorator is a combination of guards and role-based protection for routes.
 * It ensures that the user is authenticated and has one of the specified roles to access the route.
 * 
 * @param roles - List of valid roles that the user must have to access the route.
 * 
 * @returns A decorator that applies authentication guards and role protection to the route handler.
 */
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    // Role protection: ensures only users with one of the specified roles can access the route
    RoleProtected(...roles),
    
    // Auth guard: Ensures the user is authenticated (valid JWT token is required)
    UseGuards(AuthGuard, UserRoleGuard),
  );
}
