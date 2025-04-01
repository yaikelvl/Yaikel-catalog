import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../enum/valid-roles';

export const META_ROLES = 'roles';

/**
 * RoleProtected is a custom decorator to define roles required to access a route.
 * It uses metadata to attach the valid roles to the handler for later validation.
 * 
 * @param args - List of roles that are allowed to access the route.
 * 
 * @returns A decorator that sets the metadata `roles` with the provided roles on the route handler.
 */
export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLES, args);
}
