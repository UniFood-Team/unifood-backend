export interface CartItem {
  productId: string;
  quantidade: number;
  preco: number;
}

export interface CartData {
  items: CartItem[];
  subtotal?:number;
}
