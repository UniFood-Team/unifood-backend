export interface CartItem {
  productId: string;
  quantity: number;
  preco: number;
}

export interface CartData {
  items: CartItem[];
  subtotal?:number;
}
