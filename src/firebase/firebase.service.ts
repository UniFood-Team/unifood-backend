import axios from 'axios';
import * as firebaseAdmin from 'firebase-admin';
import { CreateRequest } from 'firebase-admin/lib/auth/auth-config';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseConfigService } from './firebase-config.service';
import { Product } from 'src/product/interface/product.interface';
import * as serviceAccount from '../../serviceAccountKey.json';


@Injectable()
export class FirebaseService {
  private readonly apiKey: string;
  public readonly firestore: FirebaseFirestore.Firestore;
  public readonly admin: firebaseAdmin.app.App;

  constructor(firebaseConfig: FirebaseConfigService) {
    this.apiKey = firebaseConfig.apiKey;

    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
      });
    }
    this.admin = firebaseAdmin.app();

    this.firestore = this.admin.firestore();
  }

  getFirestore() {
    return this.firestore;
  }

  async getUserByEmail(email: string) {
    return await this.admin.auth().getUserByEmail(email);
  }

  async createUser(props: CreateRequest): Promise<UserRecord> {
    return (await this.admin
      .auth()
      .createUser(props)
      .catch(this.handleFirebaseAuthError)) as UserRecord;
  }

  async setCustomUserClaims(uid: string, claims: Record<string, any>) {
    return await this.admin.auth().setCustomUserClaims(uid, claims);
  }

  async verifyIdToken(
    token: string,
    checkRevoked = false,
  ): Promise<DecodedIdToken> {
    return (await this.admin
      .auth()
      .verifyIdToken(token, checkRevoked)
      .catch(this.handleFirebaseAuthError)) as DecodedIdToken;
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
    return await this.sendPostRequest(url, {
      email,
      password,
      returnSecureToken: true,
    }).catch(this.handleRestApiError);
  }

  async revokeRefreshToken(uid: string) {
    return await this.admin
      .auth()
      .revokeRefreshTokens(uid)
      .catch(this.handleFirebaseAuthError);
  }

  async refreshAuthToken(refreshToken: string) {
    const {
      id_token: idToken,
      refresh_token: newRefreshToken,
      expires_in: expiresIn,
    } = await this.sendRefreshAuthTokenRequest(refreshToken).catch(
      this.handleRestApiError,
    );
    return {
      idToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  }

  private async sendRefreshAuthTokenRequest(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    return await this.sendPostRequest(url, payload);
  }

  private async sendPostRequest(url: string, data: any) {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  private handleFirebaseAuthError(error: any) {
    if (error.code?.startsWith('auth/')) {
      throw new BadRequestException(error.message);
    }
    throw new Error(error.message);
  }

  private handleRestApiError(error: any) {
    if (error.response?.data?.error?.code === 400) {
      const messageKey = error.response?.data?.error?.message;
      const message =
        {
          INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials',
          INVALID_REFRESH_TOKEN: 'Invalid refresh token',
          TOKEN_EXPIRED: 'Token expired',
          USER_DISABLED: 'User disabled',
        }[messageKey] ?? messageKey;
      throw new BadRequestException(message);
    }
    throw new Error(error.message);
  }

  async saveUserToFirestore(userData: Record<string, any>) {
    const plainData = JSON.parse(JSON.stringify(userData)); // Remove métodos e protótipos
    return await this.firestore.collection('users').add(plainData);
  }

  async getProductById(productId: string): Promise<Product | null> {
    const doc = await this.firestore.collection('products').doc(productId).get();
    if (!doc.exists) return null;
    return doc.data() as Product;
  }
}
