import { IsString } from 'class-validator';

export class AddOrderToCartDto {
@IsString()
  userId: string;
}