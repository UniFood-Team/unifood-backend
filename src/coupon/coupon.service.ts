import { Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class CouponService {
  constructor(private readonly firebaseService: FirebaseService) {}
  async create(createCouponDto: CreateCouponDto) {
    const db = this.firebaseService.getFirestore();

    // Cria um novo documento na coleção 'coupons'
    const couponRef = db.collection('coupons').doc();
    const couponData = {
      id: couponRef.id,
      userId: createCouponDto.userId,
      discount: createCouponDto.discount,
      createdAt: new Date().toISOString(),
    };

    await couponRef.set(couponData);

    return couponData;
  }

  async findAllByUser(userId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db
      .collection('coupons')
      .where('userId', '==', userId)
      .get();

    const coupons: any = [];
    snapshot.forEach((doc) => {
      coupons.push(doc.data());
    });

    return coupons;
  }

  async findOne(id: string) {
    const db = this.firebaseService.getFirestore();
    const couponRef = db.collection('coupons').doc(id);

    const doc = await couponRef.get();

    return doc.exists ? doc.data() : 'Cupom não encontrado';
  }

  async remove(id: string) {
    const db = this.firebaseService.getFirestore();
    const couponRef = db.collection('coupons').doc(id);

    const doc = await couponRef.get();
    if (!doc.exists) {
      throw new Error('Cupom não encontrado');
    }

    await couponRef.delete();
    return { message: `Cupom ${id} removido com sucesso.` };
  }
}
