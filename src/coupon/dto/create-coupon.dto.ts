import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ description: 'ID do usuário que está recebendo o cupom' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Desconto em reais' })
  @IsNumber()
  discount: number;
}
