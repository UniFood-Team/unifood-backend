import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Brigadeiro' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  preco: number;

  @ApiProperty({ example: 'Brigadeiro dos melhores sabores' })
  @IsString()
  descricao: string;

  @ApiProperty({ example: 'zAox77OCHYWJ1zBY6CATA11boGa2' })
  @IsString()
  sellerId: string;

  @ApiProperty({
    example: 'https://i.panelinha.com.br/i1/228-q-2859-brigadeiro.webp',
  })
  @IsString()
  imagemUrl: string;

  @ApiProperty()
  @IsArray()
  categorias: string[];
}
