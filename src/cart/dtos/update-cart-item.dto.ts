import { IsNotEmpty, IsString, IsNumber, Min, IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
   @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'ID do produto a ser atualizado' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Nova quantidade do produto', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantidade: number;

}
