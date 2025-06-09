import { BadRequestException } from '@nestjs/common';
import { Controller, Post, Body, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { CartData } from './dtos/cart.dto';
// import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
// @UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // @Post('add')
  // @ApiOperation({ summary: 'Adiciona um produto ao carrinho' })
  // @ApiBody({ type: AddToCartDto })
  // async addToCart(@Req() req, @Body() addToCartDto: AddToCartDto) {
  //   const userId = req.user.uid; 
  //   return this.cartService.addToCart(userId, addToCartDto);
  // }

//para testes, descomentar tudo abaixo

@Post('add')
@ApiOperation({ summary: 'Adiciona um produto ao carrinho' })
@ApiBody({ type: AddToCartDto })
async addToCart(
  @Body() addToCartDto: AddToCartDto & { userId?: string },
  @Req() req,
) {
  // Prioriza userId do corpo (para teste via Swagger), senão pega do token auth
  const userId = addToCartDto.userId ?? req.user?.uid;

  if (!userId) {
    throw new BadRequestException('userId é obrigatório');
  }

  const { productId, quantidade } = addToCartDto;

  return this.cartService.addToCart(userId, { productId, quantidade });
}

@Get()
@ApiOperation({ summary: 'Obtém o carrinho do usuário autenticado' })
async getCart(@Req() req): Promise<CartData> {
  const userId = req.user.uid;
  return this.cartService.getCart(userId);
}

  @Patch('update')
  @ApiOperation({ summary: 'Atualiza a quantidade de um item no carrinho' })
  @ApiBody({ type: UpdateCartItemDto })
  async updateCartItem(@Req() req, @Body() updateCartItemDto: UpdateCartItemDto) {
     const userId = updateCartItemDto.userId ?? req.user?.uid;
    return this.cartService.updateCartItem(userId, updateCartItemDto);
  }
}
