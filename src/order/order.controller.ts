import { Controller, Get, Post, Body, Patch, Param, Delete, MethodNotAllowedException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('finalize')
  @ApiOperation({ summary: 'Finaliza o pedido a partir do carrinho do usuário' })
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
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

    @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancela um pedido pelo usuário' })
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    throw new MethodNotAllowedException('Pedidos não podem ser deletados');
  }
}