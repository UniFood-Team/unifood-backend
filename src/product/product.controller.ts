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
import { UpdateQuantityDto } from './dto/update-stock-product.dto';
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
  // converter strings para tipos corretos
  const categorias = query.categorias?.split(',').map(c => c.trim()) || [];
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
  const disponibilidade = query.disponibilidade === 'true';
  const avaliacaoMinima = query.avaliacaoMinima ? parseFloat(query.avaliacaoMinima) : undefined;

  return this.productService.findAll({
    categorias,
    minPrice,
    maxPrice,
    disponibilidade,
    avaliacaoMinima,
  });
}


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Patch(':id/quantity')
  async updateQuantity(
    @Param('id') id: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const { quantidade } = updateQuantityDto;
    return this.productService.updateQuantity(id, quantidade);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const uid = req['user']?.uid || 'desconhecido';
    return this.productService.remove(id, uid);
  }
}
