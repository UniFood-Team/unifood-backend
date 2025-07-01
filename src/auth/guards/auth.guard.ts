import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly reflector: Reflector, // injete o Reflector
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['Authorization'];

    if (!authHeader) {
      return false;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return false;
    }

    try {
      const decoded = await this.firebaseService.verifyIdToken(token, true);
      request.user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
