import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'apps/users/src/enums/roles.enums';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../auth/decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} 
  // Reflector class is used to extract the req roles from the metadata

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
      // getAllAndOverride first looks for the metadata under the ROLE_KEY in the class then handler (the handler takes more authority)
    ]);
    if (!requiredRoles) return true;
    const user = context.switchToHttp().getRequest().user;
    console.log('user..', user);
    const hasRequiredRole = requiredRoles.some((role) => user.role == role);
    return hasRequiredRole; // i.e return true or false
  }
}
