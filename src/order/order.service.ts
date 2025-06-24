<<<<<<< HEAD
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; // seu serviço Firebase
=======
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; 
>>>>>>> 54504d2a0103fe3e3e7dd6b26eef70c76be243bb
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FieldValue } from 'firebase-admin/firestore';

type OrderItem = {
  productId: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
};

@Injectable()
export class OrderService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly productService: ProductService,
  ) {}

<<<<<<< HEAD
  async create(createOrderDto: CreateOrderDto) {
    const { userId } = createOrderDto;
=======
  
async create(createOrderDto: CreateOrderDto) {
  const { userId } = createOrderDto;
>>>>>>> 54504d2a0103fe3e3e7dd6b26eef70c76be243bb

    const db = this.firebaseService.getFirestore();

    const orderRef = db.collection('orders').doc();

    await db.runTransaction(async (transaction) => {
      const orderItems: OrderItem[] = []; // ✅ declare fora do loop apenas uma vez
      let total = 0;

<<<<<<< HEAD
      transaction.set(orderRef, {
        userId,
        items: orderItems,
        total,
        status: 'pendente',
        createdAt: FieldValue.serverTimestamp(),
=======
  await db.runTransaction(async (transaction) => {
    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const cartItem of cart.items) {
      const productRef = db.collection('products').doc(cartItem.productId);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists) {
        throw new NotFoundException(`Produto ${cartItem.productId} não encontrado.`);
      }

      const productData = productSnap.data();
      if (!productData) {
        throw new BadRequestException(`Dados do produto ${cartItem.productId} não encontrados.`);
      }

      const estoqueAtual = productData.estoque ?? 0;

      if (estoqueAtual < cartItem.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${productData.nome}.`
        );
      }

      const novoEstoque = estoqueAtual - cartItem.quantidade;

      transaction.update(productRef, { estoque: novoEstoque });

      const subtotal = productData.preco * cartItem.quantidade;
      total += subtotal;

      orderItems.push({
        productId: cartItem.productId,
        nome: productData.nome,
        preco: productData.preco,
        quantidade: cartItem.quantidade,
        subtotal,
>>>>>>> 54504d2a0103fe3e3e7dd6b26eef70c76be243bb
      });
    });

<<<<<<< HEAD
    return {
      success: true,
      orderId: orderRef.id,
    };
  }
=======
  async getOrderHistory(userId: string) {
  const db = this.firebaseService.getFirestore();
  const ordersSnap = await db
    .collection('orders')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = ordersSnap.docs.map((doc) => {
    const data = doc.data();
    if (!data) {
      throw new NotFoundException(`Dados do pedido ${doc.id} não encontrados.`);
    }

    const produtosComAvaliacao = (data.items || []).map((produto: any) => ({
      ...produto,
      avaliado: false, // placeholder
    }));

    return {
      id: doc.id,
      data: data.createdAt?.toDate(),
      status: data.status,
      valorTotal: data.total,
      produtos: produtosComAvaliacao,
    };
  });

  return orders;
}


async getOrderDetails(orderId: string, userId: string) {
  const db = this.firebaseService.getFirestore();

  const docRef = db.collection('orders').doc(orderId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new NotFoundException('Pedido não encontrado');
  }

  const data = docSnap.data();
  if (!data) {
    throw new BadRequestException('Dados do pedido inválidos.');
  }

  if (data.userId !== userId) {
    throw new ForbiddenException('Acesso negado a este pedido');
  }

  const produtosComAvaliacao = (data.items || []).map((produto: any) => ({
    ...produto,
    avaliado: false, // placeholder
  }));

  return {
    id: docSnap.id,
    data: data.createdAt?.toDate(),
    status: data.status,
    total: data.total,
    formaPagamento: data.formaPagamento,
    produtos: produtosComAvaliacao,
  };
}

async addOrderToCart(orderId: string, userId: string) {
  const db = this.firebaseService.getFirestore();

  const orderRef = db.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new NotFoundException('Pedido não encontrado.');
  }

  const orderData = orderSnap.data();
  if (!orderData) {
    throw new BadRequestException('Dados do pedido inválidos.');
  }

  if (orderData.userId !== userId) {
    throw new ForbiddenException('Acesso negado a este pedido.');
  }

  const cartRef = db.collection('carts').doc(userId);
  const cartSnap = await cartRef.get();

  const currentCart = cartSnap.exists ? cartSnap.data() ?? {} : { items: [] };

  const currentItems = Array.isArray(currentCart.items) ? currentCart.items : [];


  const itemsToAdd = (orderData.items || []).map((item: any) => ({
    productId: item.productId,
    quantidade: item.quantidade,
  }));

  for (const item of itemsToAdd) {
    const existingItem = currentItems.find((i: any) => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantidade += item.quantidade;
    } else {
      currentItems.push(item);
    }
  }

  await cartRef.set({ items: currentItems });

  return { success: true, message: 'Itens adicionados ao carrinho com sucesso.' };
}

>>>>>>> 54504d2a0103fe3e3e7dd6b26eef70c76be243bb

  async findAll() {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('orders').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const db = this.firebaseService.getFirestore();
    const orderSnap = await db.collection('orders').doc(id).get();

    if (!orderSnap.exists) {
      throw new NotFoundException(`Pedido ${id} não encontrado.`);
    }

    return { id: orderSnap.id, ...orderSnap.data() };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const db = this.firebaseService.getFirestore();
    const orderRef = db.collection('orders').doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new NotFoundException(`Pedido ${id} não encontrado.`);
    }

    const orderData = orderSnap.data();
    if (!orderData) {
      throw new BadRequestException('Dados do pedido inválidos.');
    }

    const currentStatus = orderData.status;
    const newStatus = updateOrderDto.status;

    if (!newStatus) {
      throw new BadRequestException('Nenhum campo válido para atualizar.');
    }

    // Se status for igual, nada a fazer
    if (newStatus === currentStatus) {
      return { id: orderSnap.id, ...orderData };
    }

    // ✅ Quando o novo status é "pago", usamos uma transação para reduzir o estoque com segurança
    if (newStatus === 'pago' && currentStatus !== 'pago') {
      await db.runTransaction(async (transaction) => {
        for (const item of orderData.items) {
          const productRef = db.collection('products').doc(item.productId);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists) {
            throw new NotFoundException(
              `Produto ${item.productId} não encontrado.`,
            );
          }

          const productData = productSnap.data();
          if (!productData) {
            throw new BadRequestException(
              `Dados do produto ${item.productId} não encontrados.`,
            );
          }
          const currentStock = Number(productData.estoque);
          const quantityToReduce = Number(item.quantidade);

          if (isNaN(currentStock) || isNaN(quantityToReduce)) {
            throw new BadRequestException(
              `Quantidade ou estoque inválidos para o produto ${productData.nome}.`,
            );
          }

          if (currentStock < quantityToReduce) {
            throw new BadRequestException(
              `Estoque insuficiente para o produto ${productData.nome}.`,
            );
          }

          transaction.update(productRef, {
            estoque: currentStock - quantityToReduce,
          });
        }

        // Atualiza o status do pedido dentro da mesma transação
        transaction.update(orderRef, { status: newStatus });
      });

      // Retorna o pedido atualizado
      const updatedOrderSnap = await orderRef.get();
      return { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };
    }

    // ✅ Quando o novo status é "cancelado" e o anterior era "pago", reabastece o estoque
    if (newStatus === 'cancelado' && currentStatus === 'pago') {
      for (const item of orderData.items) {
        const productRef = db.collection('products').doc(item.productId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
          throw new NotFoundException(
            `Produto ${item.productId} não encontrado.`,
          );
        }

        const productData = productSnap.data();
        if (!productData) {
          throw new BadRequestException(
            `Dados do produto ${item.productId} não encontrados.`,
          );
        }
        const currentStock = Number(productData.estoque);
        const quantityToAdd = Number(item.quantidade);

        if (isNaN(currentStock) || isNaN(quantityToAdd)) {
          throw new BadRequestException(
            `Quantidade ou estoque inválidos para o produto ${productData.nome}.`,
          );
        }

        await productRef.update({
          estoque: currentStock + quantityToAdd,
        });
      }

      // Atualiza o status para cancelado
      await orderRef.update({ status: newStatus });

<<<<<<< HEAD
      const updatedOrderSnap = await orderRef.get();
      return { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };
=======
    // Retorna o pedido atualizado
    const updatedOrderSnap = await orderRef.get();
    return { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };
  }

  // Quando o novo status é "cancelado" e o anterior era "pago", reabastece o estoque
  if (newStatus === 'cancelado' && currentStatus === 'pago') {
    for (const item of orderData.items) {
      const productRef = db.collection('products').doc(item.productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        throw new NotFoundException(`Produto ${item.productId} não encontrado.`);
      }

      const productData = productSnap.data();
      if (!productData) {
        throw new BadRequestException(`Dados do produto ${item.productId} não encontrados.`);
      }
      const currentStock = Number(productData.estoque);
      const quantityToAdd = Number(item.quantidade);

      if (isNaN(currentStock) || isNaN(quantityToAdd)) {
        throw new BadRequestException(`Quantidade ou estoque inválidos para o produto ${productData.nome}.`);
      }

      await productRef.update({
        estoque: currentStock + quantityToAdd,
      });
>>>>>>> 54504d2a0103fe3e3e7dd6b26eef70c76be243bb
    }

    // Caso contrário, apenas atualiza o status normalmente
    await orderRef.update({ status: newStatus });

    const updatedOrderSnap = await orderRef.get();
    return { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };
  }

  async cancelExpiredPendingOrders() {
    const db = this.firebaseService.getFirestore();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const pendingOrdersSnap = await db
      .collection('orders')
      .where('status', '==', 'pendente')
      .where('createdAt', '<=', fiveMinutesAgo)
      .get();

    const batch = db.batch();

    pendingOrdersSnap.forEach((doc) => {
      const orderData = doc.data();
      const orderRef = db.collection('orders').doc(doc.id);

      orderData.items.forEach((item) => {
        const productRef = db.collection('products').doc(item.productId);
        batch.update(productRef, {
          estoque: FieldValue.increment(item.quantidade),
        });
      });

      batch.update(orderRef, { status: 'cancelado' });
    });

    await batch.commit();
  }

  // Função para reduzir estoque dos produtos no pedido
  private async reduceStock(items: OrderItem[]) {
    if (items.length > 0) {
      console.log('Chamando updateQuantity com productId:', items[0].productId);
    }
    for (const item of items) {
      const product = await this.productService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Produto ${item.productId} não encontrado.`,
        );
      }

      const currentStock = Number(product.estoque);
      const quantityToReduce = Number(item.quantidade);

      console.log(
        `Produto: ${product.nome}, Estoque atual: ${currentStock}, Quantidade a reduzir: ${quantityToReduce}`,
      );

      if (isNaN(currentStock) || isNaN(quantityToReduce)) {
        throw new BadRequestException(
          `Quantidade ou estoque inválidos para o produto ${product.nome}.`,
        );
      }

      if (currentStock < quantityToReduce) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${product.nome}.`,
        );
      }

      const newStock = currentStock - quantityToReduce;

      await this.productService.updateQuantity(item.productId, newStock);
    }
  }

  // Função para re-adicionar estoque dos produtos no pedido (cancelamento)
  private async restock(items: OrderItem[]) {
    for (const item of items) {
      const product = await this.productService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Produto ${item.productId} não encontrado.`,
        );
      }

      const currentStock = Number(product.estoque);
      const quantityToAdd = Number(item.quantidade);

      console.log(
        `Produto: ${product.nome}, Estoque atual: ${currentStock}, Quantidade a adicionar: ${quantityToAdd}`,
      );

      if (isNaN(currentStock) || isNaN(quantityToAdd)) {
        throw new BadRequestException(
          `Quantidade ou estoque inválidos para o produto ${product.nome}.`,
        );
      }

      const newStock = currentStock + quantityToAdd;

      await this.productService.updateQuantity(item.productId, newStock);
    }
  }

  async cancel(id: string) {
    const db = this.firebaseService.getFirestore();
    const orderRef = db.collection('orders').doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new NotFoundException(`Pedido ${id} não encontrado.`);
    }

    await orderRef.update({ status: 'cancelado' });

    return { success: true, message: `Pedido ${id} cancelado.` };
  }
}
