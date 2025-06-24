import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Req,
  Param,
  Delete,
  MethodNotAllowedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('finalize')
  @ApiOperation({
    summary: 'Finaliza o pedido a partir do carrinho do usuário',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos' })
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes de um pedido específico' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza informações de um pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Lista o histórico de pedidos do usuário autenticado',
  })
  getHistory(@Req() req: Request) {
    const userId = req['user']?.uid;
    return this.orderService.getOrderHistory(userId);
  }

  @Get(':id/details')
  @ApiOperation({
    summary:
      'Busca detalhes de um pedido específico para o usuário autenticado',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  getDetails(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user']?.uid;
    return this.orderService.getOrderDetails(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancela um pedido pelo usuário' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Não permite deletar pedidos' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  remove(@Param('id') id: string) {
    throw new MethodNotAllowedException('Pedidos não podem ser deletados');
  }
}
