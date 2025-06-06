import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @IsIn(['pendente', 'pago', 'cancelado', 'entregue'])
  status?: string;
}
