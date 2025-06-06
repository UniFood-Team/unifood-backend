export interface CartItem {
  productId: string;
  quantidade: number;
}

export interface CartData {
  items: CartItem[];
  subtotal?:number;
}
