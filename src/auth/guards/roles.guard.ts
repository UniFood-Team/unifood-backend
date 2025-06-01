import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as firebaseAdmin from 'firebase-admin';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // Se a rota não define roles, libera acesso
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Sem token de autorização');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

      const userRole = decodedToken.role || decodedToken.roles;

      if (!userRole) {
        throw new ForbiddenException('Usuário sem role definida');
      }

      if (Array.isArray(userRole)) {
        const hasRole = userRole.some((role) => requiredRoles.includes(role));
        if (!hasRole) {
          throw new ForbiddenException('Acesso negado');
        }
      } else {
        if (!requiredRoles.includes(userRole)) {
          throw new ForbiddenException('Acesso negado');
        }
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('Token inválido ou expirado');
    }
  }
}
