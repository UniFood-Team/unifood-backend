import { IsNotEmpty, IsString, IsNumber, Min, IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'ID do produto a ser adicionado' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantidade do produto', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
