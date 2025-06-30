import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CartItem {
  @ApiProperty({ description: 'ID do produto', example: 'prod1' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantidade do produto', example: 2 })
  @IsNumber()
  quantidade: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID do usuário que está finalizando o pedido',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [CartItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  items: CartItem[];

  @ApiPropertyOptional({
    description: 'ID do cupom de desconto aplicado ao pedido',
    example: 'coupon123',
  })
  @IsString()
  couponId?: string;
}
export type OrderItem = {
  productId: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
};
