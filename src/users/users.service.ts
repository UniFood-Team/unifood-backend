import { FirebaseService } from 'src/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

async registerUser(dto: RegisterUserDto) {
  try {
    const existingUser = await this.firebaseService.getUserByEmail(dto.email);
    
    // Se o usuário já existe, retornar ou lançar exceção
    if (existingUser) {
      return { message: 'Usuário já existe com esse e-mail.', uid: existingUser.uid };
    }
  } catch (error) {
    // Se o erro for "user-not-found", podemos seguir com a criação
    if (error.code !== 'auth/user-not-found') {
      throw error; // Outro erro inesperado
    }
  }

  const user = await this.firebaseService.createUser({
    displayName: dto.firstName,
    email: dto.email,
    password: dto.password,
  });
    // if (dto.roles?.length) {
    //   await this.firebaseService.setCustomUserClaims(user.uid, {
    //     roles: dto.roles,
    //   });
    // }
    return user;
  }
}
