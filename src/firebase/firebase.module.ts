import * as firebaseAdmin from 'firebase-admin';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { FirebaseConfigService } from './firebase-config.service';
import { FirebaseService } from './firebase.service';
import * as functions from 'firebase-functions';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const firebaseConfigProvider = {
      provide: FirebaseConfigService,
      useFactory: () => {
        const apiKey = functions.config().app?.api_key;
        if (!apiKey) {
          throw new Error('APP_API_KEY environment variable is not set');
        }
        return new FirebaseConfigService(apiKey);
      },
    };

    const firebaseProvider = {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const credentialsStr = functions.config().app?.service_account;
        if (!credentialsStr) {
          throw new Error('SERVICE_ACCOUNT_CREDENTIALS environment variable is not set');
        }

        const serviceAccount = JSON.parse(credentialsStr);

        if (firebaseAdmin.apps.length === 0) {
          firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
          });
        }

        return firebaseAdmin;
      },
    };

    return {
      module: FirebaseModule,
      providers: [firebaseConfigProvider, firebaseProvider, FirebaseService],
      exports: [firebaseConfigProvider, firebaseProvider, FirebaseService],
    };
  }
}
