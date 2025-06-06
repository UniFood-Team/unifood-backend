export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  categorias: string[];
  avaliacaoMedia?: number;
  [key: string]: any;
}
