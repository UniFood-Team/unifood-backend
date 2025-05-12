import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProductService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async validateCategorias(categorias: string[]) {
    if (!categorias || categorias.length === 0) return;

    const snapshot = await firebaseAdmin
      .firestore()
      .collection('categories')
      .where('nome', 'in', categorias)
      .get();

    const existentes = snapshot.docs.map((doc) => doc.data().nome);
    const invalidas = categorias.filter((c) => !existentes.includes(c));

    if (invalidas.length > 0) {
      throw new BadRequestException(
        `Categorias inválidas: ${invalidas.join(', ')}`,
      );
    }
  }
  async create(createProductDto: CreateProductDto) {
    const { categorias } = createProductDto;

    if (categorias && categorias.length > 0) {
      await this.validateCategorias(categorias);
    }

    const plainData = JSON.parse(JSON.stringify(createProductDto));

    const createdProduct = await firebaseAdmin
      .firestore()
      .collection('products')
      .add(plainData);

    return {
      message: 'Produto cadastrado com sucesso!',
      createdProduct,
    };
  }

  async findAll(query: {
    categorias?: string[];
    minPrice?: number;
    maxPrice?: number;
    disponibilidade?: boolean;
    avaliacaoMinima?: number;
  }) {
    console.log(query);
    let firestoreQuery: FirebaseFirestore.Query = firebaseAdmin
      .firestore()
      .collection('products');

    // Filtro por disponibilidade
    if (query.disponibilidade) {
      firestoreQuery = firestoreQuery.where('estoque', '>', 0);
    }

    // Filtros de faixa de preço
    if (query.minPrice !== undefined) {
      firestoreQuery = firestoreQuery.where('preco', '>=', query.minPrice);
    }

    if (query.maxPrice !== undefined) {
      firestoreQuery = firestoreQuery.where('preco', '<=', query.maxPrice);
    }

    // Filtro por avaliação mínima
    if (query.avaliacaoMinima !== undefined) {
      firestoreQuery = firestoreQuery.where(
        'avaliacaoMedia',
        '>=',
        query.avaliacaoMinima,
      );
    }
    if (query.categorias?.length === 1) {
      firestoreQuery = firestoreQuery.where(
        'categorias',
        'array-contains',
        query.categorias[0],
      );
    }

    const snapshot = await firestoreQuery.get();
    console.log(snapshot);
    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; categories?: string[] }>;

    if (query.categorias) {
      if (query.categorias?.length > 1) {
        products = products.filter((prod) =>
          query.categorias?.every((cat) =>
            (prod.categories || []).includes(cat),
          ),
        );
      }
    }
    if (products.length === 0) {
      return {
        message: 'Nenhum produto encontrado com os critérios informados.',
        products: [],
      };
    }

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
    // Se o DTO contém o campo categorias, valida
    if (updateProductDto.categorias && updateProductDto.categorias.length > 0) {
      await this.validateCategorias(updateProductDto.categorias);
    }

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
