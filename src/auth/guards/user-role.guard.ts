// Actualización para user-role.guard.ts
import { Reflector } from '@nestjs/core';
import { 
  BadRequestException, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException, 
  Injectable,
  Logger 
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  private readonly logger = new Logger('UserRoleGuard');

  constructor(
    private readonly reflector: Reflector
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());
    
    if(!validRoles || validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    this.logger.debug(`Checking roles for user: ${JSON.stringify(user)}`);

    if (!user.role) {
      throw new BadRequestException('User role information is missing');
    }

  
    const roles = Array.isArray(user.role) ? user.role : [user.role];
    
    
    for (const role of roles) {
      if(validRoles.includes(role)) {
        return true;
      }
    }
    throw new ForbiddenException(`User needs a valid role: [${validRoles}]`);
  }
}