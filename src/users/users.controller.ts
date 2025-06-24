import { FirebaseService } from 'src/firebase/firebase.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UsersService } from './users.service';
import { IdToken } from 'src/auth/decorators/id-token.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/is-public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Public()
  @Post('register')
  async registerUser(@Body() dto: RegisterUserDto) {
    return await this.usersService.registerUser(dto);
  }

  @Get('profile')
  async profile(@IdToken() token: string) {
    return await this.firebaseService.verifyIdToken(token);
  }
}
