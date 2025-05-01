import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../auth/dtos/login.dto';

import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { IdToken } from './decorators/id-token.decorator';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from './decorators/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@IdToken() token: string) {
    return this.authService.logout(token);
  }

  @Post('refresh-auth')
  @HttpCode(200)
  refreshAuth(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAuthToken(dto.refreshToken);
  }
}
