import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProductService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createProductDto: CreateProductDto) {
    const plainProduct = instanceToPlain(createProductDto);
    plainProduct.criadoEm =
      firebaseAdmin.firestore.FieldValue.serverTimestamp();
    const createdProduct = await firebaseAdmin
      .firestore()
      .collection('products')
      .add(plainProduct);
    return {
      message: 'Produto cadastrado com sucesso!',
      createdProduct,
    };
  }

  async findAll() {
    const snapshot = await firebaseAdmin
      .firestore()
      .collection('products')
      .get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  }

  async findOne(id: string) {
    const doc = await firebaseAdmin
      .firestore()
      .collection('products')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Produto não encontrado');
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>) {
    const plainData = JSON.parse(JSON.stringify(updateProductDto));

    await firebaseAdmin
      .firestore()
      .collection('products')
      .doc(id)
      .update(plainData);

    return {
      message: 'Produto atualizado com sucesso!',
    };
  }

  async remove(id: string) {
    await firebaseAdmin.firestore().collection('products').doc(id).delete();
    return {
      message: 'Produto removido com sucesso!',
    };
  }
}
