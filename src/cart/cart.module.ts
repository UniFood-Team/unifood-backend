import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  providers: [CartService],
  controllers: [CartController],
  exports:[CartService],
})
export class CartModule {}
