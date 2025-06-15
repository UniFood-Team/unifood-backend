import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'Tipo da avaliação',
    enum: ['product', 'vendedor'],
    example: 'product',
  })
  @IsEnum(['product', 'vendedor'])
  type: 'product' | 'vendedor';

  @ApiProperty({
    description: 'ID do item avaliado (produto ou vendedor)',
    example: 'abc123-target-id',
  })
  @IsString()
  targetId: string;

  @ApiProperty({
    description: 'ID do usuário que faz a avaliação',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Nota da avaliação (de 1 a 5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Comentário opcional da avaliação',
    example: 'Produto excelente, chegou rápido!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'ID do pedido associado à avaliação',
    example: 'abc123-order-id',
  })
  @IsString()
  orderId: string;
}
