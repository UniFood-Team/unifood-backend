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

  async listRatings(type: 'product' | 'vendedor', targetId: string) {
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

  async listUserRatings(userId: string) {
    const snapshot = await this.collection.where('userId', '==', userId).get();

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

  async listAllSellerRatings() {
    const snapshot = await this.collection
      .where('type', '==', 'vendedor')
      .get();

    const ratings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    // Agrupar avaliações por targetId (vendedor)
    const grouped: Record<string, { ratings: any[]; sum: number }> = {};

    for (const rating of ratings) {
      const targetId = rating.targetId;
      if (!grouped[targetId]) {
        grouped[targetId] = { ratings: [], sum: 0 };
      }
      grouped[targetId].ratings.push(rating);
      grouped[targetId].sum += rating.rating || 0;
    }

    // Buscar nomes dos vendedores na collection 'users'
    const db = this.firebaseService.getFirestore();
    const sellerIds = Object.keys(grouped);
    const sellersData: Record<string, { name?: string; image?: string }> = {};

    if (sellerIds.length > 0) {
      const usersSnapshot = await db
        .collection('users')
        .where(firebaseAdmin.firestore.FieldPath.documentId(), 'in', sellerIds)
        .get();

      usersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        sellersData[doc.id] = {
          name: data.firstName || '',
          image: data.image || null,
        };
      });
    }

    // Montar resultado com média por vendedor e nome
    const sellers = Object.entries(grouped).map(([targetId, group]) => {
      const total = group.ratings.length;
      const averageRating = total ? group.sum / total : 0;
      return {
        targetId,
        sellerName: sellersData[targetId]?.name || null,
        image: sellersData[targetId]?.image || null,
        total,
        averageRating: Number(averageRating.toFixed(2)),
        ratings: group.ratings,
      };
    });

    return {
      totalSellers: sellers.length,
      sellers,
    };
  }
}
