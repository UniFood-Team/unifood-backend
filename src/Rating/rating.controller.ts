import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@ApiTags('rating')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma avaliação' })
  @ApiBody({ type: CreateRatingDto })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso.' })
  createRating(@Body() dto: CreateRatingDto) {
    return this.ratingService.createRating(dto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Listar avaliações de um produto' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações do produto.' })
  listProductRatings(@Param('productId') productId: string) {
    return this.ratingService.listRatings('product', productId);
  }

  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'Listar avaliações de um vendedor' })
  @ApiParam({ name: 'sellerId', description: 'ID do vendedor' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações do vendedor.' })
  listSellerRatings(@Param('sellerId') sellerId: string) {
    return this.ratingService.listRatings('vendedor', sellerId);
  }

}
