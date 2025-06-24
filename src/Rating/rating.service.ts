import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class RatingService {
  private collection;

  constructor(private readonly firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('ratings');
  }

  async createRating(data: {
    type: 'product' | 'vendedor';
    targetId: string;
    userId: string;
    rating: number;
    comment?: string;
    orderId: string;
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('A nota deve estar entre 1 e 5.');
    }

    const ratingData = {
      ...data,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    await this.collection.add(ratingData);

    return { message: 'Avaliação registrada com sucesso.' };
  }

  async listRatings(
    type: 'product' | 'vendedor',
    targetId: string,
  ) {
    const snapshot = await this.collection
      .where('type', '==', type)
      .where('targetId', '==', targetId)
      .get();

    const ratings = snapshot.docs.map((doc) => {
      const data = doc.data() as {
        rating: number;
        comment?: string;
        userId: string;
        orderId: string;
        type: 'product' | 'vendedor';
        targetId: string;
        createdAt?: FirebaseFirestore.Timestamp;
      };

      return {
        id: doc.id,
        ...data,
      };
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings
      ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
      : 0;

    return {
      total: totalRatings,
      averageRating: Number(averageRating.toFixed(2)),
      ratings,
    };
  }
}
