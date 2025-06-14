import { FirebaseService } from 'src/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { CartService } from '../cart/cart.service';
import * as admin from 'firebase-admin';


@Injectable()
export class UsersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cartService: CartService,
    
  ) {}

async getUserCart(userId: string) {
   
    return this.cartService.getCart(userId);
  }

async syncAuthUsersToFirestore() {
  const users: any[] = [];
  let nextPageToken;

  do {
    const result = await this.firebaseService.admin.auth().listUsers(1000, nextPageToken);
    result.users.forEach((userRecord) => {
      users.push({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        phoneNumber: userRecord.phoneNumber || '',
        role: userRecord.customClaims?.role || 'comprador', // padrão se não tiver
        createdAt: userRecord.metadata.creationTime,
      });
    });
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  for (const user of users) {
    const docRef = this.firebaseService.firestore.collection('users').doc(user.uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({
        uid: user.uid,
        firstName: user.displayName,
        email: user.email,
        phone: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt,
      });
      console.log(`Usuário ${user.email} adicionado no Firestore.`);
    } else {
      console.log(`Usuário ${user.email} já existe no Firestore.`);
    }
  }

  return { message: 'Sincronização concluída', total: users.length };
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
