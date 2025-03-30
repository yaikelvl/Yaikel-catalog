
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';
import { ValidRoles } from '../enum/valid-roles';
import { GetUser } from './get-user.decorator';
import { User } from '../entities/auth.entity';



export function Auth(...roles: ValidRoles[]) {

    return applyDecorators(

        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
}