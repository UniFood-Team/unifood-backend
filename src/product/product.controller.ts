import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductDto } from './dto/list-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() query: ListProductDto) {
    const queryObj = {
      categorias: query.categorias?.split(',').map((c) => c.trim()) || [],
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      disponibilidade: query.disponibilidade === 'true',
      avaliacaoMinima: query.avaliacaoMinima
        ? parseFloat(query.avaliacaoMinima)
        : undefined,
    };

    return this.productService.findAll(queryObj);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const uid = req['user']?.uid || 'desconhecido';
    return this.productService.remove(id, uid);
  }
}
