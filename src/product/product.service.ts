import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class ProductService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findById(productId: string) {
    const product = await this.firebaseService.getProductById(productId);
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async updateQuantity(productId: string, newQuantity: number) {
    if (!productId || productId.trim() === '') {
      throw new BadRequestException('productId inválido');
    }

    const productRef = firebaseAdmin.firestore().collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new NotFoundException(`Produto ${productId} não encontrado.`);
    }

    await productRef.update({ estoque: newQuantity });

    const updatedProductSnap = await productRef.get();
    const updatedData = updatedProductSnap.data();

    return { id: updatedProductSnap.id, ...updatedData };
  }

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

  async findAllWithRatingFilter(query: {
  categorias?: string[];
  minPrice?: number;
  maxPrice?: number;
  disponibilidade?: boolean;
  avaliacaoMinima?: number;
}) {
  let firestoreQuery: FirebaseFirestore.Query = firebaseAdmin
    .firestore()
    .collection('products');

  // Mesmos filtros que já tem:
  if (query.disponibilidade) {
    firestoreQuery = firestoreQuery.where('estoque', '>', 0);
  }
  if (query.minPrice !== undefined) {
    firestoreQuery = firestoreQuery.where('preco', '>=', query.minPrice);
  }
  if (query.maxPrice !== undefined) {
    firestoreQuery = firestoreQuery.where('preco', '<=', query.maxPrice);
  }
  if (query.categorias?.length === 1) {
    firestoreQuery = firestoreQuery.where(
      'categorias',
      'array-contains',
      query.categorias[0],
    );
  }

  const snapshot = await firestoreQuery.get();
  let products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{ id: string; categorias?: string[] }>;

  // Filtro por múltiplas categorias (local)
  if (query.categorias && query.categorias.length > 1) {
    products = products.filter((prod) =>
      (query.categorias ?? []).every((cat) =>
        (prod.categorias || []).includes(cat),
      ),
    );
  }

  // Agora filtramos por avaliação mínima
  if (query.avaliacaoMinima !== undefined) {
    const ratingsCollection = firebaseAdmin.firestore().collection('ratings');

    // Para cada produto, buscar as avaliações e calcular a média
    const productsWithRating: Array<{ 
      id: string; 
      categorias?: string[]; 
      averageRating: number; 
      [key: string]: any; // para aceitar outras propriedades que o produto tenha
    }> = [];
    for (const product of products) {
      const ratingsSnapshot = await ratingsCollection
        .where('type', '==', 'product')
        .where('targetId', '==', product.id)
        .get();

      const ratings = ratingsSnapshot.docs.map((doc) => doc.data() as { rating: number });
      const avgRating =
        ratings.reduce((acc, cur) => acc + (cur.rating || 0), 0) /
        (ratings.length || 1);

      if (avgRating >= query.avaliacaoMinima) {
        productsWithRating.push({ ...product, averageRating: avgRating });
      }
    }

    products = productsWithRating;
  }

  if (products.length === 0) {
    return {
      message: 'Nenhum produto encontrado com os critérios informados.',
      products: [],
    };
  }

  return products;
}


  async findAll(query: {
  categorias?: string[];
  minPrice?: number;
  maxPrice?: number;
  disponibilidade?: boolean;
  avaliacaoMinima?: number;
}) {
  if (query.avaliacaoMinima !== undefined) {
    return this.findAllWithRatingFilter(query);
  }

  // Mantém o findAll original caso não tenha filtro por avaliação
  let firestoreQuery: FirebaseFirestore.Query = firebaseAdmin
    .firestore()
    .collection('products');

  if (query.disponibilidade) {
    firestoreQuery = firestoreQuery.where('estoque', '>', 0);
  }
  if (query.minPrice !== undefined) {
    firestoreQuery = firestoreQuery.where('preco', '>=', query.minPrice);
  }
  if (query.maxPrice !== undefined) {
    firestoreQuery = firestoreQuery.where('preco', '<=', query.maxPrice);
  }
  if (query.categorias?.length === 1) {
    firestoreQuery = firestoreQuery.where(
      'categorias',
      'array-contains',
      query.categorias[0],
    );
  }

  const snapshot = await firestoreQuery.get();
  let products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{ id: string; categorias?: string[] }>;

  if (query.categorias && query.categorias.length > 1) {
    products = products.filter((prod) =>
      (query.categorias ?? []).every((cat) =>
        (prod.categorias || []).includes(cat),
      ),
    );
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

  async remove(id: string, deletadoPor: string) {
    const docRef = firebaseAdmin.firestore().collection('products').doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new NotFoundException('Produto não encontrado');
    }

    const dadosDoProduto = docSnapshot.data();

    await firebaseAdmin.firestore().collection('produtos_deletados').add({
      itemId: id,
      dados: dadosDoProduto,
      deletadoPor: deletadoPor,
      deletadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    await docRef.delete();

    return {
      message: 'Produto removido com sucesso.',
    };
  }
}
