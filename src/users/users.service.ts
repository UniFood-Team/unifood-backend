import { FirebaseService } from 'src/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { CartService } from '../cart/cart.service';


@Injectable()
export class UsersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cartService: CartService,
  ) {}

async getUserCart(userId: string) {
   
    return this.cartService.getCart(userId);
  }
  
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
      await this.firebaseService.setCustomUserClaims(user.uid, {
        role: dto.role,
      });

      await this.firebaseService.saveUserToFirestore({
      uid: user.uid,
      firstName: dto.firstName,
      email: dto.email,
      role: dto.role,
      createdAt: new Date().toISOString(),
    });

    return user;
  }
}
