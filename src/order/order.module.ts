import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [ProductModule, CartModule], // Importa para usar os serviços dentro do OrderService
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
