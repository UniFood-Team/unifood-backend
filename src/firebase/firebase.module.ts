import * as firebaseAdmin from 'firebase-admin';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { FirebaseConfigService } from './firebase-config.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import * as fs from 'fs';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const firebaseConfigProvider = {
      provide: FirebaseConfigService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('FIREBASE_API_KEY');
        if (!apiKey) {
          throw new Error('APP_API_KEY environment variable is not set');
        }
        return new FirebaseConfigService(apiKey);
      },
    };

    const firebaseAdminProvider = {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const credentialsPath = configService.get<string>('FIREBASE_ADMIN_CREDENTIALS');
        if (!credentialsPath) {
          throw new Error('FIREBASE_ADMIN_CREDENTIALS environment variable is not set');
        }
        const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        if (!firebaseAdmin.apps.length) {
          firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
          });
        }
        return firebaseAdmin;
      },
    };

    return {
      module: FirebaseModule,
      providers: [firebaseConfigProvider, firebaseAdminProvider, FirebaseService],
      exports: [firebaseConfigProvider, firebaseAdminProvider, FirebaseService],
    };
  }
}
