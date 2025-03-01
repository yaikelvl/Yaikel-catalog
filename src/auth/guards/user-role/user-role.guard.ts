import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    //const valiRoles: string[] = this.reflector.get<string[]>('roles', context.getHandler());

    const valiRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());
    
    if(!valiRoles) return true;
    if(valiRoles.length === 0 ) return true;


    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user)
      throw new BadRequestException('User not found')

    for (const role of user.role) {
      if(valiRoles.includes(role))
        return true;
    }

    throw new ForbiddenException(`User need a valid role: [${valiRoles}]`)
  }
}
