import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID do usuário que está finalizando o pedido' })
  @IsString()
  userId: string;
}
