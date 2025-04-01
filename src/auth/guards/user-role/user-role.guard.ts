import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  /**
   * Creates an instance of the UserRoleGuard.
   * @param reflector - Injects Reflector service to get metadata from the route handler.
   */
  constructor(
    private readonly reflector: Reflector
  ) { }

  /**
   * Determines if a request can be activated based on user roles.
   * 
   * This method checks if the current user has one of the valid roles specified in the route handler's metadata.
   * 
   * @param context - Execution context that gives access to the request object.
   * @returns A boolean indicating whether the request is allowed to proceed.
   * 
   * Throws:
   * - BadRequestException: if the user is not found in the request.
   * - ForbiddenException: if the user does not have any of the valid roles.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    // Extracts roles metadata from the handler
    const valiRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());
    
    // If no roles are required, allow access
    if(!valiRoles) return true;
    if(valiRoles.length === 0 ) return true;

    // Get the current user from the request object
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    // Throws an exception if no user is found
    if (!user)
      throw new BadRequestException('User not found')

    // Check if the user's roles match any of the required roles
    for (const role of user.role) {
      if(valiRoles.includes(role))
        return true;
    }

    // If none of the roles match, access is forbidden
    throw new ForbiddenException(`User need a valid role: [${valiRoles}]`)
  }
}
