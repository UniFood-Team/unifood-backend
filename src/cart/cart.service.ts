import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { CartItem, CartData } from './dtos/cart.dto';
import { ProductService } from 'src/product/product.service';


@Injectable()
export class CartService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly productService: ProductService,
) {}

async addToCart(userId: string, item: { productId: string; quantity: number }) {
  const { productId, quantity } = item;

  const product = await this.firebaseService.getProductById(productId);

  if (!product) {
    throw new BadRequestException('Produto não encontrado.');
  }
  if (product.preco === undefined || product.preco === null) {
    throw new BadRequestException('Produto não tem preço definido.');
  }
  if (product.estoque === undefined || product.estoque === null) {
    throw new BadRequestException('Produto não tem estoque definido.');
  }

  const cartRef = this.firebaseService.getFirestore().collection('carts').doc(userId);
  const cartDoc = await cartRef.get();

  let items: CartItem[] = [];

  if (cartDoc.exists) {
    const currentData = cartDoc.data() as CartData;
    items = currentData?.items || [];

    const existingIndex = items.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      const newQuantity = items[existingIndex].quantity + quantity;

      if (newQuantity > product.estoque) {
        throw new BadRequestException(`Quantidade solicitada ultrapassa o estoque disponível (${product.estoque}).`);
      }

      items[existingIndex].quantity = newQuantity;
    } else {
      if (quantity > product.estoque) {
        throw new BadRequestException(`Quantidade solicitada ultrapassa o estoque disponível (${product.estoque}).`);
      }
      items.push({
        productId,
        quantity,
        preco: product.preco,
      });
    }
  } else {
    if (quantity > product.estoque) {
      throw new BadRequestException(`Quantidade solicitada ultrapassa o estoque disponível (${product.estoque}).`);
    }
    items = [{
      productId,
      quantity,
      preco: product.preco,
    }];
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.preco,
    0,
  );

  await cartRef.set({ items, subtotal });

  return { message: 'Produto adicionado ao carrinho com sucesso.' };
}



async getCart(userId: string): Promise<CartData> {
    const cartRef = this.firebaseService.getFirestore().collection('carts').doc(userId);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) return { items: [] };
    const cartData: CartData = cartSnap.data() as CartData;
    
    return cartData as CartData;
}

async updateCartItem(userId: string, updateCartItemDto: UpdateCartItemDto) {
  if (!userId) throw new BadRequestException('UserId é obrigatório');

  const cartRef = this.firebaseService.getFirestore().collection('carts').doc(userId);
  const cartSnap = await cartRef.get();

  if (!cartSnap.exists) throw new NotFoundException('Carrinho vazio');

  const cartData: CartData = cartSnap.data() as CartData;

  const itemIndex = cartData.items.findIndex(
    item => item.productId === updateCartItemDto.productId,
  );

  if (itemIndex < 0) throw new NotFoundException('Produto não encontrado no carrinho');

  // Busca o produto usando ProductService
  const product = await this.productService.findById(updateCartItemDto.productId);
  if (!product) throw new NotFoundException('Produto não encontrado');

  if (product.estoque < updateCartItemDto.quantity)
    throw new BadRequestException('Quantidade solicitada maior que o estoque disponível');

  // Atualiza a quantidade do item no carrinho
  cartData.items[itemIndex].quantity = updateCartItemDto.quantity;

  // Recalcula subtotal antes de salvar
  const subtotal = cartData.items.reduce(
    (sum, item) => sum + item.quantity * item.preco,
    0,
  );
cartData.subtotal = subtotal;

  await cartRef.set({ ...cartData, subtotal }, { merge: true });
  

  return { message: 'Carrinho atualizado com sucesso', cart: cartData };
}
}