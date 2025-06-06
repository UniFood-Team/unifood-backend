import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { OrderService } from '../order/order.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(private readonly orderService: OrderService) {}

  onModuleInit() {
    // Roda a cada 30 segundos
    cron.schedule('*/30 * * * * *', async () => {
      console.log('[CRON] Verificando pedidos pendentes vencidos...');
      await this.orderService.cancelExpiredPendingOrders();
    });
  }
}
